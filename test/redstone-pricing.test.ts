import {ethers} from "hardhat";
import chai from "chai";
import {solidity} from "ethereum-waffle";
import { KoToken } from "../typechain/KoToken";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {PriceVerifier} from "../typechain/PriceVerifier";
import redstone from 'redstone-api';

import { wrapContract } from "redstone-flash-storage/lib/utils/contract-wrapper";

import {PriceFeed} from "../typechain/PriceFeed";

chai.use(solidity);

const {expect} = chai;

const toBytes32 = ethers.utils.formatBytes32String;
const toRedstonePrecision = function (x: number): number {
  return x * 10**8;
};

describe("KoToken with life Redstone pricing", function () {

  const REDSTONE_STOCKS_PROVIDER = "Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc";
  const REDSTONE_STOCKS_PROVIDER_ADDRESS = "0x926E370fD53c23f8B71ad2B3217b227E41A92b12";


  let maker: SignerWithAddress;
  let admin: SignerWithAddress;
  let koToken: KoToken;
  let priceFeed: PriceFeed;
  let verifier: PriceVerifier;

  it("Deployment should have zero balance", async function () {
    [maker, admin] = await ethers.getSigners();

    const KoToken = await ethers.getContractFactory("KoTokenETH");
    const Proxy = await ethers.getContractFactory("RedstoneUpgradeableProxy");
    const PriceFeed = await ethers.getContractFactory("PriceFeed");
    const Verifier = await ethers.getContractFactory("PriceVerifier");


    verifier = (await Verifier.deploy()) as PriceVerifier;
    priceFeed = (await PriceFeed.deploy(verifier.address, 5 * 60)) as PriceFeed;
    await priceFeed.authorizeSigner(REDSTONE_STOCKS_PROVIDER_ADDRESS);
    console.log("Authorized: ", REDSTONE_STOCKS_PROVIDER_ADDRESS);

    koToken = (await KoToken.deploy()) as KoToken;

    console.log("KoToken address: " + koToken.address);
    const proxy = await Proxy.deploy(koToken.address, priceFeed.address, admin.address, []);

    koToken = (await KoToken.attach(proxy.address)) as KoToken;
    await koToken.initialize(toBytes32("IBM"), "komodo-IBM-token", "kIBM", priceFeed.address);

    koToken = koToken.connect(maker);

  });


  it("Should mint token", async function () {

    koToken = wrapContract(koToken, REDSTONE_STOCKS_PROVIDER);

    await koToken.mintWithPrices(1, {value: 1});

    const apiPrices = await redstone.getAllPrices({provider:"redstone-stocks"});

    expect(await koToken.collateralOf(maker.address)).to.equal(1);
    expect(await koToken.collateralValueOfWithPrices(maker.address))
      .to.be.equal(toRedstonePrecision(apiPrices['ETH'].value).toFixed(0));

    expect(await koToken.balanceOf(maker.address)).to.equal(1);
    expect(await koToken.balanceValueOfWithPrices(maker.address))
      .to.be.equal(toRedstonePrecision(apiPrices['IBM'].value).toFixed(0));

  });


});
