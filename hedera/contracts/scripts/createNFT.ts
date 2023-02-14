import { ethers } from "hardhat";
import contract from '../artifacts/contracts/EScrow.sol/EScrow.json';

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api")
  const w = new ethers.Wallet("30b061e135edbf11517c3c0375dee196947761efc85ddff2d579204dc8b8742f", provider);
  const c = new ethers.Contract("0xB41F82DAD8A7aA93e2893AcEB9963298A45D66c0", contract.abi, w);
  const tx = await c.createNFT("StackUp Car NFT Program", "CAR", {
    value: ethers.BigNumber.from("20000000000000000000"),
    gasLimit: 1_000_000
  });
  const res = await tx.wait();

  console.log(res);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
