const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const StakingContract = require("../contracts/StakingContract");
const Utils = require("../core/Utils");
const config = require("../../config/config");

class StakingService extends BaseService {
  constructor(contractAddress) {
    super();
    this.contractAddress = contractAddress;
    this.stakingContract = new StakingContract(contractAddress);
  }

  async stake(amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `Staking ${Utils.formatAmount(amount)} MON to ${this.contractAddress}`
      );
      const result = await this.stakingContract.stake(amount);

      return result;
    } catch (error) {
      Utils.logger("error", `Staking error: ${error.message}`);
      throw error;
    }
  }

  async unstake(amount) {
    try {
      await this.checkGasPrice();

      Utils.logger(
        "info",
        `Unstaking ${Utils.formatAmount(amount)} from ${this.contractAddress}`
      );
      const result = await this.stakingContract.unstake(amount);

      return result;
    } catch (error) {
      Utils.logger("error", `Unstaking error: ${error.message}`);
      throw error;
    }
  }

  async getStakedBalance() {
    const walletAddress = this.getWalletAddress();
    return await this.stakingContract.getStakedBalance(walletAddress);
  }
}

module.exports = StakingService;
