pragma solidity ^0.5.0;

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

    enum Status { REQUESTED, ACCEPTED, DENIED, CANCELED, COMPLETED, COMPLETED_LATE }

    constructor(address _byteStorage) public {
        byteStorage = ByteSizeStorage(_byteStorage);
    }


    /**
      * @dev creates a loan object in the storage contract and updates
      *      its properties for the provided values
      * @param lender the address of the wallet providing the loan
      * @param amount the number of tokens requested for the loan
      * @param length the total number of blocks the loan will last for
      * @param interest the interest percentage to be applied over the
                        duration of the loan
      */
    function requestLoan(address lender, uint256 amount, uint32 length, uint256 interest) public returns(uint) {
        require(lender != msg.sender || amount != 0 || length > 10, "Invalid request; missing parameters");
        uint256 loanID = byteStorage.createLoan();

        byteStorage.setAddress(keccak256(abi.encodePacked("lender")), lender, loanID);
        byteStorage.setAddress(keccak256(abi.encodePacked("borrower")), msg.sender, loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("amount")), amount, loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("length")), length, loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("interest")), interest, loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("status")), uint(Status.REQUESTED), loanID);

        emit LoanRequested(loanID);
        return loanID;
    }

    /**
      * @dev if authorized, updates the state of the loan and activates it
      * @param loanID ID of the requested loan
     */
    function acceptLoan(uint loanID) public returns(bool) {
        require(msg.sender == byteStorage.getAddress(loanID, keccak256(abi.encodePacked("lender"))), "Unauthorized access");

        if(byteStorage.getUint(loanID, keccak256(abi.encodePacked("status"))) == uint(Status.REQUESTED)) {
            byteStorage.setUint(keccak256(abi.encodePacked("status")), uint(Status.ACCEPTED), loanID);
            emit StartedLoan(loanID);
            return true;
        }

        return false;
    }

    /**
      * @dev allows the lender to deny a loan request made to them
      * @param loanID ID of the requested loan
     */
    function denyLoan(uint loanID) public returns(bool) {
        require(msg.sender == byteStorage.getAddress(loanID, keccak256(abi.encodePacked("lender"))), "Error");

        if(byteStorage.getUint(loanID, keccak256(abi.encodePacked("status"))) == uint(Status.REQUESTED)) {
            byteStorage.setUint(keccak256(abi.encodePacked("status")), uint(Status.DENIED), loanID);
            emit DeniedLoan(loanID);
            return true;
        }

        return false;
    }

}