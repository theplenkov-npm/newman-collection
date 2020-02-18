const { Item } = require("../../index");

module.exports = new Item("Test POST request")
  .post("https://postman-echo.com/post")
  .headers({ "Content-Type": "text/plain" })
  .body("test")
  .pm.test("body should be same", () => {
    pm.response.to.have.jsonBody("data", "test");
  });
