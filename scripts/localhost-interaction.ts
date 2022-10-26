import hre, { ethers } from "hardhat";

import bookLibrary from "../artifacts/contracts/BookLibrary.sol/BookLibrary.json";
import { BookLibrary } from "../typechain";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://localhost:8545"
  );

  const latestBlock = await provider.getBlock("latest");
  console.log(latestBlock.hash);

  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  const balance = await wallet.getBalance();

  console.log("Wallet balance : ", ethers.utils.formatEther(balance));

  //   Get contract from address
  const bookLibraryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const bookLibraryContract = new ethers.Contract(
    bookLibraryAddress,
    bookLibrary.abi,
    wallet
  ) as BookLibrary;

  hre.run("print", {
    message: `BookLibrary deployed to: ${bookLibraryContract.address}`,
  });
  console.log("=================");

  // Adding a book
  await (await bookLibraryContract.addBook("The Hobbit", 10)).wait();

  // Getting book count
  const bookCount = await bookLibraryContract.bookCount();

  console.log("Book count: ", bookCount.toString());
  console.log("=================");

  // Getting book list
  const books = await bookLibraryContract.viewBookList();
  console.log(books);
  console.log("Book at index 0: ", books[0]);
  console.log("=================");

  // Borrowing a Book
  console.log("Borrwing book at index 0");
  console.log("=================");
  await (await bookLibraryContract.borrowBook(0)).wait();

  // Checking availablity of a book
  const book = await bookLibraryContract.getBookById(0);
  console.log("Is book available: ", book.count > 0);
  console.log("Remaining book copies: ", book.count.toString());
  console.log("=================");

  // Returning a book
  console.log("Returning book at index 0: ");
  console.log("=================");
  await (await bookLibraryContract.returnBook(0)).wait();

  // Checking availablity of a book
  const book2 = await bookLibraryContract.getBookById(0);
  console.log("Is book available: ", book2.count > 0);
  console.log("Remaining book copies: ", book2.count.toString());
  console.log("=================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
