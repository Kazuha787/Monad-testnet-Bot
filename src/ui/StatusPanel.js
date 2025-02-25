const blessed = require("blessed");
const contrib = require("blessed-contrib");

class StatusPanel {
  constructor(grid, row, col, rowSpan, colSpan) {
    this.table = grid.set(row, col, rowSpan, colSpan, contrib.table, {
      keys: true,
      fg: "white",
      label: "Service Status",
      columnSpacing: 3,
      columnWidth: [20, 12, 20],
      border: { type: "line", fg: "cyan" },
    });

    // Initialize with empty data
    this.updateStatus([]);
  }

  updateStatus(data) {
    if (!this.table) return;

    this.table.setData({
      headers: ["Service", "Status", "Last Update"],
      data: data || [],
    });
  }

  addService(name, status = "Pending") {
    const timestamp = new Date().toLocaleTimeString();

    // Pastikan rows ada, lalu coba akses data
    let tableData = [];
    try {
      if (
        this.table.rows &&
        Array.isArray(this.table.rows) &&
        typeof this.table.rows.slice === "function"
      ) {
        tableData = this.table.rows.slice(1); // Remove headers
      }
    } catch (error) {
      console.error("Error accessing table rows:", error.message);
    }

    // Check if service already exists
    const serviceIndex = tableData.findIndex((row) => row && row[0] === name);

    if (serviceIndex !== -1) {
      // Update existing service
      tableData[serviceIndex] = [name, status, timestamp];
    } else {
      // Add new service
      tableData.push([name, status, timestamp]);
    }

    this.updateStatus(tableData);
  }

  updateServiceStatus(name, status) {
    const timestamp = new Date().toLocaleTimeString();

    // Pastikan rows ada, lalu coba akses data
    let tableData = [];
    try {
      if (
        this.table.rows &&
        Array.isArray(this.table.rows) &&
        typeof this.table.rows.slice === "function"
      ) {
        tableData = this.table.rows.slice(1); // Remove headers
      }
    } catch (error) {
      console.error("Error accessing table rows:", error.message);
    }

    // Find and update service
    const serviceIndex = tableData.findIndex((row) => row && row[0] === name);

    if (serviceIndex !== -1) {
      tableData[serviceIndex] = [name, status, timestamp];
      this.updateStatus(tableData);
    } else {
      // Jika service tidak ditemukan, tambahkan
      this.addService(name, status);
    }
  }
}

module.exports = StatusPanel;
