const { ethers } = require("ethers");
const ContractBase = require("./ContractBase");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class StakingContract extends ContractBase {
  constructor(address) {
    const ABI = [
      "function stake() external payable",
      "function unstake(uint256 amount) external",
      "function claimRewards() external",
      "function balanceOf(address account) external view returns (uint256)",
    ];

    super(address, ABI);
  }

  async stake(amount) {
    try {
      Utils.logger(
        "info",
        `Staking ${Utils.formatAmount(amount)} MON to ${this.address}`
      );

      const tx = {
        to: this.address,
        data: "0xd5575982",
        gasLimit: BigInt(config.gas.stake),
        value: amount,
      };

      Utils.logger(
        "debug",
        `Sending transaction: ${JSON.stringify(tx, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )}`
      );

      const txResponse = await this.wallet.sendTransaction(tx);
      Utils.logger("info", `Stake transaction sent: ${txResponse.hash}`);

      const receipt = await txResponse.wait();

      return {
        status: receipt.status === 1 ? "Success" : "Failed",
        txHash: receipt.hash,
        receipt,
      };
    } catch (error) {
      Utils.logger("error", `Error in staking: ${error.message}`);
      throw error;
    }
  }

  async unstake(amount) {
    try {
      Utils.logger(
        "info",
        `Unstaking ${Utils.formatAmount(amount)} from ${this.address}`
      );

      const formattedAmount = amount.toString(16).padStart(64, "0");

      const tx = {
        to: this.address,
        data: "0x6fed1ea7" + formattedAmount,
        gasLimit: BigInt(config.gas.unstake),
      };

      Utils.logger(
        "debug",
        `Sending unstake transaction: ${JSON.stringify(tx, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )}`
      );

      const txResponse = await this.wallet.sendTransaction(tx);
      Utils.logger("info", `Unstake transaction sent: ${txResponse.hash}`);

      const receipt = await txResponse.wait();

      return {
        status: receipt.status === 1 ? "Success" : "Failed",
        txHash: receipt.hash,
        receipt,
      };
    } catch (error) {
      Utils.logger("error", `Error in unstaking: ${error.message}`);
      throw error;
    }
  }

  async claimRewards() {
    try {
      Utils.logger("info", `Claiming rewards from ${this.address}`);

      const tx = {
        to: this.address,
        data: "0x4e71d92d",
        gasLimit: BigInt(config.gas.claim),
      };

      const txResponse = await this.wallet.sendTransaction(tx);
      Utils.logger(
        "info",
        `Claim rewards transaction sent: ${txResponse.hash}`
      );

      const receipt = await txResponse.wait();

      return {
        status: receipt.status === 1 ? "Success" : "Failed",
        txHash: receipt.hash,
        receipt,
      };
    } catch (error) {
      Utils.logger("error", `Error in claiming rewards: ${error.message}`);
      throw error;
    }
  }

  async getStakedBalance(address) {
    try {
      const balance = await this.contract.balanceOf(address);
      return balance;
    } catch (error) {
      Utils.logger("error", `Error getting staked balance: ${error.message}`);
      throw error;
    }
  }
}

module.exports = StakingContract;
