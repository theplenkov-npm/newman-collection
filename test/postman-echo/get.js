const { NewmanCollectionItem } = require("../../index");

module.exports = NewmanCollectionItem.new("Test GET request");

module.exports.get("https://postman-echo.com/get?foo1=bar1&foo2=bar2").on({
  test() {
    console.log("Test is reached");
  }
});
