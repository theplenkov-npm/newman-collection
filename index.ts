/// <reference path="node_modules/postman-collection/types/index.d.ts"/>
import {
  Collection,
  //CollectionDefinition,
  Item,
  //ItemDefinition,
  Request,
  //RequestDefinition,
  Event,
  RequestAuth,
  Script,
  RequestBody,
} from "postman-collection";

type CollectionDefinition = Collection.definition;
type ItemDefinition = Item.definition;
type RequestDefinition = Request.definition;

//import * as ps from "postman-collection/types";
import { type } from "os";
import { format } from "path";

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
    this.collection = collection.collection;
  }
  basic(basic) {
    this.collection.authorizeRequestsUsing({ type: "basic" });
    this.collection.auth.update(
      Object.keys(basic).map((key) => ({ key, value: basic[key] }))
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
    let auth: RequestAuth;

    if (postman_element instanceof Collection) {
      postman_element.authorizeRequestsUsing({ type: "basic" });
      auth = postman_element.auth;
    } else if (postman_element instanceof Item) {
      postman_element.authorizeRequestUsing({ type: "basic" });
      auth = postman_element.getAuth();
    } else if (postman_element instanceof Request) {
      postman_element.authorizeUsing({ type: "basic" });
      auth = postman_element.auth;
    }

    auth.update(Object.keys(basic).map((key) => ({ key, value: basic[key] })));
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
      Object.keys(basic).map((key) => ({ key, value: basic[key] }))
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
class NewmanCollection
  extends NewmanCollectionElement
  implements INewmanCollection
{
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
      items.forEach((element) => this.collection.items.append(element.item));
  }
  get auth() {
    return new NewmanAuthCollection(this);
  }
}

class NewmanItemElement
  extends NewmanCollectionElement
  implements INewmanItemElement
{
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

    if (typeof def === "string") {
      this.item = new Item();
      this.item.name = def;
    } else {
      this.item = new Item(def);
    }
  }
  private request(def: Partial<RequestDefinition>): INewmanRequest {
    let request = new NewmanRequest(def as RequestDefinition, this);
    this.item.request = request.request;
    return request;
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
        script: new Script({
          exec: /(?<={).*(?=}$)/s
            .exec(callback.toString())
            .map((code) => code.split("\r\n"))
            .flat(),
        }),
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
  request: Request;

  constructor(request: Request.definition, item: INewmanItem) {
    super();
    this.request = new Request(request);
    this.newman_item = item;
    this.item = this.newman_item.item;
  }
  get on(): INewmanScript {
    return new NewmanScript(this);
  }
  body(body: string | object): INewmanRequest {
    // this.request.body.update({
    //   mode: "raw",
    //   raw:
    //     typeof body === "object"
    //       ? this.headers({ "Content-Type": "application/json" }) &&
    //         JSON.stringify(body)
    //       : body,
    // });

    this.request.body = new RequestBody({
      mode: "raw",
      raw:
        typeof body === "object"
          ? this.headers({ "Content-Type": "application/json" }) &&
            JSON.stringify(body)
          : body,
    });

    return this;
  }
  headers(headers: object): INewmanRequest {
    Object.keys(headers).forEach((key) =>
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
            script: new Script({
              exec: [`pm.test(\"${description}\", ${callback.toString()});`]
                .map((code) => code.split("\r\n"))
                .flat(),
            }),
          })
        );

        return this;
      },
    };
  }
}

export { NewmanCollection as Collection, NewmanCollectionItem as Item };
