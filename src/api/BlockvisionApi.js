const ApiClient = require("./ApiClient");
const config = require("../../config/config");
const Utils = require("../core/Utils");

class BlockvisionApi extends ApiClient {
  constructor() {
    super(config.apis.blockvision, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-Ch-Ua":
          '"Not A(Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
      },
    });
  }

  async getTokenBalances(address) {
    try {
      Utils.logger("info", `Fetching token balances for ${address}`, {
        console: false,
      });
      const response = await this.get(
        `/account/tokenPortfolio?address=${address}`
      );

      if (!response?.result?.data) {
        return [];
      }

      const trackedAddresses = new Set([
        config.contracts.wmon.toLowerCase(),
        config.contracts.apriori.toLowerCase(),
        config.contracts.magma.toLowerCase(),
      ]);

      const tokens = response.result.data
        .filter((token) =>
          trackedAddresses.has(token.contractAddress.toLowerCase())
        )
        .map((token) => ({
          symbol: token.symbol || "Unknown",
          balance: token.balance || "0",
          tokenAddress: token.contractAddress,
          name: token.name || "",
          verified: token.verified || false,
        }));

      tokens.sort((a, b) => {
        return (
          Array.from(trackedAddresses).indexOf(a.tokenAddress.toLowerCase()) -
          Array.from(trackedAddresses).indexOf(b.tokenAddress.toLowerCase())
        );
      });

      return tokens;
    } catch (error) {
      Utils.logger("error", `Error fetching token balances: ${error.message}`);
      return [];
    }
  }
}

module.exports = BlockvisionApi;
