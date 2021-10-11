const ethers = require('ethers');
const fs = require('fs');

const toBytes32 = ethers.utils.formatBytes32String;

const provider = require("./ehters-provider");
const PRIV = fs.readFileSync(".secret").toString().trim();
const main = new ethers.Wallet(PRIV, provider);
console.log("MAIN: " + main.address);

const KO_TOKEN = require('../artifacts/contracts/KoTokenBoostedUSD.sol/KoTokenBoostedUSD');
const koFactory = new ethers.ContractFactory(KO_TOKEN.abi, KO_TOKEN.bytecode, main);

const REDSTONE_PROXY = require('../artifacts/redstone-flash-storage/lib/contracts/RedstoneUpgradeableProxy.sol/RedstoneUpgradeableProxy.json');
const redstoneProxyFactory = new ethers.ContractFactory(REDSTONE_PROXY.abi, REDSTONE_PROXY.bytecode, main);

const PRICE_FEED = require('../artifacts/redstone-flash-storage/lib/contracts/PriceFeedWithVerification.sol/PriceFeedWithVerification');
const priceFeedFactory = new ethers.ContractFactory(PRICE_FEED.abi, PRICE_FEED.bytecode, main);

const { REDSTONE_STOCKS_PROVIDER_ADDRESS, USDC_ADDRESS } = require("./tools-config");

const ERC20_ABI = require("../uni-abi/ERC20.json");

async function deployKoToken(asset) {
  //let verifier = await verifierFactory.deploy();
  //await verifier.deployed();
  //console.log("Verifier deployed: " + verifier.address);

  const addresses = {};

  let priceFeed = await priceFeedFactory.deploy(300);
  await priceFeed.deployed();
  console.log("Price feed deployed: " + priceFeed.address);
  addresses.priceFeed = priceFeed.address;

  let authTx = await priceFeed.authorizeSigner(REDSTONE_STOCKS_PROVIDER_ADDRESS);
  await authTx.wait();
  console.log("Authorized redstone signer: ", REDSTONE_STOCKS_PROVIDER_ADDRESS);
  addresses.authorizedRedstoneSigner = REDSTONE_STOCKS_PROVIDER_ADDRESS;

  let koToken = await koFactory.deploy();
  await koToken.deployed();
  console.log("KoToken deployed: " + koToken.address);
  addresses.koToken = koToken.address;

  const proxy = await redstoneProxyFactory.deploy(koToken.address, priceFeed.address, REDSTONE_STOCKS_PROVIDER_ADDRESS, []);
  await proxy.deployed();
  console.log("Redstone proxy deployed [ENDPOINT]: " + proxy.address);
  addresses.redstoneProxy = proxy.address;

  let proxiedKoToken = new ethers.Contract(proxy.address, KO_TOKEN.abi, main);
  let tx = await proxiedKoToken.bInitialize(
    toBytes32(asset),
    USDC_ADDRESS,
    "komodo-"+asset,
    "k"+asset,
    priceFeed.address,
    "e0fba4fc209b4948668006b2be61711b7f465bae",
    "0xe12AFeC5aa12Cf614678f9bFeeB98cA9Bb95b5B0"
  );
  await tx.wait();
  console.log("Ko Token initialized: " + tx.hash);
  addresses.koTokenInitTx = tx.hash;

  return addresses;
}

// deployKoToken("IBM");
// deployKoToken("ZCZ21");

module.exports = deployKoToken;
