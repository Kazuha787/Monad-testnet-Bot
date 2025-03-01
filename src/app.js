const { ethers } = require("ethers");
const Dashboard = require("./ui/Dashboard");
const {
  StakingService,
  SwapService,
  TokenService,
  BeanswapService,
  KuruSwapService,
} = require("./services");
const Utils = require("./core/Utils");
const config = require("../config/config");
const Provider = require("./core/Provider").getInstance;

class Application {
  constructor() {
    this.dashboard = null;
    this.services = {};
    this.transactionHistory = [];
    this.cycleCount = 0;
    this.tokenService = null;

    process.on("unhandledRejection", this.handleUnhandledRejection.bind(this));
  }

  handleUnhandledRejection(error) {
    this.dashboard?.updateLog(`Unhandled error: ${error.message}`);
    Utils.logger("error", `Unhandled rejection: ${error.message}`);
  }

  initializeDashboard() {
    try {
      this.dashboard = new Dashboard();
      this.dashboard.screen.render();
    } catch (error) {
      Utils.logger("error", `Failed to initialize dashboard: ${error.message}`);
      process.exit(1);
    }
  }

  async initialize() {
    try {
      this.initializeDashboard();

      this.dashboard.updateTable([
        ["Initializing...", "Pending", new Date().toLocaleTimeString()],
      ]);

      this.dashboard.updateLog("Initializing services...");
      this.dashboard.updateStatus("Initializing");

      const provider = Provider();

      this.tokenService = new TokenService();

      await this.tokenService.checkNFTAccess();
      this.dashboard.updateLog("NFT access verified successfully");

      const walletInfo = await this.tokenService.getWalletInfo();
      this.dashboard.updateTokens(walletInfo.tokens);
      this.dashboard.updateBalance(walletInfo.balance);
      this.dashboard.updateNetwork(walletInfo.network);
      this.dashboard.setCycles(0, config.cycles.default);

      const serviceDefinitions = {
        rubicSwap: { name: "Rubic Swap", service: SwapService },
        izumiSwap: { name: "Izumi Swap", service: SwapService },
        beanSwap: { name: "Bean Swap", service: BeanswapService },
        kuruSwap: { name: "Kuru Swap", service: KuruSwapService },
        magmaStaking: {
          name: "Magma Staking",
          service: StakingService,
          address: config.contracts.magma,
        },
      };

      for (const [key, info] of Object.entries(serviceDefinitions)) {
        this.dashboard.updateLog(`Initializing ${info.name}...`);
        this.dashboard.addService(info.name, "Initializing");

        try {
          this.services[key] = info.address
            ? new info.service(info.address)
            : new info.service();

          await this.services[key].initialize();
          this.dashboard.updateLog(`${info.name} initialized successfully`);
          this.dashboard.updateServiceStatus(info.name, "Active");
        } catch (error) {
          this.dashboard.updateLog(
            `Failed to initialize ${info.name}: ${error.message}`
          );
          this.dashboard.updateServiceStatus(info.name, "Error");
          this.dashboard.updateStatus("Error");
          throw error;
        }

        await Utils.delay(1000);
      }

      this.dashboard.updateLineChart([
        { time: new Date().toLocaleTimeString(), amount: 0 },
      ]);
      this.dashboard.updateStatus("Active");

      return true;
    } catch (error) {
      this.dashboard?.updateLog(`Initialization error: ${error.message}`);
      this.dashboard?.updateStatus("Error");
      return false;
    }
  }

  async start() {
    try {
      Utils.logger("info", "Starting Monad Bot...");

      const initialized = await this.initialize();

      if (!initialized) {
        throw new Error("Failed to initialize services");
      }

      this.dashboard.updateLog("All services initialized. Starting cycles...");

      while (true) {
        for (let i = 0; i < config.cycles.default; i++) {
          this.cycleCount++;
          await this.runCycle();

          this.dashboard.setCycles(this.cycleCount, config.cycles.default);

          if (i < config.cycles.default - 1) {
            const delay = Utils.getRandomDelay();
            this.dashboard.updateLog(
              `Waiting ${delay / 1000} seconds before next cycle...`
            );
            await Utils.delay(delay);
          }
        }

        this.dashboard.updateLog("Starting cooldown period of 12 hours...");
        this.dashboard.updateStatus("Cooling Down");
        await Utils.delay(config.cycles.cooldownTime);
        this.cycleCount = 0;
        this.dashboard.setCycles(0, config.cycles.default);
        this.dashboard.updateStatus("Active");
      }
    } catch (error) {
      this.dashboard?.updateLog(`Fatal error: ${error.message}`);
      this.dashboard?.updateStatus("Error");
      Utils.logger("error", `Fatal error: ${error.message}`);
      await new Promise(() => {});
    }
  }

  async runCycle() {
    try {
      const amount = Utils.getRandomAmount();
      this.dashboard.setCycles(this.cycleCount, config.cycles.default);

      const formattedAmount = Utils.formatAmount(amount);
      this.dashboard.updateLog(
        `Starting cycle ${this.cycleCount} with ${formattedAmount} MON`
      );

      this.transactionHistory.push({
        time: new Date().toLocaleTimeString(),
        amount: formattedAmount,
      });

      if (this.transactionHistory.length > 10) {
        this.transactionHistory.shift();
      }

      this.dashboard.updateLineChart(this.transactionHistory);

      for (const [name, service] of Object.entries(this.services)) {
        try {
          this.dashboard.updateServiceStatus(name, "Running");

          if (service instanceof SwapService) {
            const wrapResult = await service.wrapMON(amount);
            this.dashboard.updateLog(
              `${name}: Wrapped MON - ${wrapResult.status}`
            );

            await Utils.delay(Utils.getRandomDelay());

            const unwrapResult = await service.unwrapMON(amount);
            this.dashboard.updateLog(
              `${name}: Unwrapped MON - ${unwrapResult.status}`
            );
          } else if (service instanceof KuruSwapService) {
            const tokens = [
              config.contracts.kuruswap.chog,
              config.contracts.kuruswap.dak,
              config.contracts.kuruswap.yaki,
            ];

            const randomIndex = Math.floor(Math.random() * tokens.length);
            const tokenAddress = tokens[randomIndex];
            const tokenSymbol = ["CHOG", "DAK", "YAKI"][randomIndex];

            const swapToTokenResult = await service.swapExactMONForTokens(
              tokenAddress,
              amount
            );
            this.dashboard.updateLog(
              `${name}: Swapped MON to ${tokenSymbol} - ${swapToTokenResult.status}`
            );

            await Utils.delay(Utils.getRandomDelay());

            const backAmount = ethers.parseUnits("0.01", 18);
            const swapToMonResult = await service.swapExactTokensForMON(
              tokenAddress,
              backAmount
            );
            this.dashboard.updateLog(
              `${name}: Swapped ${tokenSymbol} to MON - ${swapToMonResult.status}`
            );
          } else if (service instanceof BeanswapService) {
            let tokenAddress = config.contracts.beanswap.usdc;
            let swapResult = await service.swapExactETHForTokens(
              tokenAddress,
              amount
            );
            this.dashboard.updateLog(
              `${name}: Swapped MON to USDC - ${swapResult.status}`
            );

            await Utils.delay(Utils.getRandomDelay());

            let backAmount = Utils.getRandomAmount();
            let usdcAmount = ethers.parseUnits(
              ethers.formatEther(backAmount).slice(0, 8),
              6
            );

            swapResult = await service.swapExactTokensForETH(
              tokenAddress,
              usdcAmount
            );
            this.dashboard.updateLog(
              `${name}: Swapped USDC to MON - ${swapResult.status}`
            );

            /* 
  await Utils.delay(Utils.getRandomDelay());
  
  tokenAddress = config.contracts.beanswap.jai;
  swapResult = await service.swapExactETHForTokens(tokenAddress, amount);
  this.dashboard.updateLog(`${name}: Swapped MON to JAI - ${swapResult.status}`);
  
  await Utils.delay(Utils.getRandomDelay());
  
  backAmount = Utils.getRandomAmount();
  let jaiAmount = ethers.parseUnits(
    ethers.formatEther(backAmount),
    18
  );
  
  swapResult = await service.swapExactTokensForETH(tokenAddress, jaiAmount);
  this.dashboard.updateLog(`${name}: Swapped JAI to MON - ${swapResult.status}`);

  await Utils.delay(Utils.getRandomDelay());
  
  tokenAddress = config.contracts.beanswap.bean;
  swapResult = await service.swapExactETHForTokens(tokenAddress, amount);
  this.dashboard.updateLog(`${name}: Swapped MON to BEAN - ${swapResult.status}`);
  
  await Utils.delay(Utils.getRandomDelay());
  
  backAmount = Utils.getRandomAmount();
  let beanAmount = ethers.parseUnits(
    ethers.formatEther(backAmount),
    18
  );
  
  swapResult = await service.swapExactTokensForETH(tokenAddress, beanAmount);
  this.dashboard.updateLog(`${name}: Swapped BEAN to MON - ${swapResult.status}`);
  
  await Utils.delay(Utils.getRandomDelay());
  
  tokenAddress = config.contracts.wmon;
  swapResult = await service.swapExactETHForTokens(tokenAddress, amount);
  this.dashboard.updateLog(`${name}: Swapped MON to WMON - ${swapResult.status}`);
  
  await Utils.delay(Utils.getRandomDelay());
  
  backAmount = Utils.getRandomAmount();
  let wmonAmount = ethers.parseUnits(
    ethers.formatEther(backAmount),
    18
  );
  
  swapResult = await service.swapExactTokensForETH(tokenAddress, wmonAmount);
  this.dashboard.updateLog(`${name}: Swapped WMON to MON - ${swapResult.status}`);
  */
          } else {
            const stakeResult = await service.stake(amount);
            this.dashboard.updateLog(
              `${name}: Staked MON - ${stakeResult.status}`
            );

            await Utils.delay(Utils.getRandomDelay());

            const unstakeResult = await service.unstake(amount);
            this.dashboard.updateLog(
              `${name}: Unstaked MON - ${unstakeResult.status}`
            );
          }

          this.dashboard.updateServiceStatus(name, "Active");
        } catch (error) {
          this.dashboard.updateLog(`${name}: Error - ${error.message}`);
          this.dashboard.updateServiceStatus(name, "Error");
        }
      }

      const walletInfo = await this.tokenService.getWalletInfo();
      this.dashboard.updateTokens(walletInfo.tokens);
      this.dashboard.updateBalance(walletInfo.balance);

      return true;
    } catch (error) {
      this.dashboard.updateStatus("Error");
      this.dashboard.updateLog(`Cycle error: ${error.message}`);
      Utils.logger("error", `Cycle error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Application;
