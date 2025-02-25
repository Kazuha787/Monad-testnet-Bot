const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const WMonContract = require("../contracts/WMonContract");
const Utils = require("../core/Utils");
const config = require("../../config/config");

class SwapService extends BaseService {
  constructor() {
    super();
    this.wmonContract = new WMonContract();
  }

  async wrapMON(amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `Wrapping ${Utils.formatAmount(amount)} MON to WMON`
      );
      const receipt = await this.wmonContract.deposit(amount);

      return {
        status: receipt.status === 1 ? "Success" : "Failed",
        txHash: receipt.hash,
        url: Utils.logTransaction(receipt.hash),
      };
    } catch (error) {
      Utils.logger("error", `Error wrapping MON: ${error.message}`);
      throw error;
    }
  }

  async unwrapMON(amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `Unwrapping ${Utils.formatAmount(amount)} WMON to MON`
      );
      const receipt = await this.wmonContract.withdraw(amount);

      return {
        status: receipt.status === 1 ? "Success" : "Failed",
        txHash: receipt.hash,
        url: Utils.logTransaction(receipt.hash),
      };
    } catch (error) {
      Utils.logger("error", `Error unwrapping WMON: ${error.message}`);
      throw error;
    }
  }

  async getWMonBalance() {
    try {
      const walletAddress = this.getWalletAddress();
      const balance = await this.wmonContract.getBalance(walletAddress);
      return balance;
    } catch (error) {
      Utils.logger("error", `Error getting WMON balance: ${error.message}`);
      throw error;
    }
  }

  async estimateWrapGas(amount) {
    try {
      const gasEstimate = await this.wmonContract.estimateGas("deposit", [], {
        value: amount,
      });
      return gasEstimate;
    } catch (error) {
      Utils.logger("error", `Error estimating wrap gas: ${error.message}`);
      throw error;
    }
  }

  async estimateUnwrapGas(amount) {
    try {
      const gasEstimate = await this.wmonContract.estimateGas("withdraw", [
        amount,
      ]);
      return gasEstimate;
    } catch (error) {
      Utils.logger("error", `Error estimating unwrap gas: ${error.message}`);
      throw error;
    }
  }
}

module.exports = SwapService;
