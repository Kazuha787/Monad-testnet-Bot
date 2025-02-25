const fs = require("fs");
const path = require("path");

let dashboardInstance = null;

class GlobalLogger {
  static setDashboard(dashboard) {
    dashboardInstance = dashboard;
  }

  static log(type, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;

    const logDir = path.join(__dirname, "../../logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(path.join(logDir, "app.log"), logEntry + "\n");

    if (dashboardInstance && dashboardInstance.updateLog) {
      dashboardInstance.updateLog(message);
    }

    return logEntry;
  }
}

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = function (...args) {
  const message = args.join(" ");

  if (dashboardInstance && dashboardInstance.updateLog) {
    dashboardInstance.updateLog(message);
  } else {
    originalConsoleLog.apply(console, args);
  }
};

console.error = function (...args) {
  const message = args.join(" ");

  if (dashboardInstance && dashboardInstance.updateLog) {
    dashboardInstance.updateLog(`ERROR: ${message}`);
  } else {
    originalConsoleError.apply(console, args);
  }
};

console.warn = function (...args) {
  const message = args.join(" ");

  if (dashboardInstance && dashboardInstance.updateLog) {
    dashboardInstance.updateLog(`WARN: ${message}`);
  } else {
    originalConsoleWarn.apply(console, args);
  }
};

console.info = function (...args) {
  const message = args.join(" ");

  if (dashboardInstance && dashboardInstance.updateLog) {
    dashboardInstance.updateLog(`INFO: ${message}`);
  } else {
    originalConsoleInfo.apply(console, args);
  }
};

module.exports = GlobalLogger;
