import {ethers} from "hardhat";
import chai from "chai";
import {solidity} from "ethereum-waffle";
import { KoTokenUsd } from "../typechain/KoTokenUSD";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

import redstone from 'redstone-api';

import { wrapContract } from "redstone-flash-storage/lib/utils/contract-wrapper";

import {PriceFeedWithVerification} from "../typechain/PriceFeedWithVerification";
import {MockUsd} from "../typechain/MockUsd";

chai.use(solidity);

const {expect} = chai;

const toBytes32 = ethers.utils.formatBytes32String;
const toRedstonePrecision = function (x: number): number {
  return x * 10**8;
};

const toVal = function(val: Number) {
  return ethers.utils.parseUnits(val.toString(), 26);
}
const toUsd = function(val: Number) {
  return ethers.utils.parseUnits(val.toString(), 6);
}

describe("KoToken with life Redstone pricing", function () {

  const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";
  const REDSTONE_STOCKS_PROVIDER_ADDRESS = "0x926E370fD53c23f8B71ad2B3217b227E41A92b12";


  let maker: SignerWithAddress;
  let admin: SignerWithAddress;
  let koToken: KoTokenUsd;
  let priceFeed: PriceFeedWithVerification;
  let usd: MockUsd;

  it("Deployment should have zero balance", async function () {
    [maker, admin] = await ethers.getSigners();

    const KoToken = await ethers.getContractFactory("KoTokenUSD");
    const Proxy = await ethers.getContractFactory("RedstoneUpgradeableProxy");
    const PriceFeed = await ethers.getContractFactory("PriceFeedWithVerification");

    priceFeed = (await PriceFeed.deploy(5 * 60)) as PriceFeedWithVerification;
    await priceFeed.authorizeSigner(REDSTONE_STOCKS_PROVIDER_ADDRESS);
    console.log("Authorized: ", REDSTONE_STOCKS_PROVIDER_ADDRESS);

    const MockUsd = await ethers.getContractFactory("MockUSD");
    usd = await MockUsd.deploy() as MockUsd;

    koToken = (await KoToken.deploy()) as KoTokenUsd;

    console.log("KoToken address: " + koToken.address);
    const proxy = await Proxy.deploy(koToken.address, priceFeed.address, admin.address, []);

    koToken = (await KoToken.attach(proxy.address)) as KoTokenUsd;
    await koToken.initialize(toBytes32("IBM"), usd.address,"komodo-IBM-token", "kIBM", priceFeed.address);

    koToken = koToken.connect(maker);

    await usd.mint(maker.address, toUsd(1000));
    await usd.approve(koToken.address, toUsd(1000));
  });


  it("Should mint token", async function () {

    koToken = wrapContract(koToken, REDSTONE_STOCKS_PROVIDER, "IBM");

    await koToken.mintWithPrices(1, 300);

    const apiPrices = await redstone.getAllPrices({provider:"redstone-stocks"});


    expect(await koToken.balanceOf(maker.address)).to.equal(1);
    expect(await koToken.balanceValueOfWithPrices(maker.address))
      .to.be.equal(toRedstonePrecision(apiPrices['IBM'].value).toFixed(0));

  });
  

  it("Should mint again", async function () {
    await koToken.mintWithPrices(1, 300);
    await koToken.mintWithPrices(1, 300);
  });




});
