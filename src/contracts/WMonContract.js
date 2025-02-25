const { ethers } = require("ethers");
const ContractBase = require("./ContractBase");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class WMonContract extends ContractBase {
  constructor() {
    const ABI = [
      "function deposit() public payable",
      "function withdraw(uint256 amount) public",
      "function balanceOf(address owner) view returns (uint256)",
    ];

    super(config.contracts.wmon, ABI);
  }

  async deposit(amount) {
    try {
      Utils.logger(
        "info",
        `Depositing ${Utils.formatAmount(amount)} MON to WMON`
      );

      const tx = await this.call("deposit", [], {
        value: amount,
        gasLimit: BigInt(config.gas.stake),
      });

      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `Error in WMON deposit: ${error.message}`);
      throw error;
    }
  }

  async withdraw(amount) {
    try {
      Utils.logger(
        "info",
        `Withdrawing ${Utils.formatAmount(amount)} WMON to MON`
      );

      try {
        const tx = await this.contract.withdraw(amount, {
          gasLimit: BigInt(config.gas.stake),
        });

        return await tx.wait();
      } catch (error) {
        if (error.message.includes("response body is not valid JSON")) {
          Utils.logger("error", `RPC node error: ${error.message}`);
          throw new Error(
            "RPC node returned invalid response. Try again later."
          );
        }
        throw error;
      }
    } catch (error) {
      Utils.logger("error", `Error in WMON withdraw: ${error.message}`);
      throw error;
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.contract.balanceOf(address);
      return balance;
    } catch (error) {
      Utils.logger("error", `Error getting WMON balance: ${error.message}`);
      throw error;
    }
  }
}

module.exports = WMonContract;
