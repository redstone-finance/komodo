import { ethers } from "hardhat";
import { MockUsd } from "../typechain/MockUsd";
import { KoTokenUsd } from "../typechain/KoTokenUSD";
import { WrapperBuilder } from "redstone-flash-storage";
import utils from "./utils";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
const { expect } = require("chai");

describe("KoTokenUSD", function() {

  let koToken: any;
  let wrappedKoToken: any;
  let buyer: SignerWithAddress;
  let maker: SignerWithAddress;
  let usd: MockUsd;



  it("Should deploy wrappedKoToken with the asset symbol", async function() {
    [maker, buyer] = await ethers.getSigners();

    const MockUsd = await ethers.getContractFactory("MockUSD");
    usd = await MockUsd.deploy() as MockUsd;

    const KoToken = await ethers.getContractFactory("KoTokenUSD");
    koToken = await KoToken.deploy() as KoTokenUsd;
    await koToken.initialize(utils.toBytes32("OIL"), usd.address, "komodo-OIL-token", "kOIL");
    await koToken.deployed();

    wrappedKoToken = WrapperBuilder
      .mockLite(koToken)
      .using({"OIL": 200});

    await wrappedKoToken.authorizeProvider();

    expect(utils.fromBytes32(await wrappedKoToken.asset())).to.equal("OIL");
    expect(await wrappedKoToken.balanceOf(maker.address)).to.equal(0);
    
    await usd.mint(maker.address, utils.toUsd(1000));
    await usd.approve(wrappedKoToken.address, utils.toUsd(1000));

  });


  it("Should not allow to mint without proper collateral", async function() {
    await expect(wrappedKoToken.mint(utils.toEth(1), utils.toUsd(100)))
      .to.be.revertedWith('The account must remain solvent');
  });


  it("Should mint", async function() {    
    await wrappedKoToken.mint(utils.toEth(1), utils.toUsd(300));

    expect(await usd.balanceOf(maker.address)).to.equal(utils.toUsd(700));
    
    expect(await wrappedKoToken.balanceOf(maker.address)).to.equal(utils.toEth(1));
    expect(await wrappedKoToken.balanceValueOf(maker.address)).to.equal(utils.toVal(200));

    expect(await wrappedKoToken.collateralOf(maker.address)).to.equal(utils.toUsd(300));
    expect(await wrappedKoToken.collateralValueOf(maker.address)).to.equal(utils.toVal(300));

    expect(await wrappedKoToken.debtOf(maker.address)).to.equal(utils.toEth(1));
    expect(await wrappedKoToken.debtValueOf(maker.address)).to.equal(utils.toVal(200));

    expect(await wrappedKoToken.solvencyOf(maker.address)).to.equal(1500);
  });


  it("Should add collateral", async function() {
    await wrappedKoToken.addCollateral(utils.toUsd(100));

    expect(await usd.balanceOf(maker.address)).to.equal(utils.toUsd(600));

    expect(await wrappedKoToken.collateralOf(maker.address)).to.equal(utils.toUsd(400));

    expect(await wrappedKoToken.collateralValueOf(maker.address)).to.equal(utils.toVal(400));
    expect(await wrappedKoToken.solvencyOf(maker.address)).to.equal(2000);
  });


  it("Should remove collateral", async function() {
    await wrappedKoToken.removeCollateral(utils.toUsd(100));

    expect(await usd.balanceOf(maker.address)).to.equal(utils.toUsd(700));

    expect(await wrappedKoToken.collateralOf(maker.address)).to.equal(utils.toUsd(300));

    expect(await wrappedKoToken.collateralValueOf(maker.address)).to.equal(utils.toVal(300));
    expect(await wrappedKoToken.solvencyOf(maker.address)).to.equal(1500);
  });


  it("Should not allow removing too much collateral", async function() {
    await expect(wrappedKoToken.removeCollateral(utils.toUsd(100)))
      .to.be.revertedWith('The account must remain solvent');
  });

});
