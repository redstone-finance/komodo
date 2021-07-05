const ethers = require('ethers');

const kovanProvider = ethers.getDefaultProvider('kovan');
const polygonProvider =
  new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com");

// module.exports = kovanProvider;
module.exports = polygonProvider;
