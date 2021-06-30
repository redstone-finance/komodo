const ethers = require('ethers');
const fs = require('fs');
const { wrapContract } = require("redstone-flash-storage/lib/utils/contract-wrapper");


const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";
const KO_TOKEN = require('../artifacts/contracts/KoTokenUSD.sol/KoTokenUSD');
const ERC20_ABI = require("../uni-abi/ERC20.json");

const USDC_ADDRESS = "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede";

const provider = ethers.getDefaultProvider('kovan');

const PRIV = fs.readFileSync(".secret").toString().trim();
const main = new ethers.Wallet(PRIV, provider);
console.log("MAIN: " + main.address);


async function mint(address) {
  let usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, main);
  let usdcBalance = await usdc.balanceOf(main.address);
  console.log("USDC balance: " + ethers.utils.formatUnits(usdcBalance, 6));
  
  //Aprove USDC
  let tx = await usdc.approve(address, ethers.utils.parseUnits("5", 6));
  await tx.wait();
  console.log("Tokens approved: " + tx.hash);
  
  
  let token = new ethers.Contract(address, KO_TOKEN.abi, main);
  token = wrapContract(token, REDSTONE_STOCKS_PROVIDER, "IBM");
  
  let txMint = await token.mintWithPrices(ethers.utils.parseEther("0.01"), ethers.utils.parseUnits("5", 6), {gasLimit:2000000});
  let txReceipt = await provider.waitForTransaction(txMint.hash);
  console.log("Tokens minted: " + txMint.hash);
  console.log("Gas used: " + txReceipt.gasUsed.toString());
}

mint("0xD3b745c8D3fDA3446d7E26c576cee1D45AD56a52");
