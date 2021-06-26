const ethers = require('ethers');
const fs = require('fs');
const provider = ethers.getDefaultProvider('kovan');

const PRIV = fs.readFileSync(".secret").toString().trim();

const NFT_MANAGER_ADDRESS = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const NFT_MANAGER_ABI = require("../uni-abi/NFTPositionManager.json");

const USDC_ADDRESS = "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede";
const ERC20_ABI = require("../uni-abi/ERC20.json");

const main = new ethers.Wallet(PRIV, provider);
console.log("MAIN: " + main.address);

const nftManager = new ethers.Contract(NFT_MANAGER_ADDRESS, NFT_MANAGER_ABI, main);
const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, main);



async function checkState() {
  let balance = await provider.getBalance(main.address);
  console.log(ethers.utils.formatEther(balance));
  
  let bal = await nftManager.balanceOf(main.address);
  console.log("My NFT balance: " + bal);
  
}

async function addToPosition() {
  let balance = await usdc.balanceOf(main.address);
  console.log("USDC balance: " + ethers.utils.formatUnits(balance, 6));
  
  let incParams = {
    tokenId: 3563,
    amount0Desired: 25000000,
    amount1Desired: 0,
    amount0Min: 0,
    amount1Min: 0,
    deadline: 10000000000
  }
  
  let tx = await nftManager.increaseLiquidity(incParams, {gasLimit: 1000000});
  console.log(tx.hash);
}

addToPosition();
