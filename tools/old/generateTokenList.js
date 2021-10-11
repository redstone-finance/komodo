const fs = require("fs");
const commodities = require("../src/assets/data/commodities.json");
const deployed = require("../src/assets/data/deployed-tokens.json");
const template = require("../src/assets/data/tokenListTemplate.json");

async function main(version = 2, baseToken) {
  template.tokens = [];
  for (const symbol in commodities) {    
      console.log(`Processing: ${symbol}.`);
      const addresses = getAddresses(symbol, baseToken);
      if (addresses) {
      console.log("Address: " + addresses.redstoneProxy);
      template.tokens.push({
        "chainId": 42,
        "address": addresses.redstoneProxy,
        "symbol": symbol,
        "name": getCommodityName(symbol),
        "decimals": 18,
        "logoURI": commodities[symbol].logoURI,
        "tags": [
          "commodity"
        ]
      });
    }
  }

  template.name += baseToken;
  
  template.version.minor = version;

  console.log("=== Final token list ===");
  console.log(template);

  const filename = "tokenListGenerated.json";
  console.log(`=== Saving report to a file: ${filename} ===`);
  fs.writeFileSync(filename, JSON.stringify(template, null, 2), { flag: "w" });
}

function getCommodityName(symbol) {
  const charsToRemove = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "#", "(", ")"];
  const originalName = commodities[symbol].name;
  return removeChars(originalName, charsToRemove);
}

function removeChars(str, charsToRemove) {
  let result = str;
  for (const charToRemove of charsToRemove) {
    result = result.replace(charToRemove, "");
  }
  return result;
}

function getAddresses(symbol, baseToken) {
  const allAddresses = deployed[symbol];
  if (allAddresses && allAddresses[baseToken]) {
    return allAddresses[baseToken];
  }
}

module.exports = main;
