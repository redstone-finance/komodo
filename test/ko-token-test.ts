import { ethers } from "hardhat";
import { KoToken } from "../typechain/KoToken";
import { MockPriceFeed } from "../typechain/MockPriceFeed";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
const { expect } = require("chai");


const toBytes32 = ethers.utils.formatBytes32String;
const fromBytes32 = ethers.utils.parseBytes32String;

describe("KoToken", function() {
  
  let koToken: KoToken;
  let buyer: SignerWithAddress;
  let maker: SignerWithAddress;
  let priceFeed: MockPriceFeed;

  
  
  it("Should deploy koToken with the asset symbol", async function() {
    [buyer, maker] = await ethers.getSigners();
    
    const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
    priceFeed = await MockPriceFeed.deploy() as MockPriceFeed;
    
    await priceFeed.setPrice(toBytes32("ETH"), 2000);
    await priceFeed.setPrice(toBytes32("PIG"), 200);
      
    const KoToken = await ethers.getContractFactory("KoToken");
    koToken = await KoToken.deploy(toBytes32("PIG"), "komodo-PIG-token", "kPIG", priceFeed.address) as KoToken;
    await koToken.deployed();

    expect(fromBytes32(await koToken.asset())).to.equal("PIG");
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
  
  
  
  
  
});
