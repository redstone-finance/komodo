import { ethers } from "hardhat";
import { KoToken } from "../typechain/KoToken";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
const { expect } = require("chai");

const toBytes32 = ethers.utils.formatBytes32String;
const fromBytes32 = ethers.utils.parseBytes32String;

describe("KoToken", function() {
  
  let koToken: KoToken;
  let buyer: SignerWithAddress;
  let maker: SignerWithAddress;

  
  
  it("Should deploy koToken with the asset symbol", async function() {
    [buyer, maker] = await ethers.getSigners();
      
    const KoToken = await ethers.getContractFactory("KoToken");
    koToken = await KoToken.deploy(toBytes32("PIG"), "komodo-PIG-token", "kPIG") as KoToken;
    await koToken.deployed();

    expect(fromBytes32(await koToken.asset())).to.equal("PIG");
    expect(await koToken.balanceOf(maker.address)).to.equal(0);

  });


  it("Should mint", async function() {
      await koToken.connect(maker).mint(100);

      expect(await koToken.balanceOf(maker.address)).to.equal(100);
      expect(await koToken.debtOf(maker.address)).to.equal(100);
  });

  it("Should burn", async function() {
      await koToken.connect(maker).burn(20);

      expect(await koToken.balanceOf(maker.address)).to.equal(80);
      expect(await koToken.debtOf(maker.address)).to.equal(80);
  });


  it("Should add collateral", async function() {
    await koToken.connect(maker).addCollateral({value: 100});

    expect(await koToken.collateralOf(maker.address)).to.equal(100);
  });
    
  it("Should remove collateral", async function() {
    await koToken.connect(maker).removeCollateral(40);
    
    expect(await koToken.collateralOf(maker.address)).to.equal(60);
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
