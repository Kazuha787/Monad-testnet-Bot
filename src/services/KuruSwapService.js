const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const Utils = require("../core/Utils");
const KuruSwapContract = require("../contracts/KuruSwapContract");
const config = require("../../config/config");

class KuruSwapService extends BaseService {
  constructor() {
    super();
    this.kuruSwapContract = new KuruSwapContract();
  }

  async wrapMON(amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `Swapping ${Utils.formatAmount(amount)} MON to CHOG via KuruSwap`
      );

      const result = await this.kuruSwapContract.swapExactMONForTokens(
        config.contracts.kuruswap.chog,
        amount,
        this.wallet.address
      );

      return {
        status: result.status === 1 ? "Success" : "Failed",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `Error swapping MON to CHOG: ${error.message}`);
      throw error;
    }
  }

  async unwrapMON(amount) {
    try {
      await this.checkGasPrice();

      Utils.logger("info", `Swapping CHOG to MON via KuruSwap`);

      const chogAmount = ethers.utils.parseUnits("0.01", 18);

      const result = await this.kuruSwapContract.swapExactTokensForMON(
        config.contracts.kuruswap.chog,
        chogAmount,
        this.wallet.address
      );

      return {
        status: result.status === 1 ? "Success" : "Failed",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `Error swapping CHOG to MON: ${error.message}`);
      throw error;
    }
  }

  async swapExactMONForTokens(tokenAddress, amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `Swapping ${Utils.formatAmount(amount)} MON for tokens via KuruSwap`
      );

      const result = await this.kuruSwapContract.swapExactMONForTokens(
        tokenAddress,
        amount,
        this.wallet.address
      );

      return {
        status: result.status === 1 ? "Success" : "Failed",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `Error in MON to Token swap: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForMON(tokenAddress, amount) {
    try {
      await this.checkGasPrice();

      Utils.logger("info", `Swapping tokens for MON via KuruSwap`);

      const result = await this.kuruSwapContract.swapExactTokensForMON(
        tokenAddress,
        amount,
        this.wallet.address
      );

      return {
        status: result.status === 1 ? "Success" : "Failed",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `Error in Token to MON swap: ${error.message}`);
      throw error;
    }
  }
}

module.exports = KuruSwapService;
