const { NewmanCollection } = require("../../index");

module.exports = new NewmanCollection();
module.exports.items = [
  require("./get"),
  require("./post"),
  require("./basic_auth")
];
