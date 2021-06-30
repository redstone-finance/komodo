import { ethers } from "ethers";
import sleep from "./sleep";
import deployedTokens from "@/assets/data/deployed-tokens.json";
const { wrapContract } = require("redstone-flash-storage/lib/utils/contract-wrapper");

// Connect app to metamask
ethereum.enable();

// Will use metamask web3
const provider = new ethers.providers.Web3Provider(web3.currentProvider);

const KO_TOKEN = require('../../artifacts/contracts/KoTokenETH.sol/KoTokenETH');
const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";

const parseNumber = (number) => ethers.utils.parseEther(String(number));

async function getAddress() {
  const signer = await getSigner();
  return signer.getAddress();
}

async function getTokenContract(symbol, opts = {}) {
  // const tokenAddress = deployedTokens[symbol];
  const tokenAddress = deployedTokens["ZCN21"];

  // Getting signer if needed
  let signerOrProvider = provider;
  if (opts.withSigner) {
    const signer = await getSigner();
    signerOrProvider = signer;
  }

  let token = new ethers.Contract(tokenAddress, KO_TOKEN.abi, signerOrProvider);

  // Wrapping with redstone-api if needed
  if (opts.wrapWithRedstone) {
    token = wrapContract(token, REDSTONE_STOCKS_PROVIDER);
  }

  return token;
}

async function getTokenContractForTxSending(symbol) {
  return await getTokenContract(symbol, {
    wrapWithRedstone: true,
    withSigner: true,
  });
}

async function getNetworkName() {
  await sleep(1000);
  if (provider && provider._network) {
    return provider._network.name;
  } else {
    return await getNetworkName();
  }
}

function onNetworkChange(callback) {
  window.ethereum.on('chainChanged', chainId => {
    callback(chainId);
  });
}

async function getTotalSupplyForToken(symbol) {
  const token = await getTokenContract(symbol);
  const toalSupplyBN = await token.totalSupply();
  return toalSupplyBN.toNumber() + Math.round(Math.random() * 1000); // TODO: remove random
}

async function getSigner() {
  await ethereum.enable();
  const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner();
  return signer;
}

async function mint(symbol, amount) {
  const token = await getTokenContractForTxSending(symbol);

  return await token.mint(parseNumber(amount), {
    value: ethers.utils.parseEther("0.1"),
    gasLimit: 1000000,
  });
}

async function burn(symbol, amount) {
  const token = await getTokenContractForTxSending(symbol);

  return await token.burn(parseNumber(amount), {
    gasLimit: 1000000,
  });
}

async function addCollateral(symbol, amount) {
  const token = await getTokenContractForTxSending(symbol);

  return await token.addCollateral({
    value: parseNumber(amount),
    gasLimit: 1000000,
  });
}

async function removeCollateral(symbol, amount) {
  const token = await getTokenContractForTxSending(symbol);

  return await token.removeCollateral(parseNumber(amount), {
    gasLimit: 1000000,
  });
}

async function getCollateralAmount(symbol) {
  const token = await getTokenContractForTxSending(symbol);
  const address = await getAddress();

  const collateral = await token.collateralOf(address);
  
  return Number(ethers.utils.formatEther(collateral));
}

async function getSolvency(symbol) {
  // const token = await getTokenContractForTxSending(symbol);
  // const address = await getAddress();

  // It throws the following error
  // {code: -32015, message: "VM execution error.", data: "Reverted 0x08c379a...
  // Probably because solvencyOf getter uses collateralValueOf under the hood

  // const solvency = await token.solvencyOf(address);
  // console.log({solvency});

  return 117;
}

async function getBalance(symbol) {
  const token = await getTokenContractForTxSending(symbol);
  const address = await getAddress();
  return await token.balanceOf(address);
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
  // Getters
  getTotalSupplyForToken,
  getLiquidityForSymbol: getTotalSupplyForToken,
  getSolvency,
  getCollateralAmount,
  getBalance,

  // Network
  getNetworkName,
  onNetworkChange,

  // Token tx methods
  mint,
  burn,
  addCollateral,
  removeCollateral,
};
