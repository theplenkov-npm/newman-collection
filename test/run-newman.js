const newman = require("newman");
const { collection } = require("./postman-echo/postman-echo");

newman.run({
  collection: collection.toObjectResolved(),
  reporters: ["cli"]
});
