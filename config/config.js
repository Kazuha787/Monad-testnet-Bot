require("dotenv").config();
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "config.json");
const configJson = JSON.parse(fs.readFileSync(configPath, "utf8"));

const config = {
  ...configJson,
  network: {
    ...configJson.network,
    rpc: process.env.RPC_URL || configJson.network.rpc,
  },
  privateKeyPath:
    process.env.PRIVATE_KEY_PATH || path.join(__dirname, "../private.key"),
};

module.exports = config;
