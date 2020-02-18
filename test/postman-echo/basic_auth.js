const { Item } = require("../../index");

module.exports = new Item("Test basic auth")
  .get("https://postman-echo.com/basic-auth")
  .auth.basic({ username: "postman", password: "password" })
  .pm.test("Must be authenticated", () => {
    pm.response.to.have.jsonBody("authenticated", true);
  });
