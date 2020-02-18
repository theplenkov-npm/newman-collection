const { Item } = require("../../index");

module.exports = new Item("Test basic auth")
  .get("{{host}}/basic-auth")
  .auth.basic({ username: "postman", password: "password" })
  .on.prerequest(() => {
    console.log("prerequest is triggered");
  })
  .on.test(() => {
    console.log("test is triggered");
  })
  .pm.test("Must be authenticated", () => {
    pm.response.to.have.jsonBody("authenticated", true);
  });
