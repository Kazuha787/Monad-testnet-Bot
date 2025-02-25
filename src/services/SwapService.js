const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const config = require("../config/config.json");

class SwapService extends BaseService {
  constructor() {
    super();
    this.wmonContract = new ethers.Contract(
      config.contracts.wmon,
      [
        "function deposit() public payable",
        "function withdraw(uint256 amount) public",
      ],
      this.wallet
    );
  }

  async wrapMON(amount) {
    try {
      const tx = await this.wmonContract.deposit({
        value: amount,
        gasLimit: BigInt(config.gas.stake),
      });

      const receipt = await tx.wait();

      return {
        status: receipt.status === 1 ? "Success" : "Failed",
      };
    } catch (error) {
      throw error;
    }
  }

  async unwrapMON(amount) {
    try {
      const tx = await this.wmonContract.withdraw(amount, {
        gasLimit: BigInt(config.gas.stake),
      });

      const receipt = await tx.wait();

      return {
        status: receipt.status === 1 ? "Success" : "Failed",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SwapService;
