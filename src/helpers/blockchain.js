import { ethers } from "ethers";
import deployedTokens from "@/assets/data/deployed-tokens.json";
const { wrapContract } = require("redstone-flash-storage/lib/utils/contract-wrapper");

// Will use metamask web3
const provider = new ethers.providers.Web3Provider(web3.currentProvider);

const KO_TOKEN = require('../../artifacts/contracts/KoTokenETH.sol/KoTokenETH');
const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";

async function getTotalSupplyForToken(symbol) {
  // const tokenAddress = deployedTokens[symbol];
  const tokenAddress = deployedTokens["ZCN21"]; // TODO: remove
  const token = new ethers.Contract(tokenAddress, KO_TOKEN.abi, provider);
  const toalSupplyBN = await token.totalSupply();

  return toalSupplyBN.toNumber() + Math.round(Math.random() * 1000); // TODO: remove random
}

// TODO: fix
// async function getLiquidityUSD(symbol) {
//   const tokenAddress = deployedTokens[symbol];
//   let token = new ethers.Contract(tokenAddress, KO_TOKEN.abi, provider);
//   token = wrapContract(token, REDSTONE_STOCKS_PROVIDER);
//   const totalValueBN = await token.totalValue();
//   return totalValueBN.toNumber();
// }

export default {
  getTotalSupplyForToken,
  // getLiquidityUSD,
};
