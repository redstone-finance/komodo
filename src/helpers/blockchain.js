import { ethers } from "ethers";
import sleep from "./sleep";
import deployedTokens from "@/assets/data/deployed-tokens.json";

const { wrapContract } = require("redstone-flash-storage/lib/utils/contract-wrapper");
const KO_TOKEN = require('../../artifacts/contracts/KoTokenBoostedUSD.sol/KoTokenBoostedUSD');
const ERC20_ABI = require('../../uni-abi/ERC20.json');

const DEFAULT_SOLVENCY = 150; // 150%
const MIN_SOLVENCY = 121; // 121%
const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";
const USDC_ADDRESS = "e22da380ee6b445bb8273c81944adeb6e8450422";

const { ethereum, web3 } = window;

// Connect app to metamask
ethereum.enable();

// Will use metamask web3
const provider = new ethers.providers.Web3Provider(web3.currentProvider);

const parseNumber = (number) => ethers.utils.parseEther(String(number));
const bigNumberPriceToNumber = (bn) => Number(ethers.utils.formatEther(bn));
const formatUsdcUnits = (bn) => Number(ethers.utils.formatUnits(bn, 6));
const parseUsdcNumber = (number) =>
  ethers.utils.parseUnits(String(Math.round(number, 6)), 6);

async function getAddress() {
  const signer = await getSigner();
  return signer.getAddress();
}

async function getUsdcContract() {
  const signer = await getSigner();
  return new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
}

function getAddressForSymbol(symbol, addressType) {
  const tokenAddresses = deployedTokens[symbol];
  if (!tokenAddresses) {
    throw new Error(`Token addresses not found for token: ${symbol}`);
  }
  const address = tokenAddresses[addressType];
  if (!address) {
    throw new Error(`No "${addressType}" address for token: ${symbol}`);
  }
  return address;
}

function getEtherscanUrlForToken(symbol) {
  const tokenAddress = getAddressForSymbol(symbol, "redstoneProxy");
  return 'https://kovan.etherscan.io/token/' + tokenAddress;
}

function getEtherscanUrlForBoostedCollateral() {
  return "https://kovan.etherscan.io/address/0xe12AFeC5aa12Cf614678f9bFeeB98cA9Bb95b5B0";
}

async function getTokenContract(symbol, opts = {}) {
  const tokenAddress = getAddressForSymbol(symbol, "redstoneProxy");

  // Getting signer if needed
  let signerOrProvider = provider;
  if (opts.withSigner) {
    const signer = await getSigner();
    signerOrProvider = signer;
  }

  let token = new ethers.Contract(tokenAddress, KO_TOKEN.abi, signerOrProvider);

  // Wrapping with redstone-api if needed
  if (opts.wrapWithRedstone) {
    // TODO: uncomment
    // token = wrapContract(token, REDSTONE_STOCKS_PROVIDER, symbol);
    token = wrapContract(token, REDSTONE_STOCKS_PROVIDER, symbol);
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

// Value taken from https://loanscan.io/
async function getCurrentInterestRateForUsdcOnAave() {
  return 1.6 + Math.random() / 100; // 1.6 %
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

  return await token.mintWithPrices(
    parseNumber(amount),
    parseUsdcNumber(stakeAmount));
}

async function burn(symbol, amount) {
  const token = await getTokenContractForTxSending(symbol);

  return await token.burn(parseNumber(amount), {
    gasLimit: 1000000,
  });
}

async function addCollateral(symbol, amount) {
  const token = await getTokenContractForTxSending(symbol);
  return await token.addCollateral(parseUsdcNumber(amount));
}

async function approveUsdcSpending(amount, symbol) {
  const token = await getTokenContractForTxSending(symbol);
  const usdc = await getUsdcContract();

  return await usdc.approve(token.address, parseUsdcNumber(amount));
}

async function removeCollateral(symbol, amount) {
  const token = await getTokenContractForTxSending(symbol);
  return await token.removeCollateralWithPrices(parseUsdcNumber(amount));
}

async function getCollateralAmount(symbol) {
  const token = await getTokenContractForTxSending(symbol);
  const address = await getAddress();

  const collateral = await token.collateralOf(address);
  
  return formatUsdcUnits(collateral);
}

async function getSolvency(symbol) {
  const token = await getTokenContractForTxSending(symbol);
  const address = await getAddress();
  const solvency = await token.solvencyOfWithPrices(address);

  if (solvency.gt(100000)) {
    return 100000;
  } else {
    return solvency.toNumber() / 10;
  }
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

async function getUsdcBalance() {
  const address = await getAddress();
  const usdc = await getUsdcContract();
  const balance = await usdc.balanceOf(address);
  return formatUsdcUnits(balance, 6);
}

function calculateStakeAmount({
  tokenAmount,
  tokenPrice,
  solvency = DEFAULT_SOLVENCY,
}) {
  const stake = (solvency / 100) * tokenAmount * tokenPrice;
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
  getAddressForSymbol,
  getEtherscanUrlForToken,
  getEtherscanUrlForBoostedCollateral,

  // Getters
  getLiquidityForToken,
  getSolvency,
  getCollateralAmount,
  getBalance,
  getEthBalance,
  getUsdcBalance,
  getCurrentInterestRateForUsdcOnAave,

  // Network
  getNetworkName,
  onNetworkChange,

  // Transactions methods
  mint,
  burn,
  addCollateral,
  removeCollateral,
  approveUsdcSpending,

  // Const
  DEFAULT_SOLVENCY,
  MIN_SOLVENCY,
};
