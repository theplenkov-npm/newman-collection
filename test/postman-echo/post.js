const { NewmanCollectionItem } = require("../../index");

module.exports = NewmanCollectionItem.new("Test POST request");

module.exports
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
