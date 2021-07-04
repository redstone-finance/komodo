const fs = require("fs");
const commodities = require("../src/assets/data/commodities.json");
const deployed = require("../src/assets/data/deployed-tokens.json");
const template = require("../src/assets/data/tokenListTemplate.json");


async function main(version = 2) {
  template.tokens = [];
  for (const symbol in commodities) {    
      console.log(`Processing: ${symbol}.`);
      const addresses = deployed[symbol];
      if (addresses) {
      console.log('Address: ' + addresses.redstoneProxy);
      template.tokens.push({
        "chainId": 42,
        "address": addresses.redstoneProxy,
        "symbol": symbol,
        "name": commodities[symbol].name,
        "decimals": 18,
        "logoURI": commodities[symbol].logoURI,
        "tags": [
          "commodity"
        ]
      });
    }
  }
  
  template.version.minor = version;

  console.log("=== Final token list ===");
  console.log(template);

  const filename = "tokenListGenerated.json";
  console.log(`=== Saving report to a file: ${filename} ===`);
  fs.writeFileSync(filename, JSON.stringify(template, null, 2), { flag: 'w' });
}

main(3);
