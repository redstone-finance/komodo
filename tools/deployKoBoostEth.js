const ethers = require('ethers');
const fs = require('fs');
const { wrapContract } = require("redstone-flash-storage/lib/utils/contract-wrapper");

const toBytes32 = ethers.utils.formatBytes32String;

const provider = ethers.getDefaultProvider('kovan');
const PRIV = fs.readFileSync(".secret").toString().trim();
const main = new ethers.Wallet(PRIV, provider);
console.log("MAIN: " + main.address);

const KO_TOKEN = require('../artifacts/contracts/KoTokenBoostedETH.sol/KoTokenBoostedETH');
const koFactory = new ethers.ContractFactory(KO_TOKEN.abi, KO_TOKEN.bytecode, main);

const REDSTONE_PROXY = require('../artifacts/redstone-flash-storage/lib/contracts/RedstoneUpgradeableProxy.sol/RedstoneUpgradeableProxy.json');
const redstoneProxyFactory = new ethers.ContractFactory(REDSTONE_PROXY.abi, REDSTONE_PROXY.bytecode, main);

const PRICE_FEED = require('../artifacts/redstone-flash-storage/lib/contracts/PriceFeedWithVerification.sol/PriceFeedWithVerification');
const priceFeedFactory = new ethers.ContractFactory(PRICE_FEED.abi, PRICE_FEED.bytecode, main);

//const VERIFIER_FACTORY = require('../artifacts/redstone-flash-storage/lib/contracts/PriceVerifier.sol/PriceVerifier');
//const verifierFactory = new ethers.ContractFactory(VERIFIER_FACTORY.abi, VERIFIER_FACTORY.bytecode, main);


const USDC_ADDRESS = "e22da380ee6b445bb8273c81944adeb6e8450422";
const ERC20_ABI = require("../uni-abi/ERC20.json");
const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, main);

const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";
const REDSTONE_STOCKS_PROVIDER_ADDRESS = "0x926E370fD53c23f8B71ad2B3217b227E41A92b12";

const WETH_GATEWAY_ADDRESS = "0xa61ca04df33b72b235a8a28cfb535bb7a5271b70";
const ETH_LENDING_POOL = "0xe0fba4fc209b4948668006b2be61711b7f465bae";
const AWETH = "0x87b1f4cf9bd63f7bbd3ee1ad04e8f52540349347";

async function deployKoToken(asset) {
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
  let tx = await proxiedKoToken.bInitialize(
    toBytes32(asset),
    "komodo-"+asset,
    "k"+asset,
    priceFeed.address,
    WETH_GATEWAY_ADDRESS,
    ETH_LENDING_POOL,
    AWETH
  );
  await tx.wait();
  console.log("Ko Token initialized: " + tx.hash);

}

const PRICE_FEED_DEPLOYED = "0xc2Db922aAF4B1111fe91836A05564F6525758c78";

async function deployKoTokenLite(asset) {
  const addresses = {};
  
  let koToken = await koFactory.deploy();
  await koToken.deployed();
  console.log("KoToken deployed: " + koToken.address);

  const proxy = await redstoneProxyFactory.deploy(koToken.address, PRICE_FEED_DEPLOYED, REDSTONE_STOCKS_PROVIDER_ADDRESS, []);
  await proxy.deployed();
  console.log("Redstone proxy deployed [ENDPOINT]: " + proxy.address);

  addresses.redstoneProxy = proxy.address;
  
  let proxiedKoToken = new ethers.Contract(proxy.address, KO_TOKEN.abi, main);
  let tx = await proxiedKoToken.bInitialize(
    toBytes32(asset),
    "komodo-"+asset,
    "k"+asset,
    PRICE_FEED_DEPLOYED,
    WETH_GATEWAY_ADDRESS,
    ETH_LENDING_POOL,
    AWETH
  );
  await tx.wait();
  console.log("Ko Token initialized: " + tx.hash);
  
  return addresses;
}

//deployKoToken("IBM");
deployKoTokenLite("IBM");


module.exports = deployKoTokenLite;



