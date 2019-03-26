pragma solidity ^0.5.0;

import "./ByteSizeStorage.sol";
import "./SafeMath.sol";

contract ByteSize {
    using SafeMath for uint256;

    // Global Variable Storage
    ByteSizeStorage public byteStorage;

    // Event Triggers
    event LoanRequested(uint256 loanID);
    event LoanStarted(uint256 loanID);
    event LoanDenied(uint256 loanID);
    event LoanCanceled(uint256 loanID);
    event LoanPaid(uint256 loanID, uint256 status);
    event LoanCompleted(uint256 loanID);

    enum Status { REQUESTED, ACCEPTED, ACTIVE, DENIED, CANCELED, COMPLETED, COMPLETED_LATE }

    constructor(address _byteStorage) public {
        byteStorage = ByteSizeStorage(_byteStorage);
    }


    /**
      * @dev creates a loan object in the storage contract and updates
      *      its properties for the provided values
      * @param lender the address of the wallet providing the loan
      * @param amount the number of tokens requested for the loan
      * @param duration the length in minutes that the loan should last for
      * @param interest the interest percentage to be applied over the
                        duration of the loan
      * @return <uint> the ID of the newly created loan
    */
    function requestLoan(address lender, uint256 amount, uint32 duration, uint256 interest) public returns(uint) {
        require(lender != msg.sender, "Invalid request - you cannot be the lender!");
        require(amount >= 100, "Invalid request - the minimum amount of wei should be 100");
        require(duration >= 86400, "Invalid request - the loan length must be at least 24 hours");
        require(interest < 100, "Invalid request - interest percentage cannot exceed the entire value of the loan!");
        uint256 loanID = byteStorage.createLoan();

        uint256 loanAmount = amount + ((amount * interest) / 100);

        byteStorage.setAddress(keccak256(abi.encodePacked("lender")), lender, loanID);
        byteStorage.setAddress(keccak256(abi.encodePacked("borrower")), msg.sender, loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("loan_amount")), amount, loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("loan_amount_interest")), loanAmount, loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("loan_length")), duration, loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("target_completion_date")), block.timestamp + duration, loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("loan_interest")), interest, loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("loan_status")), uint(Status.REQUESTED), loanID);
        byteStorage.setUint(keccak256(abi.encodePacked("paid_back")), 0, loanID);

        emit LoanRequested(loanID);
        return loanID;
    }

    /**
      * @dev if authorized, updates the state of the loan and activates it
      * @param loanID ID of the requested loan
    */
    function acceptLoan(uint loanID) public payable returns(bool) {
        require(msg.sender == byteStorage.getAddress(loanID, keccak256(abi.encodePacked("lender"))), "Invalid request - you are not the lender of this loan");
        uint256 loanAmount = byteStorage.getUint(loanID, keccak256(abi.encodePacked("loan_amount")));
        require(msg.value == loanAmount, "Invalid request - the loan amount must be included in an accept transaction");

        address payable borrower = address(uint160(byteStorage.getAddress(loanID, keccak256(abi.encodePacked("borrower")))));

        if(byteStorage.getUint(loanID, keccak256(abi.encodePacked("status"))) == uint(Status.REQUESTED)) {
            byteStorage.setUint(keccak256(abi.encodePacked("status")), uint(Status.ACCEPTED), loanID);
            byteStorage.setUint(keccak256(abi.encodePacked("start_time")), block.timestamp, loanID);
            borrower.transfer(loanAmount);
            emit LoanStarted(loanID);
            return true;
        }

        return false;
    }

    /**
      * @dev allows the lender to deny a loan request made to them
      * @param loanID ID of the requested loan
      * @return <boolean> true if the loan was successfully denied, or false if not
    */
    function denyLoan(uint loanID) public returns(bool) {
        require(msg.sender == byteStorage.getAddress(loanID, keccak256(abi.encodePacked("lender"))), "Invalid request - you are not the lender of this loan");

        if(byteStorage.getUint(loanID, keccak256(abi.encodePacked("status"))) == uint(Status.REQUESTED)) {
            byteStorage.setUint(keccak256(abi.encodePacked("status")), uint(Status.DENIED), loanID);
            byteStorage.setUint(keccak256(abi.encodePacked("end_time")), block.timestamp, loanID);
            emit LoanDenied(loanID);
            return true;
        }

        return false;
    }

    /**
      * @dev allows the borrower to cancel a loan request they made, only before
      *      it gets accepted by the lender
      * @param loanID ID of the requested loan
      * @return <boolean> true if the loan was successfully canceled, or false if not
    */
    function cancelLoan(uint loanID) public returns(bool) {
        require(msg.sender == byteStorage.getAddress(loanID, keccak256(abi.encodePacked("borrower"))), "Invalid request - you are not the borrower of this loan");

        if(byteStorage.getUint(loanID, keccak256(abi.encodePacked("status"))) == uint(Status.REQUESTED)) {
            byteStorage.setUint(keccak256(abi.encodePacked("status")), uint(Status.CANCELED), loanID);
            emit LoanCanceled(loanID);
            return true;
        }

        return false;
    }

    /**
      * @dev gives the borrower the ability to pay back towards a certain loan
      * @param loanID ID of the requested loan
      * @return <uint> the total of how much has been paid back so far
    */
    function payLoan(uint loanID) public payable returns(uint) {
        require(msg.sender == byteStorage.getAddress(loanID, keccak256(abi.encodePacked("borrower"))), "Invalid request - you are not the borrower of this loan");
        require(msg.value > 0, "Invalid request - you must include an amount of wei in your transaction");

        if(byteStorage.getUint(loanID, keccak256(abi.encodePacked("status"))) == uint(Status.ACCEPTED) ||
            byteStorage.getUint(loanID, keccak256(abi.encodePacked("status"))) == uint(Status.ACTIVE)) {

            uint paidBackSoFar = byteStorage.getUint(loanID, keccak256(abi.encodePacked("paid_back")));
            uint loanAmount = byteStorage.getUint(loanID, keccak256(abi.encodePacked("loan_amount_interest")));
            address payable lender = address(uint160(byteStorage.getAddress(loanID, keccak256(abi.encodePacked("lender")))));
            uint256 targetDate = byteStorage.getUint(loanID, keccak256(abi.encodePacked("target_completion_date")));

            if(paidBackSoFar <= loanAmount) {
                if(paidBackSoFar + msg.value < loanAmount) {
                    byteStorage.setUint(keccak256(abi.encodePacked("paid_back")), paidBackSoFar + msg.value, loanID);
                    lender.transfer(msg.value);
                    emit LoanPaid(loanID, byteStorage.getUint(loanID, keccak256(abi.encodePacked("status"))));
                    return paidBackSoFar + msg.value;
                } else {
                    if(block.timestamp > targetDate) {
                        byteStorage.setUint(keccak256(abi.encodePacked("status")), uint(Status.COMPLETED_LATE), loanID);
                    } else {
                        byteStorage.setUint(keccak256(abi.encodePacked("status")), uint(Status.COMPLETED), loanID);
                    }
                    byteStorage.setUint(keccak256(abi.encodePacked("paid_back")), paidBackSoFar + msg.value, loanID);
                    emit LoanCompleted(loanID);
                    return paidBackSoFar + msg.value;
                }
            } else {
                revert("You are attempting to pay towards a loan that has already been fulfilled");
            }

        } else {
            revert("This loan is not in an active state.");
        }
    }

}