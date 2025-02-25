const blessed = require("blessed");
const contrib = require("blessed-contrib");
const InfoDisplay = require("./InfoDisplay");
const LogPanel = require("./LogPanel");
const ChartPanel = require("./ChartPanel");
const StatusPanel = require("./StatusPanel");

class Dashboard {
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: "Monad Transaction Dashboard",
      autoPadding: true,
      fullUnicode: true,
    });

    this.banner = blessed.box({
      parent: this.screen,
      top: 0,
      height: 3,
      width: "100%",
      align: "center",
      valign: "middle",
      content:
        "{bold}Monad BOT{/bold}\nKazuha: https://github/Kazuha787 | Telegram: https://t.me/Offical_Kazuha",
      tags: true,
      style: {
        fg: "white",
        bold: true,
      },
    });

    this.grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen,
      top: 3,
    });

    this.initializeComponents();
    this.setupListeners();
  }

  initializeComponents() {
    // Info display panel (wallet info)
    this.info = new InfoDisplay(this.grid, 0, 8, 6, 4);

    // Log panel (transaction logs)
    this.logPanel = new LogPanel(this.grid, 0, 0, 6, 8);

    // Status panel (service status)
    this.statusPanel = new StatusPanel(this.grid, 6, 0, 6, 8);

    // Chart panel (transaction amounts)
    this.chartPanel = new ChartPanel(this.grid, 6, 8, 6, 4);

    this.screen.render();
  }

  setupListeners() {
    this.screen.key(["escape", "q", "C-c"], () => process.exit(0));

    this.screen.on("resize", () => {
      this.screen.render();
    });
  }

  // Di dalam metode updateLog di Dashboard.js:
  updateLog(message) {
    if (!this.logPanel || !this.logPanel.addLog) {
      // Jika panel belum siap, simpan log untuk ditampilkan nanti
      if (!this._pendingLogs) this._pendingLogs = [];
      this._pendingLogs.push(message);
      return;
    }

    // Jika ada log tertunda, tampilkan semua
    if (this._pendingLogs && this._pendingLogs.length > 0) {
      this._pendingLogs.forEach((log) => this.logPanel.addLog(log));
      this._pendingLogs = [];
    }

    this.logPanel.addLog(message);
    this.screen.render();
  }

  updateTable(data) {
    this.statusPanel.updateStatus(data);
    this.screen.render();
  }

  updateStats(progress) {
    // Placeholder for future use
    this.screen.render();
  }

  updateBalance(balance) {
    this.info.updateBalance(balance);
    this.screen.render();
  }

  updateStatus(status) {
    this.info.updateStatus(status);
    this.screen.render();
  }

  updateNetwork(network) {
    this.info.updateNetwork(network);
    this.screen.render();
  }

  updateTokens(tokens) {
    this.info.updateTokens(tokens);
    this.screen.render();
  }

  updateLineChart(data) {
    this.chartPanel.updateData(data);
    this.screen.render();
  }

  setCycles(current, total) {
    this.info.updateCycle(current, total);
    this.screen.render();
  }

  updateServiceStatus(name, status) {
    this.statusPanel.updateServiceStatus(name, status);
    this.screen.render();
  }

  addService(name, status) {
    this.statusPanel.addService(name, status);
    this.screen.render();
  }
}

module.exports = Dashboard;
