const { ethers } = require("ethers");
const Provider = require("../core/Provider").getInstance;
const Utils = require("../core/Utils");

class ContractBase {
  constructor(address, abi) {
    const provider = Provider();
    this.address = address;
    this.provider = provider.getProvider();
    this.wallet = provider.getWallet();
    this.contract = new ethers.Contract(address, abi, this.wallet);
  }

  async call(method, args = [], options = {}) {
    try {
      Utils.logger("info", `Calling contract method: ${method}`);
      return await this.contract[method](...args, options);
    } catch (error) {
      Utils.logger(
        "error",
        `Contract call error (${method}): ${error.message}`
      );
      throw new Error(`Contract call error (${method}): ${error.message}`);
    }
  }

  async estimate(method, args = [], options = {}) {
    try {
      return await this.contract.estimateGas[method](...args, options);
    } catch (error) {
      Utils.logger(
        "error",
        `Gas estimation error (${method}): ${error.message}`
      );
      throw new Error(`Gas estimation error (${method}): ${error.message}`);
    }
  }

  async getEvents(eventName, filter = {}, fromBlock = 0, toBlock = "latest") {
    try {
      const events = await this.contract.queryFilter(
        this.contract.filters[eventName](filter),
        fromBlock,
        toBlock
      );
      return events;
    } catch (error) {
      Utils.logger(
        "error",
        `Error getting events (${eventName}): ${error.message}`
      );
      throw new Error(`Error getting events (${eventName}): ${error.message}`);
    }
  }
}

module.exports = ContractBase;
