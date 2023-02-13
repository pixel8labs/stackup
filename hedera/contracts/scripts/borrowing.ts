import { ethers } from "hardhat";
import contract from '../artifacts/contracts/EScrow.sol/EScrow.json';

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://testnet.hashio.io/api")
  const w = new ethers.Wallet("30b061e135edbf11517c3c0375dee196947761efc85ddff2d579204dc8b8742f", provider);
  const c = new ethers.Contract("0x04e23fE5734F0022e7dB14cCffAc499C2c3566dF", contract.abi, w);
  const tx = await c.borrowing("0x000000000000000000000000000000000034fC58", 1, {
    gasLimit: 1_000_000,
    value: ethers.utils.parseEther("10")
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
