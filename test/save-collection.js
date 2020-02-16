const fs = require("fs");
const { collection } = require("./postman-echo/postman-echo");

fs.writeFileSync(
  "test/results/postman-echo.collection.json",
  JSON.stringify(collection.toJSON())
);
