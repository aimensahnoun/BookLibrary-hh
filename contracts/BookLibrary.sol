// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

//Imports
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//Errors
error BookLibrary__NameCannotBeEmpty();
error BookLibrary__CountCannotBeZero();
error BookLibrary__BookIdOutOfRange();
error BookLibrary__BookOutOfStock();
error BookLibrary__UserAlreadyBorrowedBook();
error BookLibrary__BookNotBorrowed();

contract BookLibrary is Ownable {
    using Strings for uint256;

    // Events
    event BookAdded(uint256 bookId, string name, uint256 count);
    event BookBorrowed(uint256 indexed bookId, address indexed user);
    event BookReturned(uint256 indexed bookId, address indexed user);

    struct Book {
        string name;
        uint16 count;
    }

    struct BookReceipt {
        address borrower;
        string bookName;
        uint256 time;
    }

    Book[] bookList;
    BookReceipt[] bookReceipts;

    uint256 public bookCount;

    mapping(string => bool) doesUserHaveBook;

    modifier doesBookExist(uint256 _id) {
        if (_id > bookCount - 1) revert BookLibrary__BookIdOutOfRange();
        _;
    }

    function addBook(string memory _name, uint16 _count) public onlyOwner {
        if (keccak256(bytes(_name)) == keccak256(bytes("")))
            revert BookLibrary__NameCannotBeEmpty();

        if (_count == 0) revert BookLibrary__CountCannotBeZero();

        bookList.push(Book(_name, _count));
        bookCount++;
    }

    function borrowBook(uint256 _id) public doesBookExist(_id) {
        if (doesUserHaveBook[getUserBookId(msg.sender, _id)])
            revert BookLibrary__UserAlreadyBorrowedBook();

        Book memory selectedBook = bookList[_id];

        if (selectedBook.count == 0) revert BookLibrary__BookOutOfStock();

        bookList[_id].count--;
        doesUserHaveBook[getUserBookId(msg.sender, _id)] = true;
        bookReceipts.push(
            BookReceipt(msg.sender, selectedBook.name, block.timestamp)
        );
    }

    function returnBook(uint256 _id) public {
        if (!doesUserHaveBook[getUserBookId(msg.sender, _id)])
            revert BookLibrary__BookNotBorrowed();
        bookList[_id].count++;
        doesUserHaveBook[getUserBookId(msg.sender, _id)] = false;
    }

    function checkBorrower(uint256 _id)
        public
        view
        doesBookExist(_id)
        returns (bool)
    {
        return doesUserHaveBook[getUserBookId(msg.sender, _id)];
    }

    function viewBookList() public view returns (Book[] memory) {
        return bookList;
    }

    function viewPastBorrowings() public view returns (BookReceipt[] memory) {
        return bookReceipts;
    }

    function getUserBookId(address sender, uint256 _id)
        public
        pure
        returns (string memory)
    {
        return string(abi.encodePacked(sender, _id.toString()));
    }
}
