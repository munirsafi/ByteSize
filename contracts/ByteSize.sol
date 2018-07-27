pragma solidity ^0.4.24;
import "./ByteSizeStorage.sol";

contract ByteSize {

    // Global Variable Storage
    address owner;
    ByteSizeStorage byteStorage;

    // Event Triggers
    event LoanRequested(uint256 loanID);
    event StartedLoan(uint256 loanID);
    event CanceledLoan(uint256 loanID);
    event PaidLoan(uint256 loanID, uint8 status);
    event CompletedLoan(uint256 loanID);

    constructor(address _byteStorage) public {
        owner = msg.sender;
        byteStorage = ByteSizeStorage(_byteStorage);
    }

    function requestLoan(address lender, uint32 length, uint256 amount) public returns(bool) {
        if(lender == msg.sender || amount == 0 || length < 10) {
            revert();
            return false;
        }

        uint256 loanID = byteStorage.createLoan();

        emit LoanRequested(loanID);
        return true;
    }

}