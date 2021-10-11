const ethers = require('ethers');
const fs = require('fs');
const { wrapContract } = require("redstone-flash-storage/lib/utils/contract-wrapper");

const toBytes32 = ethers.utils.formatBytes32String;

const provider = require("./ehters-provider");
const PRIV = fs.readFileSync(".secret").toString().trim();
const main = new ethers.Wallet(PRIV, provider);
console.log("MAIN: " + main.address);

const KO_TOKEN = require('../artifacts/contracts/KoTokenUSD.sol/KoTokenUSD');
const koFactory = new ethers.ContractFactory(KO_TOKEN.abi, KO_TOKEN.bytecode, main);

const REDSTONE_PROXY = require('../artifacts/redstone-flash-storage/lib/contracts/RedstoneUpgradeableProxy.sol/RedstoneUpgradeableProxy.json');
const redstoneProxyFactory = new ethers.ContractFactory(REDSTONE_PROXY.abi, REDSTONE_PROXY.bytecode, main);

const PRICE_FEED = require('../artifacts/redstone-flash-storage/lib/contracts/PriceFeedWithVerification.sol/PriceFeedWithVerification');
const priceFeedFactory = new ethers.ContractFactory(PRICE_FEED.abi, PRICE_FEED.bytecode, main);

//const VERIFIER_FACTORY = require('../artifacts/redstone-flash-storage/lib/contracts/PriceVerifier.sol/PriceVerifier');
//const verifierFactory = new ethers.ContractFactory(VERIFIER_FACTORY.abi, VERIFIER_FACTORY.bytecode, main);


const USDC_ADDRESS = "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede";
const ERC20_ABI = require("../uni-abi/ERC20.json");
const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, main);

const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";
const REDSTONE_STOCKS_PROVIDER_ADDRESS = "0x926E370fD53c23f8B71ad2B3217b227E41A92b12";

async function deployKoToken(asset) {
  //let verifier = await verifierFactory.deploy();
  //await verifier.deployed();
  //console.log("Verifier deployed: " + verifier.address);

  let priceFeed = await priceFeedFactory.deploy(300);
  await priceFeed.deployed();
  console.log("Price feed deployed: " + priceFeed.address);

  let authTx = await priceFeed.authorizeSigner(REDSTONE_STOCKS_PROVIDER_ADDRESS);
  await authTx.wait();
  console.log("Authorized redstone signer: ", REDSTONE_STOCKS_PROVIDER_ADDRESS);

  let koToken = await koFactory.deploy();
  await koToken.deployed();
  console.log("KoToken deployed: " + koToken.address);


  const proxy = await redstoneProxyFactory.deploy(koToken.address, priceFeed.address, REDSTONE_STOCKS_PROVIDER_ADDRESS, []);
  await proxy.deployed();
  console.log("Redstone proxy deployed [ENDPOINT]: " + proxy.address);

  let proxiedKoToken = new ethers.Contract(proxy.address, KO_TOKEN.abi, main);
  let tx = await proxiedKoToken.initialize(toBytes32(asset), USDC_ADDRESS, "komodo-"+asset, "k"+asset, priceFeed.address);
  await tx.wait();
  console.log("Ko Token initialized: " + tx.hash);

}

deployKoToken("IBM");

