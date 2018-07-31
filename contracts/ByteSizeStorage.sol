pragma solidity ^0.4.24;

import "./ByteSizeGovernance.sol";
import "./SafeMath.sol";

contract ByteSizeStorage {
    using SafeMath for uint256;

    struct Loan {
        mapping(bytes32 => bool) _bool;
        mapping(bytes32 => int) _int;
        mapping(bytes32 => uint256) _uint;
        mapping(bytes32 => string) _string;
        mapping(bytes32 => address) _address;
        mapping(bytes32 => bytes) _bytes;
    }

    // Global Variables

    address public byteSize;
    Loan[] internal loans;



    // CONTRACT OPERATIONS
    constructor() public { }

    modifier isValidated() {
        require(msg.sender == byteSize);
        _;
    }



    // ETERNAL STORAGE OPERATIONS

    function createLoan() public isValidated returns(uint256) {
        Loan memory newLoan = Loan();
        loans.push(newLoan);

        return loans.length - 1;
    }

    function setBoolean(bytes32 key, bool value, uint loanID) public isValidated {
        loans[loanID]._bool[key] = value;
    }

    function setInt(bytes32 key, int value, uint loanID) public isValidated {
        loans[loanID]._int[key] = value;
    }

    function setUint(bytes32 key, uint value, uint loanID) public isValidated {
        loans[loanID]._uint[key] = value;
    }

    function setString(bytes32 key, string value, uint loanID) public isValidated {
        loans[loanID]._string[key] = value;
    }

    function setAddress(bytes32 key, address value, uint loanID) public isValidated {
        loans[loanID]._address[key] = value;
    }

    function setBytes(bytes32 key, bytes value, uint loanID) public isValidated {
        loans[loanID]._bytes[key] = value;
    }


    function getBoolean(uint loanID, bytes32 key) public view isValidated returns(bool) {
        return loans[loanID]._bool[key];
    }

    function getInt(uint loanID, bytes32 key) public view isValidated returns(int) {
        return loans[loanID]._int[key];
    }

    function getUint(uint loanID, bytes32 key) public view isValidated returns(uint) {
        return loans[loanID]._uint[key];
    }

    function getString(uint loanID, bytes32 key) public view isValidated returns(string) {
        return loans[loanID]._string[key];
    }

    function getAddress(uint loanID, bytes32 key) public view isValidated returns(address) {
        return loans[loanID]._address[key];
    }

    function getBytes(uint loanID, bytes32 key) public view isValidated returns(bytes) {
        return loans[loanID]._bytes[key];
    }

}