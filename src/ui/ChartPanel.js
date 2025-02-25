const contrib = require("blessed-contrib");

class ChartPanel {
  constructor(grid, row, col, rowSpan, colSpan) {
    this.lineChart = grid.set(row, col, rowSpan, colSpan, contrib.line, {
      style: {
        line: "yellow",
        text: "green",
        baseline: "black",
      },
      xLabelPadding: 3,
      xPadding: 5,
      showLegend: false,
      wholeNumbersOnly: false,
      label: "Transaction Amounts",
      minY: 0,
      maxY: 1,
      border: { type: "line", fg: "cyan" },
    });

    // Initialize with empty data
    this.updateData([
      {
        time: new Date().toLocaleTimeString(),
        amount: 0,
      },
    ]);
  }

  updateData(data) {
    try {
      if (!this.lineChart) return;
      if (!Array.isArray(data)) data = [];

      const series = [
        {
          title: "Transactions",
          x: data.map((d) => d.time || new Date().toLocaleTimeString()),
          y: data.map((d) => Number(d.amount) || 0),
          style: { line: "yellow" },
        },
      ];

      const maxAmount = Math.max(...series[0].y, 0.1);
      this.lineChart.options.maxY = maxAmount * 1.2;

      this.lineChart.setData(series);
    } catch (error) {
      console.error("Error updating line chart:", error);
    }
  }
}

module.exports = ChartPanel;
