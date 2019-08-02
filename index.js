"use strict";

if (process.env.NODE_ENV === "production") {
  module.exports = require("./dist/typepicker.production.js");
} else {
  module.exports = require("./dist/typepicker.development.js");
}
