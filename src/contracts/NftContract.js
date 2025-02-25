const { ethers } = require("ethers");
const ContractBase = require("./ContractBase");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class NftContract extends ContractBase {
  constructor() {
    const ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
      "function tokenURI(uint256 tokenId) view returns (string)",
    ];

    super(config.contracts.nft, ABI);
  }

  async getBalance(address) {
    try {
      Utils.logger("info", `Checking NFT balance for ${address}`);
      const balance = await this.contract.balanceOf(address);
      return Number(balance);
    } catch (error) {
      Utils.logger("error", `Error checking NFT balance: ${error.message}`);
      return 0;
    }
  }

  async getTokenIds(address) {
    try {
      const balance = await this.getBalance(address);
      const tokenIds = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await this.contract.tokenOfOwnerByIndex(address, i);
        tokenIds.push(Number(tokenId));
      }

      return tokenIds;
    } catch (error) {
      Utils.logger("error", `Error getting token IDs: ${error.message}`);
      return [];
    }
  }

  async getTokenDetails(tokenId) {
    try {
      const tokenURI = await this.contract.tokenURI(tokenId);
      return {
        tokenId,
        tokenURI,
      };
    } catch (error) {
      Utils.logger("error", `Error getting token details: ${error.message}`);
      return null;
    }
  }
}

module.exports = NftContract;
