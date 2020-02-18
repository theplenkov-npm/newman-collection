const { Item } = require("../../index");

module.exports = new Item("Test GET request")
  .get("https://postman-echo.com/get?foo1=bar1&foo2=bar2")
  .pm.test("This is test A", () => {
    pm.response.to.be.ok;
  })
  .pm.test("This is test B", () => {
    pm.response.to.be.ok;
  });
