const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const Utils = require("../core/Utils");
const BeanswapContract = require("../contracts/BeanswapContract");
const config = require("../../config/config");

class BeanswapService extends BaseService {
  constructor() {
    super();
    this.beanswapContract = new BeanswapContract();
  }

  async wrapMON(amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `Wrapping ${Utils.formatAmount(amount)} MON to WMON via Beanswap`
      );

      const result = await this.beanswapContract.swapExactETHForTokens(
        require("../../config/BeanswapABI").WMON_CONTRACT,
        amount,
        this.wallet.address
      );

      return {
        status: result.status === 1 ? "Success" : "Failed",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
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
        `Unwrapping ${Utils.formatAmount(amount)} WMON to MON via Beanswap`
      );
      const result = await this.beanswapContract.swapExactTokensForETH(
        require("../../config/BeanswapABI").WMON_CONTRACT,
        amount,
        this.wallet.address
      );

      return {
        status: result.status === 1 ? "Success" : "Failed",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `Error unwrapping WMON: ${error.message}`);
      throw error;
    }
  }

  async swapExactETHForTokens(tokenAddress, amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `Swapping ${Utils.formatAmount(amount)} MON for tokens`
      );

      const result = await this.beanswapContract.swapExactETHForTokens(
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
      Utils.logger("error", `Error in ETH to Token swap: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForETH(tokenAddress, amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `Swapping tokens for ${Utils.formatAmount(amount)} MON`
      );

      const result = await this.beanswapContract.swapExactTokensForETH(
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
      Utils.logger("error", `Error in Token to ETH swap: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForTokens(tokenAddressIn, tokenAddressOut, amount) {
    try {
      await this.checkGasPrice();

      Utils.logger("info", `Swapping tokens for other tokens`);

      const result = await this.beanswapContract.swapExactTokensForTokens(
        tokenAddressIn,
        tokenAddressOut,
        amount,
        this.wallet.address
      );

      return {
        status: result.status === 1 ? "Success" : "Failed",
        txHash: result.hash,
        url: Utils.logTransaction(result.hash),
      };
    } catch (error) {
      Utils.logger("error", `Error in Token to Token swap: ${error.message}`);
      throw error;
    }
  }
}

module.exports = BeanswapService;
