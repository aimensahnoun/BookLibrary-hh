import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { artifacts, ethers, network } from "hardhat";

import { BookLibrary } from "../typechain-types";

describe("Testing Book Library Contract", function () {
  let bookLibrary: BookLibrary;
  let accounts: SignerWithAddress[] = [];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const bookLibraryFactory = await ethers.getContractFactory("BookLibrary");
    bookLibrary = (await bookLibraryFactory.deploy()) as BookLibrary;
    await bookLibrary.deployed();
  });

  describe("Adding a book", () => {
    it("Should revert if the title of the book is empty", async () => {
      await expect(bookLibrary.addBook("", 100)).to.be.revertedWithCustomError(
        bookLibrary,
        "BookLibrary__NameCannotBeEmpty"
      );
    });

    it("Should revert if the amount is zero", async () => {
      await expect(
        bookLibrary.addBook("Book1", 0)
      ).to.be.revertedWithCustomError(
        bookLibrary,
        "BookLibrary__CountCannotBeZero"
      );
    });

    it("Should add a book to library", async () => {
      await bookLibrary.addBook("Book1", 100);
      const bookCount = await bookLibrary.bookCount();
      expect(bookCount).to.equal(1);
    });
  });

  describe("Borrowing a book", () => {
    it("Should revert if the user already borrowed the book", async () => {
      await bookLibrary.addBook("Book1", 100);

      await bookLibrary.borrowBook(0);

      await expect(bookLibrary.borrowBook(0)).to.be.revertedWithCustomError(
        bookLibrary,
        "BookLibrary__UserAlreadyBorrowedBook"
      );
    });

    it("Should revert if book is out of stock", async () => {
      await bookLibrary.addBook("Book1", 1);

      await bookLibrary.connect(accounts[1]).borrowBook(0);

      await expect(bookLibrary.borrowBook(0)).to.be.revertedWithCustomError(
        bookLibrary,
        "BookLibrary__BookOutOfStock"
      );
    });

    it("Should borrow a book", async () => {
      await bookLibrary.addBook("Book1", 100);

      await bookLibrary.borrowBook(0);

      const doesUserHaveBook = await bookLibrary.checkBorrower(0);

      expect(doesUserHaveBook).to.equal(true);
    });
  });

  describe("Returning a book", () => {
    it("Should revert if the user does NOT have the book", async () => {
      await expect(bookLibrary.returnBook(0)).to.be.revertedWithCustomError(
        bookLibrary,
        "BookLibrary__BookNotBorrowed"
      );
    });

    it("Should return a book", async () => {
      await bookLibrary.addBook("Book1", 100);

      await bookLibrary.borrowBook(0);

      await bookLibrary.returnBook(0);

      const doesUserHaveBook = await bookLibrary.checkBorrower(0);

      expect(doesUserHaveBook).to.equal(false);
    });
  });

  describe("Should be able to view books", async () => {
    it("Should return the correct book count", async () => {
      await bookLibrary.addBook("Book1", 100);
      await bookLibrary.addBook("Book2", 100);
      await bookLibrary.addBook("Book3", 100);

      const books = await bookLibrary.viewBookList();

      expect(books.length).to.equal(3);
      expect(books[0].name).to.equal("Book1");
      expect(books[1].name).to.equal("Book2");
      expect(books[2].name).to.equal("Book3");
    });
  });

  describe("Should be able to view borrowed books", async () => {
    it("Should return borrwing history", async () => {
      await bookLibrary.addBook("Book1", 100);
      await bookLibrary.addBook("Book2", 100);
      await bookLibrary.addBook("Book3", 100);

      await bookLibrary.borrowBook(0);
      await bookLibrary.connect(accounts[1]).borrowBook(1);

      const books = await bookLibrary.viewPastBorrowings();

      expect(books.length).to.equal(2);
      expect(books[0].borrower).to.equal(accounts[0].address);
      expect(books[0].bookName).to.equal("Book1");

      expect(books[1].borrower).to.equal(accounts[1].address);
      expect(books[1].bookName).to.equal("Book2");
    });
  });
});
