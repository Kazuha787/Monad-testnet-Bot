const fs = require("fs");
const { ethers } = require("ethers");
const path = require("path");
const config = require("../../config/config");
const GlobalLogger = require("./GlobalLogger");

class Utils {
  static getPrivateKey() {
    try {
      return fs.readFileSync(config.privateKeyPath, "utf8").trim();
    } catch (error) {
      throw new Error(`Failed to read private key: ${error.message}`);
    }
  }

  static getRandomAmount() {
    const { min, max } = config.cycles.amounts;
    const amount = Math.random() * (max - min) + min;
    return ethers.parseEther(amount.toFixed(4));
  }

  static getRandomDelay() {
    const { min, max } = config.cycles.delays;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static formatAmount(amount) {
    return parseFloat(ethers.formatEther(amount)).toFixed(4);
  }

  static logTransaction(hash) {
    return `${config.network.explorer}${hash}`;
  }

  static logger(type, message) {
    return GlobalLogger.log(type, message);
  }
}

module.exports = Utils;
