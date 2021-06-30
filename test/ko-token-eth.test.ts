import { ethers } from "hardhat";
import { KoTokenEth } from "../typechain/KoTokenEth";
import { MockPriceFeed } from "../typechain/MockPriceFeed";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
const { expect } = require("chai");


const toBytes32 = ethers.utils.formatBytes32String;
const fromBytes32 = ethers.utils.parseBytes32String;

describe("KoTokenETH", function() {
  
  let koToken: KoTokenEth;
  let buyer: SignerWithAddress;
  let maker: SignerWithAddress;
  let priceFeed: MockPriceFeed;

  
  
  it("Should deploy koToken with the asset symbol", async function() {
    [buyer, maker] = await ethers.getSigners();
    
    const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
    priceFeed = await MockPriceFeed.deploy() as MockPriceFeed;
    
    await priceFeed.setPrice(toBytes32("ETH"), 2000);
    await priceFeed.setPrice(toBytes32("OIL"), 200);
      
    const KoToken = await ethers.getContractFactory("KoTokenETH");
    koToken = await KoToken.deploy() as KoTokenEth;
    await koToken.initialize(toBytes32("OIL"), "komodo-OIL-token", "kOIL", priceFeed.address);
    await koToken.deployed();

    expect(fromBytes32(await koToken.asset())).to.equal("OIL");
    expect(await koToken.balanceOf(maker.address)).to.equal(0);

  });

  it("Should not allow to mint without proper collateral", async function() {
      await expect(koToken.connect(maker).mint(100,{value: 10}))
          .to.be.revertedWith('The account must remain solvent');
  });


  it("Should mint", async function() {
      await koToken.connect(maker).mint(100,{value: 20});

      expect(await koToken.balanceOf(maker.address)).to.equal(100);
      expect(await koToken.balanceValueOf(maker.address)).to.equal(20000);
      expect(await koToken.totalValue()).to.equal(20000);
      
      expect(await koToken.collateralOf(maker.address)).to.equal(20);
      expect(await koToken.collateralValueOf(maker.address)).to.equal(40000);
      
      expect(await koToken.debtOf(maker.address)).to.equal(100);
      expect(await koToken.debtValueOf(maker.address)).to.equal(20000);
      
      expect(await koToken.solvencyOf(maker.address)).to.equal(2000);
  });

  it("Should burn", async function() {
      await koToken.connect(maker).burn(20);

      expect(await koToken.balanceOf(maker.address)).to.equal(80);
      expect(await koToken.debtOf(maker.address)).to.equal(80);
  });


  it("Should add collateral", async function() {
    await koToken.connect(maker).addCollateral({value: 80});

    expect(await koToken.collateralOf(maker.address)).to.equal(100);

    expect(await koToken.collateralValueOf(maker.address)).to.equal(200000);
    expect(await koToken.solvencyOf(maker.address)).to.equal(12500);
  });
  
    
  it("Should remove collateral", async function() {
    await koToken.connect(maker).removeCollateral(40);
    
    expect(await koToken.collateralOf(maker.address)).to.equal(60);
    expect(await koToken.collateralValueOf(maker.address)).to.equal(120000);
  });
  

  it("Should not allow removing too much collateral", async function() {
    await expect(koToken.connect(maker).removeCollateral(60))
        .to.be.revertedWith('The account must remain solvent');
  });
  

  it("Should transfer", async function() {
    expect(await koToken.balanceOf(maker.address)).to.equal(80);
    expect(await koToken.debtOf(maker.address)).to.equal(80);

    expect(await koToken.balanceOf(buyer.address)).to.equal(0);
    expect(await koToken.debtOf(buyer.address)).to.equal(0);
    
    await koToken.connect(maker).transfer(buyer.address,10);

    expect(await koToken.balanceOf(maker.address)).to.equal(70);
    expect(await koToken.debtOf(maker.address)).to.equal(80);

    expect(await koToken.balanceOf(buyer.address)).to.equal(10);
    expect(await koToken.debtOf(buyer.address)).to.equal(0);
  });


  it("Should not liquidate a solvent account", async function() {
    expect(await koToken.debtOf(maker.address)).to.equal(80);

    expect(await koToken.debtValueOf(maker.address)).to.equal(16000);
    expect(await koToken.collateralOf(maker.address)).to.equal(60);
    expect(await koToken.collateralValueOf(maker.address)).to.equal(120000);

    await expect(koToken.connect(buyer).liquidate(maker.address, 10))
      .to.be.revertedWith('Cannot liquidate a solvent account');

  });


  it("Should liquidate without bringing account to solvency", async function() {
    expect(await koToken.debtOf(maker.address)).to.equal(80);

    await priceFeed.setPrice(toBytes32("ETH"), 315);

    expect(await koToken.debtOf(maker.address)).to.equal(80);
    expect(await koToken.debtValueOf(maker.address)).to.equal(16000);
    expect(await koToken.collateralOf(maker.address)).to.equal(60);
    expect(await koToken.collateralValueOf(maker.address)).to.equal(18900);

    expect(await koToken.solvencyOf(maker.address)).to.equal(1181);

    await koToken.connect(buyer).approve(koToken.address, 1);

    await expect(koToken.connect(buyer).liquidate(maker.address, 1))
      .to.be.revertedWith('Account must be solvent after liquidation');

  });


  it("Should liquidate", async function() {
    expect(await koToken.debtOf(maker.address)).to.equal(80);

    await priceFeed.setPrice(toBytes32("ETH"), 319);

    expect(await koToken.debtOf(maker.address)).to.equal(80);
    expect(await koToken.debtValueOf(maker.address)).to.equal(16000);
    expect(await koToken.collateralOf(maker.address)).to.equal(60);
    expect(await koToken.collateralValueOf(maker.address)).to.equal(19140);

    expect(await koToken.solvencyOf(maker.address)).to.equal(1196);

    await koToken.connect(buyer).approve(koToken.address, 10);
    await koToken.connect(buyer).liquidate(maker.address, 10);

    expect(await koToken.debtOf(maker.address)).to.equal(70);
    expect(await koToken.debtValueOf(maker.address)).to.equal(14000);
    expect(await koToken.collateralOf(maker.address)).to.equal(54);
    expect(await koToken.collateralValueOf(maker.address)).to.equal(17226);
    expect(await koToken.solvencyOf(maker.address)).to.equal(1230);

  });  
  
  
});
