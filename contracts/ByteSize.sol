pragma solidity ^0.4.24;

import "./ByteSizeStorage.sol";
import "./SafeMath.sol";

contract ByteSize {
    using SafeMath for uint256;

    // Global Variable Storage
    ByteSizeStorage byteStorage;

    // Event Triggers
    event LoanRequested(uint256 loanID);
    event StartedLoan(uint256 loanID);
    event CanceledLoan(uint256 loanID);
    event PaidLoan(uint256 loanID, uint8 status);
    event CompletedLoan(uint256 loanID);

    constructor(address _byteStorage) public {
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