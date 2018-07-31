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

    enum Status { REQUESTED , ACCEPTED, CANCELED, COMPLETED, COMPLETED_LATE }

    constructor(address _byteStorage) public {
        byteStorage = ByteSizeStorage(_byteStorage);
    }

    function requestLoan(address lender, uint32 length, uint256 amount) public returns(bool) {
        require(lender != msg.sender || amount != 0 || length > 10);

        uint256 loanID = byteStorage.createLoan();

        emit LoanRequested(loanID);
        return true;
    }

    function acceptLoan(uint loanID) public returns(bool) {
        require(msg.sender == byteStorage.getAddress(loanID, keccak256(abi.encodePacked("loan.lender", msg.sender))));

        byteStorage.setUint(keccak256(abi.encodePacked("loan.status")), uint(Status.ACCEPTED), loanID);
        emit StartedLoan(loanID);
        return true;
    }

}