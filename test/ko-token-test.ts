import { ethers } from "hardhat";
import { KoToken } from "../typechain/KoToken";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
const { expect } = require("chai");

const toBytes32 = ethers.utils.formatBytes32String;
const fromBytes32 = ethers.utils.parseBytes32String;

describe("KoToken", function() {
  
  let koToken: KoToken;
  let broker: SignerWithAddress;
  let client: SignerWithAddress;

  
  
  it("Should deploy koToken with the asset symbol", async function() {
    [broker, client] = await ethers.getSigners();
      
    const KoToken = await ethers.getContractFactory("KoToken");
    koToken = await KoToken.deploy(toBytes32("PIG"), "komodo-PIG-token", "kPIG") as KoToken;
    await koToken.deployed();

    expect(fromBytes32(await koToken.asset())).to.equal("PIG");
    expect(await koToken.balanceOf(client.address)).to.equal(0);

  });


  it("Should mint by owner", async function() {
      await koToken.mint(client.address, 100);

      expect(await koToken.balanceOf(client.address)).to.equal(100);
  });

  it("Should burn by owner", async function() {
      await koToken.burn(client.address, 20);

      expect(await koToken.balanceOf(client.address)).to.equal(80);
  });
  
  
  
  
  
});
