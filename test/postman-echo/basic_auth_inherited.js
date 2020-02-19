const { Item } = require("../../index");

module.exports = new Item("Test basic auth")
  .get("{{host}}/basic-auth")
  .pm.test(
    "Must be authenticated using credentials from the collection ",
    () => {
      pm.response.to.have.jsonBody("authenticated", true);
    }
  );
