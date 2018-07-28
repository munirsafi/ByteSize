pragma solidity ^0.4.24;

contract ByteSizeStorage {

    struct Loan {
        mapping(bytes32 => bool) _bool;
        mapping(bytes32 => int) _int;
        mapping(bytes32 => uint256) _uint;
        mapping(bytes32 => string) _string;
        mapping(bytes32 => address) _address;
        mapping(bytes32 => bytes) _bytes;
    }

    struct Resolution {
        uint256 _resolutionID;
        uint256 _for;
        uint256 _against;
        uint256 _abstain;

        string _status;
        string _description;
        mapping(address => bool) _castVotes;
    }

    // Global Variables

    address public byteSize;

    Loan[] internal loans;

    uint256 public totalBoardMembers;
    mapping(address => bool) public governance;
    Resolution[] internal resolutions;


    // CONTRACT OPERATIONS
    constructor() public { }

    modifier isValidated() {
        if(msg.sender != byteSize) revert();
        _;
    }



    // GOVERNANCE OPERATIONS

    function addBoardMember(address member) public returns(bool) {
        if(governance[msg.sender] != true) {
            revert();
            return false;
        }

        governance[member] = true;
        totalBoardMembers++;
        return true;
    }

    function removeBoardMember(address member) public returns(bool) {
        if(governance[msg.sender] != true || msg.sender == member || address(this) == member) {
            revert();
            return false;
        }

        governance[member] = false;
        totalBoardMembers--;
        return true;
    }

    function newResolution(string description) public returns(bool) {
        if(governance[msg.sender] != true) {
            revert();
            return false;
        }

        Resolution memory newResolution = Resolution(resolutions.length, 0, 0, 0, "In Progress", description);
        resolutions.push(newResolution);
        return true;
    }

    function castVote(uint resolutionID, int decision) public returns(bool) {
        if(governance[msg.sender] != true || resolutions[resolutionID]._castVotes[msg.sender] == true) {
            revert();
            return false;
        }

        if(decision == 1) {
            resolutions[resolutionID]._for++;
            resolutions[resolutionID]._castVotes[msg.sender] = true;
        } else if(decision == -1) {
            resolutions[resolutionID]._against++;
            resolutions[resolutionID]._castVotes[msg.sender] = true;
        } else if(decision == 0) {
            resolutions[resolutionID]._abstain++;
            resolutions[resolutionID]._castVotes[msg.sender] = true;
        } else {
            revert();
            return false;
        }
    }

    function tallyVote() public view returns(int) {
        
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

}