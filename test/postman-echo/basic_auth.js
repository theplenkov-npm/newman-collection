const { NewmanCollectionItem } = require("../../index");

module.exports = NewmanCollectionItem.new("Test basic auth");

module.exports
  .get("https://postman-echo.com/basic-auth")
  .auth.basic({ username: "postman", password: "password" })
  .pm.test("Must be authenticated", () => {
    pm.response.to.have.jsonBody("authenticated", true);
  });
