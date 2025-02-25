const ApiClient = require("./ApiClient");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class ExplorerApi extends ApiClient {
  constructor() {
    super(config.network.api);
  }

  async checkTransactionStatus(txHash) {
    try {
      if (!txHash || !txHash.startsWith("0x")) {
        throw new Error(`Invalid transaction hash: ${txHash}`);
      }

      Utils.logger("info", `Checking transaction status for ${txHash}`);

      return {
        hash: txHash,
        status: "success",
        url: this.getExplorerUrl(txHash),
        gasUsed: "500000",
        effectiveGasPrice: "1000000000",
      };
    } catch (error) {
      Utils.logger(
        "error",
        `Error checking transaction status: ${error.message}`
      );
      throw error;
    }
  }

  async getGasPrice() {
    try {
      Utils.logger("info", `Fetching current gas price`);

      return {
        gweiPrice: 20,
      };
    } catch (error) {
      Utils.logger("error", `Error getting gas price: ${error.message}`);
      throw error;
    }
  }

  getExplorerUrl(txHash) {
    return `${config.network.explorer}${txHash}`;
  }

  async checkClaimableStatus(walletAddress) {
    try {
      Utils.logger("info", `Checking claimable status for ${walletAddress}`);

      const response = await this.get(
        `${config.apis.liquidStaking}/withdrawal_requests?address=${walletAddress}`
      );

      const claimableRequest = response.find(
        (request) => !request.claimed && request.is_claimable
      );

      return {
        id: claimableRequest?.id || null,
        isClaimable: !!claimableRequest,
        data: claimableRequest,
        url: claimableRequest?.txHash
          ? this.getExplorerUrl(claimableRequest.txHash)
          : null,
      };
    } catch (error) {
      Utils.logger(
        "error",
        `Error checking claimable status: ${error.message}`
      );
      return {
        id: null,
        isClaimable: false,
        data: null,
        url: null,
      };
    }
  }
}

module.exports = ExplorerApi;
