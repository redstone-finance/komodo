const ethers = require('ethers');
const fs = require('fs');
const provider = ethers.getDefaultProvider('kovan');

const PRIV = fs.readFileSync(".secret").toString().trim();

const LENDING_POOL_ADDRESS = "e0fba4fc209b4948668006b2be61711b7f465bae";
const LENDING_POOL_ASSET = "e22da380ee6b445bb8273c81944adeb6e8450422";

const LENDING_POOL = require("../artifacts/contracts/ILendingPool.sol/ILendingPool");


const USDC_ADDRESS = "0xe22da380ee6b445bb8273c81944adeb6e8450422";
const ERC20_ABI = require("../uni-abi/ERC20.json");

const main = new ethers.Wallet(PRIV, provider);
console.log("MAIN: " + main.address);

const lendingPool = new ethers.Contract(LENDING_POOL_ADDRESS, LENDING_POOL.abi, main);
const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, main);





async function deposit() {
  let balance = await usdc.balanceOf(main.address);
  console.log("USDC balance: " + ethers.utils.formatUnits(balance, 6));


  //Aprove USDC
  let txa = await usdc.approve(lendingPool.address, ethers.utils.parseUnits("1", 6));
  await txa.wait();
  console.log("Tokens approved: " + txa.hash);
  

  let tx = await lendingPool.deposit(LENDING_POOL_ASSET, ethers.utils.parseUnits("1", 6), main.address, 0, {gasLimit:1000000});
  console.log("Depositing: " + tx.hash);
  let receipt = await provider.waitForTransaction(tx.hash);
  console.log("Result: " + receipt.status);

}


deposit();
