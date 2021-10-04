import { ethers } from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import { WrapperBuilder } from "redstone-flash-storage";
import utils from "./utils";
const { expect } = require("chai");

describe("KoTokenETH", function() {
  
  let koToken: any, wrappedKoToken: any;
  let buyer: SignerWithAddress;
  let maker: SignerWithAddress;
  
  it("Should deploy koToken with the asset symbol", async function() {
    [buyer, maker] = await ethers.getSigners();

    // console.log({buyer: buyer.address, maker: maker.address});
      
    const KoToken = await ethers.getContractFactory("KoTokenETH");
    koToken = await KoToken.deploy() as any;
    await koToken.initialize(utils.toBytes32("CL=F"), "komodo-OIL-token", "kOIL");
    await koToken.deployed();

    expect(utils.fromBytes32(await koToken.asset())).to.equal("CL=F");

    wrappedKoToken = WrapperBuilder
      .mockLite(koToken)
      .using(utils.mockPrices({"ETH": 2000, "CL=F": 200}));

    await wrappedKoToken.authorizeProvider();

    await utils.syncTime(); // recommended for hardhat test

    expect(await wrappedKoToken.balanceOf(maker.address)).to.equal(0);
  });

  it("Should not allow to mint without proper collateral", async function() {
    await expect(wrappedKoToken.mint(100))
      .to.be.revertedWith('The account must remain solvent');
  });


  it("Should mint", async function() {
    wrappedKoToken = WrapperBuilder
      .mockLite(koToken.connect(maker))
      .using(utils.mockPrices({"ETH": 2000, "CL=F": 200}));

    await wrappedKoToken.mint(100, {value: 20});

    await utils.syncTime(); // recommended for hardhat test
    await utils.syncTime(); // recommended for hardhat test
    await utils.syncTime(); // recommended for hardhat test
    
    expect(await wrappedKoToken.balanceOf(maker.address)).to.equal(100);
    expect(await wrappedKoToken.balanceValueOf(maker.address)).to.equal(20000);
    expect(await wrappedKoToken.totalValue()).to.equal(20000);
    
    expect(await wrappedKoToken.collateralOf(maker.address)).to.equal(20);
    expect(await wrappedKoToken.collateralValueOf(maker.address)).to.equal(40000);
    
    expect(await wrappedKoToken.debtOf(maker.address)).to.equal(100);
    expect(await wrappedKoToken.debtValueOf(maker.address)).to.equal(20000);
    
    expect(await wrappedKoToken.solvencyOf(maker.address)).to.equal(2000);
  });

  it("Should burn", async function() {
    wrappedKoToken = WrapperBuilder
      .mockLite(koToken.connect(maker))
      .using(utils.mockPrices({"ETH": 2000, "CL=F": 200}));
      
    await wrappedKoToken.burn(20);
    await utils.syncTime(); // recommended for hardhat test

    expect(await koToken.balanceOf(maker.address)).to.equal(80);
    expect(await koToken.debtOf(maker.address)).to.equal(80);
  });

  it("Should add collateral", async function() {
    await wrappedKoToken.addCollateral({value: 80});

    expect(await wrappedKoToken.collateralOf(maker.address)).to.equal(100);

    expect(await wrappedKoToken.collateralValueOf(maker.address)).to.equal(200000);
    expect(await wrappedKoToken.solvencyOf(maker.address)).to.equal(12500);
  });

  it("Should remove collateral", async function() {
    await wrappedKoToken.removeCollateral(40);
    
    expect(await wrappedKoToken.collateralOf(maker.address)).to.equal(60);
    expect(await wrappedKoToken.collateralValueOf(maker.address)).to.equal(120000);
  });

  it("Should not allow removing too much collateral", async function() {
    await expect(wrappedKoToken.removeCollateral(60))
      .to.be.revertedWith('The account must remain solvent');
  });

  it("Should transfer", async function() {
    expect(await wrappedKoToken.balanceOf(maker.address)).to.equal(80);
    expect(await wrappedKoToken.debtOf(maker.address)).to.equal(80);

    expect(await wrappedKoToken.balanceOf(buyer.address)).to.equal(0);
    expect(await wrappedKoToken.debtOf(buyer.address)).to.equal(0);
    
    await wrappedKoToken.transfer(buyer.address,10);

    expect(await wrappedKoToken.balanceOf(maker.address)).to.equal(70);
    expect(await wrappedKoToken.debtOf(maker.address)).to.equal(80);

    expect(await wrappedKoToken.balanceOf(buyer.address)).to.equal(10);
    expect(await wrappedKoToken.debtOf(buyer.address)).to.equal(0);
  });

  it("Should not liquidate a solvent account", async function() {
    expect(await wrappedKoToken.debtOf(maker.address)).to.equal(80);

    expect(await wrappedKoToken.debtValueOf(maker.address)).to.equal(16000);
    expect(await wrappedKoToken.collateralOf(maker.address)).to.equal(60);
    expect(await wrappedKoToken.collateralValueOf(maker.address)).to.equal(120000);

    wrappedKoToken = WrapperBuilder
      .mockLite(koToken.connect(buyer))
      .using(utils.mockPrices({"ETH": 2000, "CL=F": 200}));

    await expect(wrappedKoToken.liquidate(maker.address, 10))
      .to.be.revertedWith('Cannot liquidate a solvent account');

  });

  it("Should liquidate without bringing account to solvency", async function() {
    expect(await wrappedKoToken.debtOf(maker.address)).to.equal(80);

    wrappedKoToken = WrapperBuilder
      .mockLite(koToken.connect(buyer))
      .using(utils.mockPrices({"ETH": 315, "CL=F": 200}));

    expect(await wrappedKoToken.debtOf(maker.address)).to.equal(80);
    expect(await wrappedKoToken.debtValueOf(maker.address)).to.equal(16000);
    expect(await wrappedKoToken.collateralOf(maker.address)).to.equal(60);
    expect(await wrappedKoToken.collateralValueOf(maker.address)).to.equal(18900);

    expect(await wrappedKoToken.solvencyOf(maker.address)).to.equal(1181);

    await wrappedKoToken.approve(koToken.address, 1);

    await expect(wrappedKoToken.liquidate(maker.address, 1))
      .to.be.revertedWith('Account must be solvent after liquidation');

  });

  it("Should liquidate", async function() {
    expect(await wrappedKoToken.debtOf(maker.address)).to.equal(80);

    wrappedKoToken = WrapperBuilder
      .mockLite(koToken.connect(buyer))
      .using(utils.mockPrices({"ETH": 319, "CL=F": 200}));

    expect(await wrappedKoToken.debtOf(maker.address)).to.equal(80);
    expect(await wrappedKoToken.debtValueOf(maker.address)).to.equal(16000);
    expect(await wrappedKoToken.collateralOf(maker.address)).to.equal(60);
    expect(await wrappedKoToken.collateralValueOf(maker.address)).to.equal(19140);

    expect(await wrappedKoToken.solvencyOf(maker.address)).to.equal(1196);

    await wrappedKoToken.approve(koToken.address, 10);
    await wrappedKoToken.liquidate(maker.address, 10);

    expect(await wrappedKoToken.debtOf(maker.address)).to.equal(70);
    expect(await wrappedKoToken.debtValueOf(maker.address)).to.equal(14000);
    expect(await wrappedKoToken.collateralOf(maker.address)).to.equal(54);
    expect(await wrappedKoToken.collateralValueOf(maker.address)).to.equal(17226);
    expect(await wrappedKoToken.solvencyOf(maker.address)).to.equal(1230);

  });
});
