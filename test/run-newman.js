const newman = require("newman");
const { collection } = require("./postman-echo/postman-echo");

newman.run({
  collection: collection,
  reporters: ["cli"],
  globals: {
    name: "postman-echo",
    values: [{ key: "host", value: "https://postman-echo.com" }]
  }
});
