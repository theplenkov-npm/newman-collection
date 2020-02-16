const { NewmanCollection } = require("../index");
const newman = require("newman");

let scenario = new NewmanCollection();

scenario
  .item("Test GET request")
  .get("https://postman-echo.com/get?foo1=bar1&foo2=bar2")
  .on({
    test() {
      console.log("Test is reached");
    }
  });

newman.run({
  collection: scenario.collection.toObjectResolved(),
  reporters: ["cli"]
});
