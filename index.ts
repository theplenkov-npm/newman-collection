import {
  Collection,
  CollectionDefinition,
  Item,
  ItemDefinition,
  Request,
  RequestDefinition,
  Event
} from "postman-collection";

// postman script types
// https://github.com/postmanlabs/newman#newmanrunevents
interface INewmanScript {
  test(desription: string, callback: Function): INewmanRequest;
  prerequest(desription: string, callback: Function): INewmanRequest;
}

// Basic Auth data
interface INewmanRequestAuthBasic {
  username: string;
  password: string;
}

// auth interface
interface INewmanRequestAuth {
  basic(basic: INewmanRequestAuthBasic): void;
}

// pm interface ( basically add-on to ) on.test
interface INewmanPmAPI {
  test(desription: string, callback: Function): INewmanRequest;
}

// Request entity
interface INewmanRequest extends INewmanItemElement {
  request: Request;
  postman_item: Item;
  body(body: string): INewmanRequest;
  on: INewmanScript;
  //on(events: INewmanEvents): INewmanRequest;
  headers(headers: object): INewmanRequest;
  auth: INewmanRequestAuth;
  pm: INewmanPmAPI;
}

// Request factory
interface NewmanRequestCall {
  (sUrl: string): INewmanRequest;
}

// Element which can have reference to item ( including item itself )
interface INewmanItemElement {
  item: INewmanItem;
}

// Newman Item interface
interface INewmanItem extends INewmanItemElement {
  get: NewmanRequestCall;
  post: NewmanRequestCall;
  head: NewmanRequestCall;
  options: NewmanRequestCall;
  put: NewmanRequestCall;
  delete: NewmanRequestCall;
  patch: NewmanRequestCall;
  postman_item: Item;
}

// auth instance
class NewmanRequestAuth implements INewmanRequestAuth {
  request: INewmanRequest;
  constructor(request: INewmanRequest) {
    this.request = request;
  }
  basic(basic: INewmanRequestAuthBasic) {
    let { request } = this.request;
    request.authorizeUsing({ type: "basic" });
    request.auth.update(
      Object.keys(basic).map(key => ({ key, value: basic[key] }))
    );

    return this.request;
  }
}

// script interface ( prerequest and test )
class NewmanScript implements INewmanScript {
  request: INewmanRequest;
  constructor(request: INewmanRequest) {
    this.request = request;
  }
  get postman_item() {
    return this.request.postman_item;
  }
  private event(callback, type) {
    this.postman_item.events.append(
      new Event({
        listen: "test",
        script: {
          exec: /(?<={).*(?=}$)/s
            .exec(callback.toString())
            .map(code => code.split("\r\n"))
            .flat()
        }
      })
    );

    return this.request;
  }
  test(callback) {
    return this.event(callback, "test");
  }
  prerequest(callback) {
    return this.event(callback, "prerequest");
  }
}

// request instance
class NewmanRequest implements INewmanRequest {
  request: Request;
  get postman_item() {
    return this.item.postman_item;
  }
  item: INewmanItem;

  constructor(request: Request, item: INewmanItem) {
    this.request = request;
    this.item = item;
  }
  get on(): INewmanScript {
    return new NewmanScript(this);
  }
  body(raw: string): INewmanRequest {
    this.request.update({ body: { mode: "raw", raw: raw } });
    return this;
  }
  headers(headers: object): INewmanRequest {
    Object.keys(headers).forEach(key =>
      this.request.addHeader({ key, value: headers[key] })
    );
    return this;
  }
  get auth(): INewmanRequestAuth {
    return new NewmanRequestAuth(this);
  }
  get pm(): INewmanPmAPI {
    return {
      test: (description, callback) => {
        this.postman_item.events.append(
          new Event({
            listen: "test",
            script: {
              exec: [`pm.test(\"${description}\", ${callback.toString()});`]
                .map(code => code.split("\r\n"))
                .flat()
            }
          })
        );

        return this;
      }
    };
  }
}

// Collection item
class NewmanCollectionItem implements INewmanItem {
  postman_item: Item;
  constructor(def: ItemDefinition | string) {
    this.postman_item = new Item(
      typeof def === "string" ? { name: def } : (def as ItemDefinition)
    );
  }
  get item() {
    return this;
  }
  request(request: RequestDefinition): INewmanRequest {
    Object.assign(this.postman_item.request, request);
    return new NewmanRequest(this.postman_item.request, this);
  }
  get(url: string) {
    return this.request({ url, method: "GET" });
  }
  post(url: string) {
    return this.request({ url, method: "POST" });
  }
  head(url: string) {
    return this.request({ url, method: "HEAD" });
  }
  options(url: string) {
    return this.request({ url, method: "OPTIONS" });
  }
  put(url: string) {
    return this.request({ url, method: "PUT" });
  }
  delete(url: string) {
    return this.request({ url, method: "DELETE" });
  }
  patch(url: string) {
    return this.request({ url, method: "PATCH" });
  }
}

// Collection
class NewmanCollection {
  collection: Collection;
  constructor(
    collection?: CollectionDefinition | Array<INewmanItemElement>,
    items?: Array<INewmanItemElement>
  ) {
    this.collection = new Collection(
      typeof collection === "object"
        ? (collection as CollectionDefinition)
        : undefined
    );
    this.items = Array.isArray(collection)
      ? (collection as Array<NewmanCollectionItem>)
      : items;
  }
  set items(items: Array<INewmanItemElement>) {
    items &&
      items.forEach(element =>
        this.collection.items.append(element.item.postman_item)
      );
  }
}

export { NewmanCollection as Collection, NewmanCollectionItem as Item };
