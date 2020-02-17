const { NewmanCollectionItem } = require("../../index");

module.exports = NewmanCollectionItem.new("Test POST request")
  .post("https://postman-echo.com/post")
  .headers({ "Content-Type": "text/plain" })
  .body("test")
  .pm.test("body should be same", () => {
    pm.response.to.have.jsonBody("data", "test");
  });
