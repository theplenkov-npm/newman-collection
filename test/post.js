const { NewmanCollection } = require("../index");
const newman = require("newman");

let scenario = new NewmanCollection();

scenario
  .item("Test POST request")
  .post("https://postman-echo.com/post")
  .headers({ "Content-Type": "text/plain" })
  .body("test")
  .on({
    test() {
      pm.test("body should be same", () => {
        pm.response.to.have.jsonBody("data", "test");
      });
    }
  });

newman.run({
  collection: scenario.collection.toObjectResolved(),
  reporters: ["cli"]
});
