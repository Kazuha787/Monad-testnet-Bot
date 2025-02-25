const { ethers } = require("ethers");
const config = require("../../config/config");
const Utils = require("./Utils");

class Provider {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.initialize();
  }

  initialize() {
    try {
      this.provider = new ethers.JsonRpcProvider(config.network.rpc);
      const privateKey = Utils.getPrivateKey();
      if (!privateKey) {
        throw new Error("Private key not found");
      }
      this.wallet = new ethers.Wallet(privateKey, this.provider);
    } catch (error) {
      throw new Error(`Provider initialization failed: ${error.message}`);
    }
  }

  getProvider() {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }
    return this.provider;
  }

  getWallet() {
    if (!this.wallet) {
      throw new Error("Wallet not initialized");
    }
    return this.wallet;
  }

  async ensureConnection() {
    try {
      const network = await this.provider.getNetwork();
      return true;
    } catch (error) {
      Utils.logger("error", `Network connection failed: ${error.message}`);
      return false;
    }
  }
}

let providerInstance = null;

module.exports = {
  getInstance: () => {
    if (!providerInstance) {
      providerInstance = new Provider();
    }
    return providerInstance;
  },
};
