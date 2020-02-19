const { Collection } = require("../../index");

module.exports = new Collection([
  require("./get"),
  require("./post"),
  require("./post_json"),
  require("./basic_auth"),
  require("./basic_auth_inherited")
]).auth.basic({ username: "postman", password: "password" });
