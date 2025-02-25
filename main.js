const Application = require("./src/app");
const Utils = require("./src/core/Utils");

const earlyLogs = [];
console.log = function (...args) {
  earlyLogs.push(args.join(" "));
};

console.error = function (...args) {
  earlyLogs.push(`ERROR: ${args.join(" ")}`);
};

async function main() {
  try {
    Utils.logger("info", "Starting Monad BOT application");
    const app = new Application();
    await app.start();

    if (app.dashboard) {
      earlyLogs.forEach((log) => {
        app.dashboard.updateLog(log);
      });
    }
  } catch (error) {
    Utils.logger("error", `Fatal startup error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
