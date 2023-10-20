import { ethers } from "hardhat";

// async function main() {
//   const [deployer] = await ethers.getSigners();
//   // Deploy the Example contract
//   const Example = await ethers.getContractFactory("ExampleTable");
//   const example = await Example.deploy(deployer.address);

//   console.log(
//     `Example contract deployed to '${await example.getAddress()}'.\n`
//   );

//   // Deploy the RowController contract
//   const RowController = await ethers.getContractFactory("RowController");
//   const rowController = await RowController.deploy(deployer.address);

//   console.log(
//     `Controller contract deployed to '${await rowController.getAddress()}'.\n`
//   );

//   // Set the Example contract's table controller to the RowController contract
//   let tx = await example.setAccessControl(rowController.address);
//   await tx.wait();
//   console.log(
//     `Example contract's table controller set to '${rowController.address}'.\n`
//   );

//   // Now, let's insert into the table with a owner account
//   const [owner, other] = await ethers.getSigners();
//   tx = await example.connect(owner).insertIntoTable("test owner");
//   await tx.wait();
//   // Insert with a non-owner account
//   tx = await example.connect(other).insertIntoTable("test other");
//   await tx.wait();
// }

async function main() {
  const OneClickTable = await ethers.getContractFactory("OneClickTable");
  const oneClick = await OneClickTable.deploy();
  console.log(`Lock deployed to ${await oneClick.getAddress()}`);

  oneClick.getTableID().then((id: number) => {
    console.log(`Table id is ${id}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
