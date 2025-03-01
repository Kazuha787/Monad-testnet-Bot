const { ethers } = require("ethers");
const ContractBase = require("./ContractBase");
const config = require("../../config/config");
const Utils = require("../core/Utils");
const {
  ROUTER_ABIS,
  KURU_UTILS_ABIS,
  MON_ADDRESS,
} = require("../../config/KuruSwapABI");
const axios = require("axios");

class KuruSwapContract extends ContractBase {
  constructor() {
    super(config.contracts.kuruswap.router, ROUTER_ABIS);
    this.utilsAddress = config.contracts.kuruswap.utils;
    this.monAddress = MON_ADDRESS;

    const provider = this.provider;
    this.utilsContract = new ethers.Contract(
      this.utilsAddress,
      KURU_UTILS_ABIS,
      this.wallet
    );
  }

  async getTokenDecimals(tokenAddress) {
    try {
      if (tokenAddress === this.monAddress) {
        return 18;
      }

      const tokenABI = ["function decimals() external view returns (uint8)"];
      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenABI,
        this.provider
      );
      return await tokenContract.decimals();
    } catch (error) {
      Utils.logger("error", `Error getting token decimals: ${error.message}`);
      return 18;
    }
  }

  async approveTokenIfNeeded(tokenAddress, amount) {
    try {
      const tokenABI = [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)",
      ];
      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenABI,
        this.wallet
      );
      const allowance = await tokenContract.allowance(
        this.wallet.address,
        this.address
      );

      if (BigInt(allowance.toString()) < BigInt(amount.toString())) {
        Utils.logger("info", `Approving token for KuruSwap`);
        const tx = await tokenContract.approve(this.address, ethers.MaxUint256);
        await tx.wait();
        Utils.logger("info", `Token approved for KuruSwap`);
      }
    } catch (error) {
      Utils.logger("error", `Error approving token: ${error.message}`);
      throw error;
    }
  }

  async findPool(sourceToken, targetToken) {
    try {
      const response = await axios.post(
        "https://api.testnet.kuru.io/api/v1/markets/filtered",
        {
          pairs: [
            {
              baseToken: sourceToken,
              quoteToken: targetToken,
            },
          ],
        },
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        return response.data.data[0].market;
      }

      const invertedResponse = await axios.post(
        "https://api.testnet.kuru.io/api/v1/markets/filtered",
        {
          pairs: [
            {
              baseToken: targetToken,
              quoteToken: sourceToken,
            },
          ],
        },
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
            "Content-Type": "application/json",
          },
        }
      );

      if (
        invertedResponse.data &&
        invertedResponse.data.data &&
        invertedResponse.data.data.length > 0
      ) {
        return invertedResponse.data.data[0].market;
      }

      throw new Error(`No pool found for the token pair`);
    } catch (error) {
      Utils.logger("error", `Error finding pool: ${error.message}`);
      throw error;
    }
  }

  async swapExactMONForTokens(tokenAddress, amountIn, receiverAddress) {
    try {
      Utils.logger("info", `Preparing MON to token swap on KuruSwap`);

      const poolAddress = await this.findPool(this.monAddress, tokenAddress);
      Utils.logger("info", `Using pool: ${poolAddress}`);

      const utilsIsBuy = [false];

      const priceForOne = await this.utilsContract.calculatePriceOverRoute(
        [poolAddress],
        utilsIsBuy
      );

      const ONE = ethers.WeiPerEther;
      let expectedOut =
        (BigInt(amountIn.toString()) * BigInt(priceForOne.toString())) /
        BigInt(ONE.toString());

      const slippageFactor = 85n;
      const slippageDivisor = 100n;
      const expectedOutWithSlippage =
        (expectedOut * slippageFactor) / slippageDivisor;

      Utils.logger(
        "info",
        `Expected output: ${expectedOutWithSlippage.toString()}`
      );

      const isBuy = [true];
      const nativeSend = [true];
      const debitToken = this.monAddress;
      const creditToken = tokenAddress;

      const randomGasLimit =
        Math.floor(Math.random() * (280000 - 180000 + 1)) + 180000;
      const gasLimit = BigInt(randomGasLimit);

      const tx = await this.call(
        "anyToAnySwap",
        [
          [poolAddress],
          isBuy,
          nativeSend,
          debitToken,
          creditToken,
          amountIn,
          expectedOutWithSlippage,
        ],
        {
          value: amountIn,
          gasLimit: gasLimit,
        }
      );

      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `KuruSwap MON to token error: ${error.message}`);
      throw error;
    }
  }

  async swapExactTokensForMON(tokenAddress, amountIn, receiverAddress) {
    try {
      Utils.logger("info", `Preparing token to MON swap on KuruSwap`);

      await this.approveTokenIfNeeded(tokenAddress, amountIn);

      const poolAddress = await this.findPool(tokenAddress, this.monAddress);
      Utils.logger("info", `Using pool: ${poolAddress}`);

      const utilsIsBuy = [true];

      const priceForOne = await this.utilsContract.calculatePriceOverRoute(
        [poolAddress],
        utilsIsBuy
      );

      const ONE = ethers.WeiPerEther;
      let expectedOut =
        (BigInt(amountIn.toString()) * BigInt(priceForOne.toString())) /
        BigInt(ONE.toString());

      const slippageFactor = 85n;
      const slippageDivisor = 100n;
      const expectedOutWithSlippage =
        (expectedOut * slippageFactor) / slippageDivisor;

      Utils.logger(
        "info",
        `Expected output: ${expectedOutWithSlippage.toString()}`
      );

      const isBuy = [false];
      const nativeSend = [false];
      const debitToken = tokenAddress;
      const creditToken = this.monAddress;

      const randomGasLimit =
        Math.floor(Math.random() * (280000 - 180000 + 1)) + 180000;
      const gasLimit = BigInt(randomGasLimit);

      const tx = await this.call(
        "anyToAnySwap",
        [
          [poolAddress],
          isBuy,
          nativeSend,
          debitToken,
          creditToken,
          amountIn,
          expectedOutWithSlippage,
        ],
        { gasLimit: gasLimit }
      );

      return await tx.wait();
    } catch (error) {
      Utils.logger("error", `KuruSwap token to MON error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = KuruSwapContract;
