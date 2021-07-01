import { ethers } from "ethers";
import sleep from "./sleep";
import deployedTokens from "@/assets/data/deployed-tokens.json";
const { wrapContract } = require("redstone-flash-storage/lib/utils/contract-wrapper");

const { ethereum, web3 } = window;

const DEFAULT_SOLVENCY = 150; // 150%
const MIN_SOLVENCY = 121; // 121%

// Connect app to metamask
ethereum.enable();

// Will use metamask web3
const provider = new ethers.providers.Web3Provider(web3.currentProvider);

const KO_TOKEN = require('../../artifacts/contracts/KoTokenETH.sol/KoTokenETH');
const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";

const parseNumber = (number) => ethers.utils.parseEther(String(number));
const bigNumberPriceToNumber = (bn) => Number(ethers.utils.formatEther(bn));

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

async function getLiquidityForToken(symbol) {
  const token = await getTokenContract(symbol);
  const toalSupplyBN = await token.totalSupply();
  return bigNumberPriceToNumber(toalSupplyBN);
}

async function getSigner() {
  await ethereum.enable();
  const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner();
  return signer;
}

async function mint(symbol, amount, stakeAmount) {
  const token = await getTokenContractForTxSending(symbol);

  return await token.mintWithPrices(parseNumber(amount), {
    value: parseNumber(stakeAmount),
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
  });
}

async function removeCollateral(symbol, amount) {
  const token = await getTokenContractForTxSending(symbol);

  return await token.removeCollateralWithPrices(parseNumber(amount));
}

async function getCollateralAmount(symbol) {
  const token = await getTokenContractForTxSending(symbol);
  const address = await getAddress();

  const collateral = await token.collateralOf(address);
  
  return bigNumberPriceToNumber(collateral);
}

async function getSolvency(symbol) {
  const token = await getTokenContractForTxSending(symbol);
  const address = await getAddress();
  const solvency = await token.solvencyOfWithPrices(address);

  return solvency.toNumber() / 10;
}

async function getBalance(symbol) {
  const token = await getTokenContractForTxSending(symbol);
  const address = await getAddress();
  const balance = await token.balanceOf(address);
  return bigNumberPriceToNumber(balance);
}

async function getEthBalance() {
  const address = await getAddress();
  const balance = await provider.getBalance(address);
  return bigNumberPriceToNumber(balance);
}

function calculateStakeAmount({
  tokenAmount,
  tokenPrice,
  ethPrice,
  solvency = DEFAULT_SOLVENCY,
}) {
  const currentTokenEthPrice = tokenPrice / ethPrice;
  const stake = (solvency / 100) * tokenAmount * currentTokenEthPrice;
  return stake;
}

// async function getLiquidityUSD(symbol) {
//   const token = await getTokenContractForTxSending(symbol);
//   const totalValueBN = await token.totalValueWithPrices();
//   return bigNumberPriceToNumber(totalValueBN);
// }

export default {
  // Utils
  calculateStakeAmount,

  // Getters
  getLiquidityForToken,
  getSolvency,
  getCollateralAmount,
  getBalance,
  getEthBalance,

  // Network
  getNetworkName,
  onNetworkChange,

  // Token tx methods
  mint,
  burn,
  addCollateral,
  removeCollateral,

  // Const
  DEFAULT_SOLVENCY,
  MIN_SOLVENCY,
};
