import {
  Collection,
  CollectionDefinition,
  Item,
  ItemDefinition,
  Request,
  RequestDefinition,
  RequestAuthDefinition,
  Event
} from "postman-collection";

interface INewmanEvents {
  test: void;
}

// interface INewmanEventEmitter {
//   on(events: INewmanEvents): INewmanEventEmitter;
// }

interface INewmanRequestAuthBasic {
  username: string;
  password: string;
}

interface INewmanRequestAuth {
  basic(basic: INewmanRequestAuthBasic): void;
}

interface INewmanPmAPI {
  test(desription: string, callback: Function): INewmanRequest;
}

interface INewmanRequest extends INewmanItemElement {
  request: Request;
  postman_item: Item;
  body(body: string): INewmanRequest;
  on(events: INewmanEvents): INewmanRequest;
  headers(headers: object): INewmanRequest;
  auth: INewmanRequestAuth;
  pm: INewmanPmAPI;
}

interface NewmanRequestCall {
  (sUrl: string): INewmanRequest;
}

interface INewmanItemElement {
  //extends INewmanEventEmitter
  item: INewmanItem;
}

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

//function valueMap(values:object):{}

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
  // auth(auth: NewmanRequestAuth):NewmanRequest {
  //   Object.assign(this.request.auth, auth);
  //   return this;
  // },
  on(events: INewmanEvents): INewmanRequest {
    Object.keys(events).forEach(key => {
      this.postman_item.events.append(
        new Event({
          listen: key,
          script: {
            exec: /(?<={).*(?=}$)/s
              .exec(events[key].toString())
              .map(code => code.split("\r\n"))
              .flat()
          }
        })
      );
    });
    return this;
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

export class NewmanCollectionItem implements INewmanItem {
  postman_item: Item;
  constructor(def: ItemDefinition) {
    this.postman_item = new Item(def);
  }
  get item() {
    return this;
  }
  static new(name: string): NewmanCollectionItem {
    return new NewmanCollectionItem({ name });
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
  // on(events: INewmanEvents): NewmanItem {
  //   debugger;
  //   return this;
  // }
}

export class NewmanCollection {
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
  item(name: string): NewmanCollectionItem {
    let item = new NewmanCollectionItem({ name });
    this.collection.items.append(item.postman_item);
    return item;
  }
  set items(items: Array<INewmanItemElement>) {
    items &&
      items.forEach(element =>
        this.collection.items.append(element.item.postman_item)
      );
  }
}
