const ethers = require('ethers');
const fs = require('fs');
const { wrapContract } = require("redstone-flash-storage/lib/utils/contract-wrapper");


const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";
const KO_TOKEN = require('../artifacts/contracts/KoTokenBoostedETH.sol/KoTokenBoostedETH');
const ERC20_ABI = require("../uni-abi/ERC20.json");

const USDC_ADDRESS = "e22da380ee6b445bb8273c81944adeb6e8450422";

const provider = require("./ehters-provider");

const PRIV = fs.readFileSync(".secret").toString().trim();
const main = new ethers.Wallet(PRIV, provider);
console.log("MAIN: " + main.address);

const AWETH = "0x87b1f4cf9bd63f7bbd3ee1ad04e8f52540349347";

const aWeth = new ethers.Contract(AWETH, ERC20_ABI, main);


async function mint(address) {
  let token = new ethers.Contract(address, KO_TOKEN.abi, main);
  token = wrapContract(token, REDSTONE_STOCKS_PROVIDER);

  let txMint = await token.mintWithPrices(ethers.utils.parseEther("1"), {gasLimit:2000000, value: ethers.utils.parseEther("0.1")});
  let txReceipt = await provider.waitForTransaction(txMint.hash);
  console.log("Tokens minted: " + txMint.hash);
  console.log("Gas used: " + txReceipt.gasUsed.toString());
  console.log("Tx status: " + (txReceipt.status == 1 ? "Success" : "Failed"));
}



async function remove(address) {
  let token = new ethers.Contract(address, KO_TOKEN.abi, main);
  token = wrapContract(token, REDSTONE_STOCKS_PROVIDER);
  
  let balance = await aWeth.balanceOf(token.address);
  console.log("AWeth: " + ethers.utils.formatEther(balance));

  let txRemove = await token.removeCollateral(ethers.utils.parseEther("0.01"), {gasLimit:2000000});
  let txReceipt = await provider.waitForTransaction(txRemove.hash);
  console.log("Collateral removed: " + txRemove.hash);
  console.log("Gas used: " + txReceipt.gasUsed.toString());
  console.log("Tx status: " + (txReceipt.status == 1 ? "Success" : "Failed"));
}

async function checkCollateral(address) {
  let token = new ethers.Contract(address, KO_TOKEN.abi, main);
  token = wrapContract(token, REDSTONE_STOCKS_PROVIDER);

  let balance = await token.collateralOf(main.address);
  console.log("Current collateral: " + ethers.utils.formatEther(balance));

  setTimeout(() => checkCollateral(address), 1000)
}

// mint("0xa20348912B4d38F71b54E7cb1e420D8B92D7229d");
//remove("0xa20348912B4d38F71b54E7cb1e420D8B92D7229d");
// checkCollateral("0xa20348912B4d38F71b54E7cb1e420D8B92D7229d");

mint("0x0f1BDaDb0d60FeC16827ED5A12EC9186328CfD56");
