const { NewmanCollection } = require("../../index");

module.exports = new NewmanCollection([
  require("./get"),
  require("./post"),
  require("./basic_auth")
]);
