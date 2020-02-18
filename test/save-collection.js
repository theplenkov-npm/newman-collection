const fs = require("fs");
const { collection } = require("./postman-echo/postman-echo");

fs.writeFileSync(
  "test/results/postman-echo.collection.json",
  JSON.stringify(collection.toJSON())
);

fs.writeFileSync(
  "test/results/postman-echo.globals.json",
  JSON.stringify({
    values: [{ key: "host", value: "https://postman-echo.com" }]
  })
);
