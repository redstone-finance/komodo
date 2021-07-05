const ethers = require('ethers');
const fs = require('fs');
const provider = require("./ehters-provider");

const PRIV = fs.readFileSync(".secret").toString().trim();

const LENDING_POOL_ADDRESS = "e0fba4fc209b4948668006b2be61711b7f465bae";
const WETH_GATEWAY_ADDRESS = "0xa61ca04df33b72b235a8a28cfb535bb7a5271b70";

const LENDING_POOL_ASSET = "e22da380ee6b445bb8273c81944adeb6e8450422";

const LENDING_POOL = require("../artifacts/contracts/ILendingPool.sol/ILendingPool");
const WETH_GATEWAY = require("../artifacts/contracts/IWethGateway.sol/IWethGateway");

const WETH_GATEWAY_RESERVE = "0xe0fba4fc209b4948668006b2be61711b7f465bae";

const USDC_ADDRESS = "0xe22da380ee6b445bb8273c81944adeb6e8450422";
const ERC20_ABI = require("../uni-abi/ERC20.json");
const AWETH = "0x87b1f4cf9bd63f7bbd3ee1ad04e8f52540349347";

const main = new ethers.Wallet(PRIV, provider);
console.log("MAIN: " + main.address);

const lendingPool = new ethers.Contract(LENDING_POOL_ADDRESS, LENDING_POOL.abi, main);
const wethGateway = new ethers.Contract(WETH_GATEWAY_ADDRESS, WETH_GATEWAY.abi, main); 



const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, main);
const aWeth = new ethers.Contract(AWETH, ERC20_ABI, main); 





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


async function depositETH() {

  let tx = await wethGateway.depositETH(WETH_GATEWAY_RESERVE, main.address, 0, {gasLimit:1000000, value:  ethers.utils.parseEther("0.1", 6)});
  console.log("Depositing ETH: " + tx.hash);
  let receipt = await provider.waitForTransaction(tx.hash);
  console.log("Result: " + receipt.status);

}

async function checkBalance() {
  let balance = await aWeth.balanceOf(main.address);
  console.log(balance.toString());
}


checkBalance();
