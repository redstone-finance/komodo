const fs = require("fs");
const deployKoBoostToken = require("./deployKoBoost");
const uniswap = require("./uni");
const commodities = require("../src/assets/data/commodities.json");

// Set to 0 to disable limit
const LIMIT = 3;

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
  const addresses = await deployKoBoostToken(symbol);
  console.log("-----------------------------------");
  const uniswapAddresses = await uniswap.createPool(addresses.redstoneProxy);
  return {
    ...addresses,
    ...uniswapAddresses,
  };
}
