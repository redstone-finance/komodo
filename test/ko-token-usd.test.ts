import { ethers } from "hardhat";
import { MockUsd } from "../typechain/MockUsd";
import { KoTokenUsd } from "../typechain/KoTokenUSD";
import { MockPriceFeed } from "../typechain/MockPriceFeed";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
const { expect } = require("chai");

const USDC_ADDRESS = "0xe22da380ee6b445bb8273c81944adeb6e8450422";

const toBytes32 = ethers.utils.formatBytes32String;
const fromBytes32 = ethers.utils.parseBytes32String;
const toEth = function(val: Number) {
  return ethers.utils.parseEther(val.toString());
}
const toVal = function(val: Number) {
  return ethers.utils.parseUnits(val.toString(), 26);
}
const toUsd = function(val: Number) {
  return ethers.utils.parseUnits(val.toString(), 6);
}

describe("KoTokenUSD", function() {

  let koToken: KoTokenUsd;
  let buyer: SignerWithAddress;
  let maker: SignerWithAddress;
  let priceFeed: MockPriceFeed;
  let usd: MockUsd;



  it("Should deploy koToken with the asset symbol", async function() {
    [maker, buyer] = await ethers.getSigners();

    const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
    priceFeed = await MockPriceFeed.deploy() as MockPriceFeed;


    await priceFeed.setPrice(toBytes32("OIL"), 20000000000);

    const MockUsd = await ethers.getContractFactory("MockUSD");
    usd = await MockUsd.deploy() as MockUsd;

    const KoToken = await ethers.getContractFactory("KoTokenUSD");
    koToken = await KoToken.deploy() as KoTokenUsd;
    await koToken.initialize(toBytes32("OIL"), usd.address, "komodo-OIL-token", "kOIL", priceFeed.address);
    await koToken.deployed();

    expect(fromBytes32(await koToken.asset())).to.equal("OIL");
    expect(await koToken.balanceOf(maker.address)).to.equal(0);
    
    await usd.mint(maker.address, toUsd(1000));
    await usd.approve(koToken.address, toUsd(1000));

  });

  it("Should not allow to mint without proper collateral", async function() {
    await expect(koToken.connect(maker).mint(toEth(1), toUsd(100)))
      .to.be.revertedWith('The account must remain solvent');
  });


  it("Should mint", async function() {    
    await koToken.connect(maker).mint(toEth(1), toUsd(300));

    expect(await usd.balanceOf(maker.address)).to.equal(toUsd(700));
    
    expect(await koToken.balanceOf(maker.address)).to.equal(toEth(1));
    expect(await koToken.balanceValueOf(maker.address)).to.equal(toVal(200));

    expect(await koToken.collateralOf(maker.address)).to.equal(toUsd(300));
    expect(await koToken.collateralValueOf(maker.address)).to.equal(toVal(300));

    expect(await koToken.debtOf(maker.address)).to.equal(toEth(1));
    expect(await koToken.debtValueOf(maker.address)).to.equal(toVal(200));

    expect(await koToken.solvencyOf(maker.address)).to.equal(1500);
  });




  it("Should add collateral", async function() {
    await koToken.connect(maker).addCollateral(toUsd(100));

    expect(await usd.balanceOf(maker.address)).to.equal(toUsd(600));

    expect(await koToken.collateralOf(maker.address)).to.equal(toUsd(400));

    expect(await koToken.collateralValueOf(maker.address)).to.equal(toVal(400));
    expect(await koToken.solvencyOf(maker.address)).to.equal(2000);
  });


  it("Should remove collateral", async function() {
    await koToken.connect(maker).removeCollateral(toUsd(100));

    expect(await usd.balanceOf(maker.address)).to.equal(toUsd(700));

    expect(await koToken.collateralOf(maker.address)).to.equal(toUsd(300));

    expect(await koToken.collateralValueOf(maker.address)).to.equal(toVal(300));
    expect(await koToken.solvencyOf(maker.address)).to.equal(1500);
  });


  it("Should not allow removing too much collateral", async function() {
    await expect(koToken.connect(maker).removeCollateral(toUsd(100)))
      .to.be.revertedWith('The account must remain solvent');
  });

});
