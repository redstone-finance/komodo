const ethers = require('ethers');
const fs = require('fs');
const provider = require("./ehters-provider");
const uniswapSdk = require("@uniswap/v3-sdk");

const PRIV = fs.readFileSync(".secret").toString().trim();

const NFT_MANAGER_ADDRESS = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const NFT_MANAGER_ABI = require("../uni-abi/NFTPositionManager.json");

const USDC_ADDRESS = "0xe22da380ee6b445bb8273c81944adeb6e8450422";
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

async function increaseLiquidity(pairId) {
  let balance = await usdc.balanceOf(main.address);
  console.log("USDC balance: " + ethers.utils.formatUnits(balance, 6));
  
  let incParams = {
    tokenId: pairId,
    amount0Desired: 0,
    amount1Desired: 10000000,
    amount0Min: 0,
    amount1Min: 0,
    deadline: 10000000000
  }
  
  let tx = await nftManager.increaseLiquidity(incParams, {gasLimit: 1000000});
  console.log(tx.hash);
}

async function mintPosition(pairId) {
  let balance = await usdc.balanceOf(main.address);
  console.log("USDC balance: " + ethers.utils.formatUnits(balance, 6));

  //TODO: Ticks logic

  //
  // let mintParams = {
  //   token0: tokenAddress,
  //   token1: USDC_ADDRESS,
  //   amount0Desired: ethers.utils.parseEther("0.01"),
  //   amount1Desired: ethers.utils.parseUnits("2", 6),
  //   amount0Min: 0,
  //   amount1Min: 0,
  //   recipient: main.address,
  //   deadline: 1725135872
  // };
  //
  //
  //
  //
  // let tx2 = await nftManager.increaseLiquidity(mintParams, {gasLimit: 1000000});
  // let txReceipt2 = await provider.waitForTransaction(tx.hash);
  // console.log("Liquidity added: " + tx2.hash);
  // console.log("Tx status: " + (txReceipt2.status == 1 ? "Success" : "Failed"));

  let tx = await nftManager.increaseLiquidity(incParams, {gasLimit: 1000000});
  console.log(tx.hash);
}

async function createPool(tokenAddress, initialPrice = 200) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, main);
  let balance = await token.balanceOf(main.address);
  console.log("Token balance: " + ethers.utils.formatEther(balance, 6));

  let balanceUSDC = await usdc.balanceOf(main.address);
  console.log("USDC balance: " + ethers.utils.formatUnits(balanceUSDC, 6));


  let sqrtPrice;
  let tx;
  const price = String(Math.round(initialPrice * 1000000));
  if (tokenAddress.localeCompare(usdc.address)) {
    sqrtPrice = uniswapSdk.encodeSqrtRatioX96(price, ethers.utils.parseEther("1"));
    tx = await nftManager.createAndInitializePoolIfNecessary(tokenAddress, USDC_ADDRESS, 10000, sqrtPrice.toString(), {gasLimit: 5000000});
  } else {
    sqrtPrice = uniswapSdk.encodeSqrtRatioX96(ethers.utils.parseEther("1"), price);
    tx = await nftManager.createAndInitializePoolIfNecessary(USDC_ADDRESS, tokenAddress, 10000, sqrtPrice.toString(), {gasLimit: 5000000});
  }
  
  console.log("Price: " + sqrtPrice.toString());

  const txReceipt = await provider.waitForTransaction(tx.hash);
  const txStatus = txReceipt.status == 1 ? "Success" : "Failed";
  console.log("Pool created: " + tx.hash);
  console.log("Tx status: " + txStatus);


  return {   
    uniswapTradeUrl: `https://app.uniswap.org/#/swap?inputCurrency=${tokenAddress}&outputCurrency=${USDC_ADDRESS}`,
    uniswapPoolUrl: `https://app.uniswap.org/#/add/${tokenAddress}/${USDC_ADDRESS}/10000`,
    uniswapPoolTx: tx.hash,
    uniswapPoolTxStatus: txStatus,
  };
}

//mintPosition(kIBM_ID);
//increaseLiquidity(kIBM_ID);

// createPool("0xb9977dd8fdc0e26fd05333f094843ed8ba06a541")

//Pool could be accessed from UI
//https://app.uniswap.org/#/add/[TOKEN_ADDRESS]/[USDC_ADDRESS]/10000
//Example
//https://app.uniswap.org/#/add/0xb9977dd8fdc0e26fd05333f094843ed8ba06a541/0xe22da380ee6B445bb8273C81944ADEB6E8450422/10000


module.exports = {
  createPool,
};
