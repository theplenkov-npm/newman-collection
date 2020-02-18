const { Collection } = require("../../index");

module.exports = new Collection([
  require("./get"),
  require("./post"),
  require("./basic_auth")
]);
