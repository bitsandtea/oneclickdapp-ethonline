import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const tableId = 7955;
  // Deploy the Example contract
  // const OneClickTable = await ethers.getContractFactory("OneClickTable");
  // const oneClick = await OneClickTable.deploy(deployer.address, tableId);
  // const oneclickAddr = await oneClick.getAddress();
  // console.log(`OneClick contract deployed to '${oneclickAddr}'.\n`);
  // await waitSeconds(60);
  // await hre.run("verify:verify", {
  //   address: oneclickAddr,
  //   constructorArguments: [deployer.address, tableId],
  // });

  // Deploy the RowController contract
  const RowController = await ethers.getContractFactory("RowController");
  const rowController = await RowController.deploy(deployer.address);
  const rowControllerAddr = await rowController.getAddress();
  console.log(`Controller contract deployed to '${rowControllerAddr}'.\n`);

  await waitSeconds(60);
  await hre.run("verify:verify", {
    address: rowControllerAddr,
    constructorArguments: [deployer.address],
  });
  // // Set the Example contract's table controller to the RowController contract
  // let tx = await oneClick.setAccessControl(rowControllerAddr);
  // await tx.wait();
  // console.log(
  //   `OneClick contract's table controller set to '${rowControllerAddr}'.\n`
  // );
  // // Now, let's insert into the table with a owner account
  // const [owner, other] = await ethers.getSigners();
  // tx = await oneClick.connect(owner).insertIntoTable("test owner");
  // await tx.wait();
  // // Insert with a non-owner account
  // tx = await oneClick.connect(other).insertIntoTable("test other");
  // await tx.wait();

  function waitSeconds(seconds: number) {
    const secs = seconds * 1000;
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, secs);
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
