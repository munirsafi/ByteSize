pragma solidity ^0.5.0;

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

    address public owner;
    address public byteSize;
    Loan[] loans;

    constructor() public {
        owner = msg.sender;
    }

    /**
      * @dev allows for the lending contract to be swapped out with a
      *      newer, updated contract
      */
    function updateContract(address newContract) public returns(bool) {
        require(msg.sender == owner, "You are not the owner of this contract");
        byteSize = newContract;
        return true;
    }

    /**
      * @dev validates the requesting entity is authorized to make changes
      */
    modifier isValidated() {
        require(msg.sender == byteSize, "Unauthorized access");
        _;
    }

    /**
      * @dev Creates a new loan object and inserts it into the loans array
      * @return loanID the index of the  the newly created loan object
      */
    function createLoan() public returns(uint256) {
        Loan memory newLoan = Loan();
        loans.push(newLoan);
        return loans.length - 1;
    }


    // Loan object setters
    function setBoolean(bytes32 key, bool value, uint loanID) public isValidated {
        loans[loanID]._bool[key] = value;
    }

    function setInt(bytes32 key, int value, uint loanID) public isValidated {
        loans[loanID]._int[key] = value;
    }

    function setUint(bytes32 key, uint value, uint loanID) public isValidated {
        loans[loanID]._uint[key] = value;
    }

    function setString(bytes32 key, string memory value, uint loanID) public isValidated {
        loans[loanID]._string[key] = value;
    }

    function setAddress(bytes32 key, address value, uint loanID) public isValidated {
        loans[loanID]._address[key] = value;
    }

    function setBytes(bytes32 key, bytes memory value, uint loanID) public isValidated {
        loans[loanID]._bytes[key] = value;
    }


    // Loan object getters
    function getBoolean(uint loanID, bytes32 key) public view returns(bool) {
        return loans[loanID]._bool[key];
    }

    function getInt(uint loanID, bytes32 key) public view returns(int) {
        return loans[loanID]._int[key];
    }

    function getUint(uint loanID, bytes32 key) public view returns(uint) {
        return loans[loanID]._uint[key];
    }

    function getString(uint loanID, bytes32 key) public view returns(string memory) {
        return loans[loanID]._string[key];
    }

    function getAddress(uint loanID, bytes32 key) public view returns(address) {
        return loans[loanID]._address[key];
    }

    function getBytes(uint loanID, bytes32 key) public view returns(bytes memory) {
        return loans[loanID]._bytes[key];
    }

}