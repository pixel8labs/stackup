import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('ERC721', function () {
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let base: Contract; // contracts

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const ESCROW = await ethers.getContractFactory('EScrow');
    base = await ESCROW.deploy();
  });

  // Phases
  it('create nft', async () => {
    const tx = await base.connect(user).createNFT("car nft", "CAR");
    console.log(tx);
  });
});