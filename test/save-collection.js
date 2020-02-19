const fs = require("fs");
const { collection } = require("./postman-echo/postman-echo");

fs.writeFileSync(
  `${__dirname}/results/postman-echo.collection.json`,
  JSON.stringify(collection.toJSON())
);

fs.writeFileSync(
  `${__dirname}/results/postman-echo.globals.json`,
  JSON.stringify({
    values: [{ key: "host", value: "https://postman-echo.com" }]
  })
);
