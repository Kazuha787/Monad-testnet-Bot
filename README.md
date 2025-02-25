# Monad-BOT

An automated bot for managing multiple Monard with proxy support.

## 📢 Join Our Community

# Telegram Channel: .[Channel](https://t.me/Offical_Im_kazuha)
# GitHub Repository: [Monard](https://github.com/Kazuha787/Monard-Bot.git)
# If You Want To Run The Bot Make Sure You Mint This NFT First Then Its Run: [NFT](https://kazuha.testnet.nfts2.me/)

Monad-BOT is a blockchain automation tool designed to interact with various cryptocurrency services for swapping and staking tokens. It provides a dashboard interface to monitor operations and logs, and it cycles through tasks like wrapping/unwrapping and staking/unstaking tokens.

## Features

- **Dashboard Interface**: Real-time updates on balance, network status, and transaction history.
- **Automated Cycles**: Configurable cycles for executing swap and staking operations.
- **Blockchain Interactions**: Utilizes the `ethers` library for seamless blockchain operations.
- **API Integrations**: Interacts with external APIs to check transaction statuses and claimable staking rewards.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Kazuha787/Monad-testnet-Bot.git
   cd Monad-testnet-Bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Edit data.txt file and input your private keys (one per line)

   ```bash
   nano private.key
   ```

## Usage

- **Start the bot**:

  ```bash
  npm start
  ```

- **Dashboard**: The dashboard will display real-time information about the bot's operations, including balance, network status, and transaction logs.

## Configuration

- **Network Settings**: Configure the RPC URL and explorer URL in `config/config.json`.
- **API Endpoints**: Set the API endpoints for liquid staking and other services.
- **Contract Addresses**: Update the contract addresses for the tokens and services you wish to interact with.
- **Cycle Parameters**: Adjust the cycle count, cooldown time, and delay settings to suit your needs.

## Dependencies

- **axios**: For making HTTP requests to external APIs.
- **blessed**: For creating the terminal-based dashboard interface.
- **blessed-contrib**: For additional dashboard components.
- **ethers**: For interacting with the Ethereum blockchain.

## License

This project is licensed under the ISC License.
