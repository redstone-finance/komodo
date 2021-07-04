const fs = require("fs");
const redstone = require("redstone-api");
const deployKoTokenLite = require("./deployKoBoostEth");
const uniswap = require("./uni");
const commodities = require("../src/assets/data/commodities.json");

// Set to 0 to disable limit
const LIMIT = 1;

main();

async function main() {
  const finalReport = {};
  let index = 0;
  for (const symbol in commodities) {
    if (LIMIT > 0 && index >= LIMIT) {
      break;
    } else {
      console.log(`=== Deploying token: ${symbol}. Started ===`);
      const addresses = await deployKoToken(symbol);
      finalReport[symbol] = addresses;
      console.log(`=== Deploying token: ${symbol}. Completed ===`);
      index++;
    }
  }

  console.log("=== Final report ===");
  console.log(finalReport);

  const filename = `./deploy-report-${Date.now()}.json`;
  console.log(`=== Saving report to a file: ${filename} ===`);
  fs.writeFileSync(filename, JSON.stringify(finalReport, null, 2));
}

async function deployKoToken(symbol) {
  const addresses = await deployKoTokenLite(symbol);
  console.log("-----------------------------------");
  const price = await redstone.getPrice(symbol, {provider: "redstone-stocks"});
  console.log(
    `=== Creating a uniswap pool with initial price: $${price.value} for symbol: ${symbol} ===`);
  const uniswapAddresses = await uniswap.createPool(addresses.redstoneProxy, price.value);
  return {
    ...addresses,
    ...uniswapAddresses,
  };
}
