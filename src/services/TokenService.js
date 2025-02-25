const { ethers } = require("ethers");
const BaseService = require("./BaseService");
const NftContract = require("../contracts/NftContract");
const BlockvisionApi = require("../api/BlockvisionApi");
const Utils = require("../core/Utils");

class TokenService extends BaseService {
  constructor() {
    super();
    this.nftContract = new NftContract();
    this.blockvisionApi = new BlockvisionApi();
  }

  async checkNFTAccess() {
    const walletAddress = this.getWalletAddress();
    const nftBalance = await this.nftContract.getBalance(walletAddress);

    if (nftBalance === 0) {
      Utils.logger(
        "error",
        `Access denied: Wallet ${walletAddress} does not hold the required NFT`
      );
      throw new Error(
        "Access denied: You need to hold the required NFT to use this bot"
      );
    }

    Utils.logger("info", `NFT access verified for ${walletAddress}`);
    return true;
  }

  async getTokenBalances() {
    const walletAddress = this.getWalletAddress();
    return await this.blockvisionApi.getTokenBalances(walletAddress);
  }

  async getWalletInfo() {
    const walletAddress = this.getWalletAddress();

    const balance = await this.provider.getBalance(walletAddress);
    const formattedBalance = Utils.formatAmount(balance);

    const network = await this.provider.getNetwork();
    const networkName = `Monad ${network.name}`;

    const tokens = await this.getTokenBalances();

    return {
      address: walletAddress,
      balance: formattedBalance,
      network: networkName,
      tokens,
    };
  }
}

module.exports = TokenService;
