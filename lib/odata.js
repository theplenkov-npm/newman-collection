const { Item } = require("newman-collection");

class OdataLogin extends Item {
  request(...args) {
    return super
      .request(...args)
      .headers({ "X-CSRF-Token": "fetch" })
      .pm.test("Token must be fetched", () => {
        pm.response.to.be.ok;
        pm.response.to.have.header("x-csrf-token");
        pm.variables.set(
          "x-csrf-token",
          pm.response.headers.get("x-csrf-token")
        );
      });
  }
}

class OdataCall extends Item {
  request(...args) {
    return super.request(...args).headers({
      "X-CSRF-Token": "{{x-csrf-token}}",
      Accept: "application/json"
    });
  }
}

module.exports = { OdataLogin, OdataCall };
