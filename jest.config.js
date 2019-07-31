const { pathsToModuleNameMapper } = require("ts-jest/utils");

const { compilerOptions } = require("./tsconfig.json");
const { defaults } = require("jest-config");
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths)
  // transform: {
  //   "\\.ts$": "babel-jest"
  // },
  // moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"]
};
