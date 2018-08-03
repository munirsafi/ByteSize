pragma solidity ^0.4.24;

import "./ByteSizeStorage.sol";
import "./SafeMath.sol";

contract ByteSize {
    using SafeMath for uint256;

    // Global Variable Storage
    ByteSizeStorage public byteStorage;

    // Event Triggers
    event LoanRequested(uint256 loanID);
    event StartedLoan(uint256 loanID);
    event DeniedLoan(uint256 loanID);
    event CanceledLoan(uint256 loanID);
    event PaidLoan(uint256 loanID, uint8 status);
    event CompletedLoan(uint256 loanID);

    enum Status { REQUESTED , ACCEPTED, DENIED, CANCELED, COMPLETED, COMPLETED_LATE }

    constructor(address _byteStorage) public {
        byteStorage = ByteSizeStorage(_byteStorage);
    }

    function requestLoan(address lender, uint256 amount, uint32 length, uint256 interest) public returns(bool) {
        require(lender != msg.sender || amount != 0 || length > 10);
        uint256 loanID = byteStorage.createLoan(lender, msg.sender, amount, length, interest, uint(Status.REQUESTED));

        emit LoanRequested(loanID);
        return true;
    }

    function acceptLoan(uint loanID) public returns(bool) {
        require(msg.sender == byteStorage.getAddress(loanID, keccak256(abi.encodePacked("lender"))));

        byteStorage.setUint(keccak256(abi.encodePacked("status")), uint(Status.ACCEPTED), loanID);
        emit StartedLoan(loanID);
        return true;
    }

    function denyLoan(uint loanID) public returns(bool) {
        require(msg.sender == byteStorage.getAddress(loanID, keccak256(abi.encodePacked("lender"))));

        byteStorage.setUint(keccak256(abi.encodePacked("status")), uint(Status.DENIED), loanID);
        emit DeniedLoan(loanID);
        return true;
    }

}