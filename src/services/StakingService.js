const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const config = require("../config/config.json");

class StakingService extends BaseService {
  constructor(contractAddress) {
    super();
    this.contractAddress = contractAddress;
  }

  async stake(amount) {
    try {
      const tx = {
        to: this.contractAddress,
        data: "0xd5575982",
        gasLimit: BigInt(config.gas.stake),
        value: amount,
      };

      const txResponse = await this.wallet.sendTransaction(tx);
      const receipt = await txResponse.wait();

      return {
        status: receipt.status === 1 ? "Success" : "Failed",
      };
    } catch (error) {
      throw error;
    }
  }

  async unstake(amount) {
    try {
      const formattedAmount = amount.toString(16).padStart(64, "0");

      const tx = {
        to: this.contractAddress,
        data: "0x6fed1ea7" + formattedAmount,
        gasLimit: BigInt(config.gas.unstake),
      };

      const txResponse = await this.wallet.sendTransaction(tx);
      const receipt = await txResponse.wait();

      return {
        status: receipt.status === 1 ? "Success" : "Failed",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StakingService;
