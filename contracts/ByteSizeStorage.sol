pragma solidity ^0.4.24;

contract ByteSizeStorage {

    struct Loan {
        address requester;
        address lender;

        uint256 amount;
        uint32 length;
        uint8 status;
    }

    // Global Variables
    Loan[] public loans;

    address owner;
    address byteSize;

    constructor() public {
        owner = msg.sender;
    }

    modifier isValidated() {
        if(msg.sender != byteSize) revert();
        _;
    }

    function addLoan(address requester, address lender, uint256 amount, uint32 length, uint8 status) public isValidated returns(uint256) {
        Loan memory newLoan = Loan(requester, lender, amount, length, status);
        loans.push(newLoan);
        
        return loans.length - 1;
    }

    function removeLoan(uint256 loanID) public returns(bool) {
        if(loans.length < loanID) {
            revert();
            return false;
        }

        delete loans[loanID];
        return true;
    }

}