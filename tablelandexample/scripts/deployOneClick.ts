import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const OneClickTable = await ethers.getContractFactory("OneClickTable");
  const oneClick = await OneClickTable.deploy();
  console.log(`Lock deployed to ${oneClick.address}, by ${deployer.address}}`);

  oneClick.getTableID().then((id: number) => {
    console.log(`Table id is ${id}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
