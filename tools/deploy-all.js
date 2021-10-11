const fs = require("fs");
const redstone = require("redstone-api");
const deployKoBoostUSD = require("./deploy-ko-boost-usd");
const deployKoBoostETH = require("./deploy-ko-boost-eth");
const uniswap = require("./uni");
const commodities = require("../src/assets/data/commodities.json");

// Set to 0 to disable limit
const LIMIT = 0;
const OFFSET = 0;

main();

async function main() {
  const finalReport = {};
  let index = 0, deployedCount = 0;

  try {
    for (const symbol in commodities) {
      if (LIMIT > 0 && deployedCount >= LIMIT) {
        break;
      } else {
        if (index >= OFFSET) {
          console.log(`===== Deploying token nr ${index}: ${symbol}. Started =====`);
          const addresses = await deployKoToken(symbol);
          finalReport[symbol] = addresses;
          deployedCount++;
          console.log(`===== Deploying token: ${symbol}. Completed =====`);
          console.log("-----------------------------------");
        } else {
          console.log(`===== Skipping token: ${symbol} =====`);
        }
      }
      index++;
    }
  } catch (e) {
    console.error(e);
    console.log("Token deployment stopped. Saving report...");
  } finally {
    console.log("===== Final report =====");
    console.log(finalReport);

    const filename = `./deploy-report-${Date.now()}.json`;
    console.log(`===== Saving report to a file: ${filename} =====`);
    fs.writeFileSync(filename, JSON.stringify(finalReport, null, 2));
  }
}

async function deployKoToken(symbol) {
  const usdcAddresses = await deployKoTokenUsd(symbol);
  const ethAddresses = await deployKoTokenEth(symbol);
  return {
    "ETH": ethAddresses,
    "USDC": usdcAddresses,
  };
}

async function deployKoTokenEth(symbol) {
  console.log(`=== Deploying koTokenEth for ${symbol}. Started ===`);
  const addresses = await deployKoBoostETH(symbol);
  const price = await redstone.getPrice(symbol, {provider: "redstone-stocks"});
  console.log(
    `=== Creating a uniswap pool with initial price: $${price.value} for symbol: ${symbol} ===`);
  const uniswapAddresses = await uniswap.createPool(addresses.koToken, price.value);
  console.log(`=== Deploying koTokenEth for ${symbol}. Completed ===`);
  return {
    ...addresses,
    ...uniswapAddresses,
  };
}

async function deployKoTokenUsd(symbol) {
  console.log(`=== Deploying koTokenUsd for ${symbol}. Started ===`);
  const addresses = await deployKoBoostUSD(symbol);
  console.log("-----------------------------------");
  const price = await redstone.getPrice(symbol, {provider: "redstone-stocks"});
  console.log(
    `=== Creating a uniswap pool with initial price: $${price.value} for symbol: ${symbol} ===`);
  const uniswapAddresses = await uniswap.createPool(addresses.koToken, price.value);
  console.log(`=== Deploying koTokenUsd for ${symbol}. Completed ===`);
  return {
    ...addresses,
    ...uniswapAddresses,
  };
}
