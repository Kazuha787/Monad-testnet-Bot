const Provider = require("../core/Provider").getInstance;
const Utils = require("../core/Utils");
const ExplorerApi = require("../api/ExplorerApi");
const config = require("../../config/config");

class BaseService {
  constructor() {
    try {
      const providerInstance = Provider();
      this.provider = providerInstance.getProvider();
      this.wallet = providerInstance.getWallet();
      this.utils = Utils;
      this.explorerApi = new ExplorerApi();
    } catch (error) {
      Utils.logger(
        "error",
        `Failed to initialize BaseService: ${error.message}`
      );
      throw error;
    }
  }

  async initialize() {
    try {
      await this.provider.getNetwork();
      return true;
    } catch (error) {
      Utils.logger("error", `Service initialization failed: ${error.message}`);
      return false;
    }
  }

  async wrapMON(amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `Wrapping ${Utils.formatAmount(amount)} MON to WMON via Beanswap`
      );

      const result = await this.beanswapContract.swapExactETHForTokens(
        this.beanswapContract.WMON_ADDRESS,
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
        this.beanswapContract.WMON_ADDRESS,
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

  async handleTransaction(tx) {
    try {
      const response = await tx.wait();
      return {
        status: response.status === 1 ? "Success" : "Failed",
        txHash: response.hash,
        url: Utils.logTransaction(response.hash),
      };
    } catch (error) {
      Utils.logger("error", `Transaction handling failed: ${error.message}`);
      throw error;
    }
  }

  async checkGasPrice() {
    const gasPrice = await this.explorerApi.getGasPrice();
    if (gasPrice && gasPrice.gweiPrice > config.gas.maxGwei) {
      throw new Error(`Gas price too high: ${gasPrice.gweiPrice} gwei`);
    }
    return gasPrice;
  }

  getWalletAddress() {
    return this.wallet.address;
  }
}

module.exports = BaseService;
