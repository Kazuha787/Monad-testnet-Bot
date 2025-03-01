const KURU_UTILS_ABIS = [
  {
    inputs: [
      { internalType: "address[]", name: "route", type: "address[]" },
      { internalType: "bool[]", name: "isBuy", type: "bool[]" },
    ],
    name: "calculatePriceOverRoute",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "tokens", type: "address[]" },
      { internalType: "address", name: "holder", type: "address" },
    ],
    name: "getTokensInfo",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "uint256", name: "balance", type: "uint256" },
          { internalType: "uint8", name: "decimals", type: "uint8" },
          { internalType: "uint256", name: "totalSupply", type: "uint256" },
        ],
        internalType: "struct KuruUtils.TokenInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const ROUTER_ABIS = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_marketAddresses",
        type: "address[]",
      },
      { internalType: "bool[]", name: "_isBuy", type: "bool[]" },
      { internalType: "bool[]", name: "_nativeSend", type: "bool[]" },
      { internalType: "address", name: "_debitToken", type: "address" },
      { internalType: "address", name: "_creditToken", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "uint256", name: "_minAmountOut", type: "uint256" },
    ],
    name: "anyToAnySwap",
    outputs: [{ internalType: "uint256", name: "_amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
];

module.exports = {
  KURU_UTILS_ABIS,
  ROUTER_ABIS,
  MON_ADDRESS: "0x0000000000000000000000000000000000000000",
  WMON_ADDRESS: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
  ROUTER_ADDRESS: "0xc816865f172d640d93712C68a7E1F83F3fA63235",
  TOKENS: {
    CHOG: "0xe0590015a873bf326bd645c3e1266d4db41c4e6b",
    DAK: "0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714",
    YAKI: "0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50",
  },
};
