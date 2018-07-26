pragma solidity ^0.4.17;
import './bytesize_storage.sol';

contract ByteSize {

    // Global Variable Storage
    address owner;
    ByteSizeStorage byteStorage;

    // Event Triggers
    event LoanRequested(uint256 loanID);
    event StartedLoan(uint256 loanID);
    event CanceledLoan(uint256 loanID);
    event PaidLoan(uint256 loanID);
    event CompletedLoan(uint256 loanID);

    function ByteSize(address _byteStorage) public {
        owner = msg.sender;
        byteStorage = ByteSizeStorage(_byteStorage);
    }

    function requestLoan(address lender, uint32 length, uint256 amount) public returns(bool) {
        if(lender == msg.sender || amount == 0 || length < 10) { revert(); return false; }

        uint256 loanID = byteStorage.addLoan(msg.sender, lender, amount, length, 0);

        LoanRequested(loanID);
        return true;
    }

}