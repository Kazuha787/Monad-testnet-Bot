const { ethers } = require("ethers");
const ContractBase = require("./ContractBase");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class BeanswapContract extends ContractBase {
  constructor() {
    const ABI = require("../../config/BeanswapABI").ABI;
    const routerAddress = require("../../config/BeanswapABI").ROUTER_CONTRACT;

    super(routerAddress, ABI);

    this.WMON_ADDRESS = require("../../config/BeanswapABI").WMON_CONTRACT;
  }

  async swapExactETHForTokens(tokenAddress, amountIn, receiverAddress) {
    try {
      Utils.logger("info", `Preparing ETH to token swap`);

      const currentTime = Math.floor(Date.now() / 1000);
      const deadline = currentTime + 6 * 3600;

      const path = [this.WMON_ADDRESS, tokenAddress];

      const amountsOut = await this.call("getAmountsOut", [amountIn, path]);
      const expectedOut = amountsOut[amountsOut.length - 1];

      const gasLimit = BigInt(500000);

      const tx = await this.call(
        "swapExactETHForTokens",
        [expectedOut, path, receiverAddress, deadline],
        {
          value: amountIn,
          gasLimit: gasLimit,
        }
      );

      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `Beanswap ETH to token error: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForETH(tokenAddress, amountIn, receiverAddress) {
    try {
      Utils.logger("info", `Preparing token to ETH swap`);

      await this.approveTokenIfNeeded(tokenAddress, amountIn, receiverAddress);

      const currentTime = Math.floor(Date.now() / 1000);
      const deadline = currentTime + 6 * 3600;

      const path = [tokenAddress, this.WMON_ADDRESS];

      const amountsOut = await this.call("getAmountsOut", [amountIn, path]);
      const expectedOut = amountsOut[amountsOut.length - 1];

      const gasLimit = BigInt(500000);

      const tx = await this.call(
        "swapExactTokensForETH",
        [amountIn, expectedOut, path, receiverAddress, deadline],
        { gasLimit: gasLimit }
      );

      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `Beanswap token to ETH error: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForTokens(
    tokenAddressIn,
    tokenAddressOut,
    amountIn,
    receiverAddress
  ) {
    try {
      Utils.logger("info", `Preparing token to token swap`);

      await this.approveTokenIfNeeded(
        tokenAddressIn,
        amountIn,
        receiverAddress
      );

      const currentTime = Math.floor(Date.now() / 1000);
      const deadline = currentTime + 6 * 3600;

      const path = [tokenAddressIn, this.WMON_ADDRESS, tokenAddressOut];

      const amountsOut = await this.call("getAmountsOut", [amountIn, path]);
      const expectedOut = amountsOut[amountsOut.length - 1];

      const gasLimit = BigInt(500000);

      const tx = await this.call(
        "swapExactTokensForTokens",
        [amountIn, expectedOut, path, receiverAddress, deadline],
        { gasLimit: gasLimit }
      );

      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `Beanswap token to token error: ${error.message}`);
      throw error;
    }
  }

  async approveTokenIfNeeded(tokenAddress, amount, owner) {
    const erc20ABI = [
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
    ];

    const tokenContract = new ethers.Contract(
      tokenAddress,
      erc20ABI,
      this.wallet
    );
    const allowance = await tokenContract.allowance(owner, this.address);

    if (BigInt(allowance.toString()) < BigInt(amount.toString())) {
      Utils.logger("info", `Approving token for Beanswap`);
      const tx = await tokenContract.approve(this.address, ethers.MaxUint256);
      await tx.wait();
      Utils.logger("info", `Token approved for Beanswap`);
    }
  }
}

module.exports = BeanswapContract;
