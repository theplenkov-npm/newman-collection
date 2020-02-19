import {
  Collection,
  CollectionDefinition,
  Item,
  ItemDefinition,
  Request,
  RequestDefinition,
  Event
} from "postman-collection";

// Basic Auth data
interface INewmanAuthBasic {
  username: string;
  password: string;
}

// auth interface
interface INewmanAuth {
  basic(basic: INewmanAuthBasic): void;
}

// pm interface ( basically add-on to ) on.test
interface INewmanPmAPI {
  test(desription: string, callback: Function): INewmanRequest;
}

interface INewmanCollectionElement {
  newman_collection: INewmanCollection;
  auth: INewmanAuth;
}

interface INewmanCollection extends INewmanCollectionElement {
  collection: Collection;
}

// Element which can have reference to item ( including item itself )
interface INewmanItemElement extends INewmanCollectionElement {
  newman_item: INewmanItem;
  item: Item;
}

// Request factory
interface INewmanRequestFactory {
  (sUrl: string): INewmanRequest;
}

// Newman Item interface
interface INewmanItem extends INewmanItemElement {
  get: INewmanRequestFactory;
  post: INewmanRequestFactory;
  head: INewmanRequestFactory;
  options: INewmanRequestFactory;
  put: INewmanRequestFactory;
  delete: INewmanRequestFactory;
  patch: INewmanRequestFactory;
  item: Item;
}

// postman script types
// https://github.com/postmanlabs/newman#newmanrunevents
interface INewmanScript {
  test(desription: string, callback: Function): INewmanRequest;
  prerequest(desription: string, callback: Function): INewmanRequest;
}

// Request entity
interface INewmanRequest extends INewmanItemElement {
  request: Request;
  body(body: string): INewmanRequest;
  on: INewmanScript;
  //on(events: INewmanEvents): INewmanRequest;
  headers(headers: object): INewmanRequest;
  pm: INewmanPmAPI;
}

class NewmanCollectionAuth implements INewmanAuth {
  collection: Collection;
  newman_collection: INewmanCollection;
  constructor(collection: INewmanCollection) {
    this.newman_collection = collection;
    this.collection = { collection };
  }
  basic(basic) {
    this.collection.authorizeUsing({ type: "basic" });
    this.collection.auth.update(
      Object.keys(basic).map(key => ({ key, value: basic[key] }))
    );
    return this.newman_collection;
  }
}

class NewmanAuth implements INewmanAuth {
  newman_element: INewmanCollectionElement;
  constructor(newman_element: INewmanCollectionElement) {
    this.newman_element = newman_element;
  }
  get postman_element(): Collection | Item | Request {
    return this.newman_element instanceof NewmanCollection
      ? (this.newman_element as INewmanCollection).collection
      : this.newman_element instanceof NewmanCollectionItem
      ? (this.newman_element as NewmanCollectionItem).item
      : (this.newman_element as INewmanRequest).request;
  }
  basic(basic) {
    let { postman_element } = this;

    postman_element.authorizeUsing({ type: "basic" });
    postman_element.auth.update(
      Object.keys(basic).map(key => ({ key, value: basic[key] }))
    );
    return this.newman_element;
  }
}

class NewmanAuthCollection extends NewmanAuth {
  newman_element: INewmanCollection;
  get collection(): Collection {
    return this.newman_element.collection;
  }
  basic(basic) {
    this.collection.authorizeRequestsUsing(
      "basic",
      Object.keys(basic).map(key => ({ key, value: basic[key] }))
    );
    return this.newman_element;
  }
}

class NewmanCollectionElement implements INewmanCollectionElement {
  newman_collection: INewmanCollection;
  //auth: INewmanAuth;
  // constructor() {
  //   this.auth = new NewmanAuth(this);
  // }
  get auth() {
    return new NewmanAuth(this);
  }
}

// Collection
class NewmanCollection extends NewmanCollectionElement
  implements INewmanCollection {
  collection: Collection;
  constructor(
    collection?: CollectionDefinition | Array<INewmanItemElement>,
    items?: Array<INewmanItem>
  ) {
    super();
    this.collection = new Collection(
      typeof collection === "object"
        ? (collection as CollectionDefinition)
        : undefined
    );
    this.items = Array.isArray(collection)
      ? (collection as Array<INewmanItem>)
      : items;
  }
  set items(items: Array<INewmanItem>) {
    items &&
      items.forEach(element => this.collection.items.append(element.item));
  }
  get auth() {
    return new NewmanAuthCollection(this);
  }
}

class NewmanItemElement extends NewmanCollectionElement
  implements INewmanItemElement {
  newman_item: INewmanItem;
  item: Item;
  // get item() {
  //   return this.newman_item.item;
  // }
}

// Collection item
class NewmanCollectionItem extends NewmanItemElement implements INewmanItem {
  //item: Item;
  constructor(def: ItemDefinition | string) {
    super();
    this.item = new Item(
      typeof def === "string" ? { name: def } : (def as ItemDefinition)
    );
  }
  private request(request: RequestDefinition): INewmanRequest {
    Object.assign(this.item.request, request);
    return new NewmanRequest(this.item.request, this);
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

// script interface ( prerequest and test )
class NewmanScript implements INewmanScript {
  request: INewmanRequest;
  constructor(request: INewmanRequest) {
    this.request = request;
  }
  private event(callback, type) {
    this.request.item.events.append(
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
class NewmanRequest extends NewmanItemElement implements INewmanRequest {
  get item() {
    return this.newman_item.item;
  }
  request: Request;

  constructor(request: Request, item: INewmanItem) {
    super();
    this.request = request;
    this.newman_item = item;
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
  get pm(): INewmanPmAPI {
    return {
      test: (description, callback) => {
        this.item.events.append(
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

export { NewmanCollection as Collection, NewmanCollectionItem as Item };
