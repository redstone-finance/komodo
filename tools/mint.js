const ethers = require('ethers');
const fs = require('fs');
const { wrapContract } = require("redstone-flash-storage/lib/utils/contract-wrapper");


const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";
const KO_TOKEN = require('../artifacts/contracts/KoToken.sol/KoToken');

const provider = ethers.getDefaultProvider('kovan');

const PRIV = fs.readFileSync(".secret").toString().trim();
const main = new ethers.Wallet(PRIV, provider);
console.log("MAIN: " + main.address);


async function mint(address) {
  let token = new ethers.Contract(address, KO_TOKEN.abi, main);
  token = wrapContract(token, REDSTONE_STOCKS_PROVIDER);
  let tx = await token.mintWithPrices(1, {value: 1});
  console.log("Tokens minted: " + tx.hash);
}

mint("0x9D93419406b8dB34176ce056a106f96ce819ca44");
