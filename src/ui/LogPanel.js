const blessed = require("blessed");
const contrib = require("blessed-contrib");

class LogPanel {
  constructor(grid, row, col, rowSpan, colSpan) {
    this.log = grid.set(row, col, rowSpan, colSpan, contrib.log, {
      fg: "green",
      selectedFg: "green",
      label: "Transaction Logs",
      border: { type: "line", fg: "cyan" },
      scrollback: 100,
      scrollbar: {
        ch: " ",
        track: { bg: "cyan" },
        style: { inverse: true },
      },
    });

    this.setupListeners();
  }

  setupListeners() {
    this.log.on("click", function (mouse) {
      if (mouse.button === "right") {
        this.setScrollPerc(100);
      } else {
        this.scroll(mouse.button === "left" ? -1 : 1);
      }
      this.screen.render();
    });
  }

  addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.log.log(`[${timestamp}] ${message}`);
  }

  clear() {
    this.log.setContent("");
  }
}

module.exports = LogPanel;
