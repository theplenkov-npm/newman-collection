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

interface INewmanEventEmitter {
  on(events: INewmanEvents): INewmanEventEmitter;
}

interface INewmanRequestAuthBasic {
  user: string;
  password: string;
}

interface INewmanRequest extends INewmanEventEmitter {
  body(body: string): INewmanRequest;
  on(events: INewmanEvents): INewmanRequest;
  headers(headers: object): INewmanRequest;
}

interface NewmanRequestCall {
  (sUrl: string): INewmanRequest;
}

interface INewmanItem {
  get: NewmanRequestCall;
  post: NewmanRequestCall;
  head: NewmanRequestCall;
  options: NewmanRequestCall;
  put: NewmanRequestCall;
  delete: NewmanRequestCall;
  patch: NewmanRequestCall;
}

//function valueMap(values:object):{}

class NewmanRequestAuth {
  auth: RequestAuthDefinition;
  constructor(auth: RequestAuthDefinition) {
    this.auth = auth;
  }
  basic(basic: INewmanRequestAuthBasic) {
    // this.auth.
    //     Object.assign(this.auth, {
    //       type: "basic",
    //       basic: Object.keys(basic).map()
    //     });
  }
}

class NewmanRequest implements INewmanRequest {
  request: Request;
  item: Item;
  constructor(request: Request, item: Item) {
    this.request = request;
    this.item = item;
  }
  // auth(auth: NewmanRequestAuth):NewmanRequest {
  //   Object.assign(this.request.auth, auth);
  //   return this;
  // },
  on(events: INewmanEvents): INewmanRequest {
    Object.keys(events).forEach(key => {
      this.item.events.append(
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
}

class NewmanCollectionItem implements INewmanItem {
  item: Item;
  constructor(item: ItemDefinition) {
    this.item = new Item(item);
  }
  request(request: RequestDefinition): INewmanRequest {
    Object.assign(this.item.request, request);
    return new NewmanRequest(this.item.request, this.item);
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
  constructor(collection: CollectionDefinition) {
    this.collection = new Collection(collection);
  }
  item(name: string): NewmanCollectionItem {
    let item = new NewmanCollectionItem({ name });
    this.collection.items.append(item.item);
    return item;
  }
}
