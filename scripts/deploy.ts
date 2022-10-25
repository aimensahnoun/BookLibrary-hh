import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function deployBookLibrary(hre: HardhatRuntimeEnvironment) {
  hre.run("compile");
  const { ethers } = hre;
  const BookLibrary = await ethers.getContractFactory("BookLibrary");
  const bookLibrary = await BookLibrary.deploy();
  await bookLibrary.deployed();

  const bookLibraryAddress = bookLibrary.address;
  hre.run("print", {
    message: `BookLibrary deployed to: ${bookLibraryAddress}`,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
