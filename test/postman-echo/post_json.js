const { Item } = require("../../index");
module.exports = new Item("Test POST request with JSON data")
  .post("https://postman-echo.com/post")
  .body({ test: true })
  .pm.test("Should return JSON back", () => {    
    let body = pm.response.json();    
    pm.response.to.have.jsonBody("data.test", true);
  });
