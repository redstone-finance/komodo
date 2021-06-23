import {ethers} from "hardhat";
import chai from "chai";
import {solidity} from "ethereum-waffle";
import { KoToken } from "../typechain/KoToken";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {Wallet} from "ethers";
import {PriceVerifier} from "../typechain/PriceVerifier";

import { wrapContract } from "../utils/contractWrapper";

import {PriceFeed} from "../typechain/PriceFeed";

chai.use(solidity);

const {expect} = chai;

const toBytes32 = ethers.utils.formatBytes32String;

describe("MockDefi with Proxy contract and pricing Data", function () {

  const PRIV = "0xae2b81c1fe9e3b01f060362f03abd0c80a6447cfe00ff7fc7fcf000000000000";


  let maker: SignerWithAddress;
  let admin: SignerWithAddress;
  let koToken: KoToken;
  let priceFeed: PriceFeed;
  let verifier: PriceVerifier;
  let signer: Wallet;

  it("Deployment should have zero balance", async function () {
    [maker, admin] = await ethers.getSigners();

    const KoToken = await ethers.getContractFactory("KoToken");
    const Proxy = await ethers.getContractFactory("RedstoneUpgradeableProxy");
    const PriceFeed = await ethers.getContractFactory("PriceFeed");
    const Verifier = await ethers.getContractFactory("PriceVerifier");

    signer = new ethers.Wallet(PRIV, maker.provider);

    verifier = (await Verifier.deploy()) as PriceVerifier;
    priceFeed = (await PriceFeed.deploy(verifier.address, 5 * 60)) as PriceFeed;
    await priceFeed.authorizeSigner(signer.address);
    console.log("Authorized: ", signer.address);

    koToken = (await KoToken.deploy()) as KoToken;

    console.log("KoToken address: " + koToken.address);
    const proxy = await Proxy.deploy(koToken.address, priceFeed.address, admin.address, []);

    koToken = (await KoToken.attach(proxy.address)) as KoToken;
    await koToken.initialize(toBytes32("OIL"), "komodo-OIL-token", "kOIL", priceFeed.address);

    koToken = koToken.connect(maker);

    await maker.sendTransaction({to: signer.address, value: ethers.utils.parseEther("1")});

  });


  it("Should mint token", async function () {

    koToken = wrapContract(koToken, priceFeed);

    await koToken.mintWithPrices(10, {value: 2});

    expect(await koToken.collateralOf(maker.address)).to.equal(2);
    expect(await koToken.collateralValueOfWithPrices(maker.address)).to.equal(3800);

    expect(await koToken.balanceOf(maker.address)).to.equal(10);
    expect(await koToken.balanceValueOfWithPrices(maker.address)).to.equal(730);

  });
//
//
//   it("Should check balance - read no pricing info", async function () {
//
//     expect(await defi.balanceOf(signer.address, toBytes32("ETH"))).to.be.equal(100);
//     expect(await defi.balanceOf(signer.address, toBytes32("AVAX"))).to.be.equal(50);
//
//   });
//
//
//   it("Should check value - read with pricing info", async function () {
//
//     expect(await defi.currentValueOfWithPrices(signer.address, toBytes32("ETH"))).to.be.equal(1000);
//     expect(await defi.currentValueOfWithPrices(signer.address, toBytes32("AVAX"))).to.be.equal(250);
//
//   });
//
//
//   it("Should swap - write with pricing info", async function () {
//
//     await defi.swapWithPrices(toBytes32("ETH"), toBytes32("AVAX"), 10);
//
//     expect(await defi.balanceOf(signer.address, toBytes32("ETH"))).to.be.equal(90);
//     expect(await defi.balanceOf(signer.address, toBytes32("AVAX"))).to.be.equal(70);
//
//   });
//
});
