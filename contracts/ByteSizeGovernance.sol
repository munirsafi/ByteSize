pragma solidity ^0.4.24;

import "./SafeMath.sol";

contract ByteSizeGovernance {
    using SafeMath for uint256;

    struct Resolution {
        uint256 _resolutionID;
        uint256 _for;
        uint256 _against;
        uint256 _abstain;

        bytes32 _status;
        bytes32 _description;
        mapping(address => bool) _castVotes;
    }

    uint256 public totalBoardMembers;
    mapping(address => bool) public governance;
    Resolution[] internal resolutions;

    constructor() public {
        governance[msg.sender] = true;
    }

    // GOVERNANCE OPERATIONS

    function addBoardMember(address member) public returns(bool) {
        require(governance[msg.sender] = true);

        governance[member] = true;
        totalBoardMembers++;
        return true;
    }

    function removeBoardMember(address member) public returns(bool) {
        require(governance[msg.sender] == true || msg.sender != member || address(this) != member);

        governance[member] = false;
        totalBoardMembers--;
        return true;
    }

    function createResolution(bytes32 description) public returns(bool) {
        require(governance[msg.sender] == true);

        Resolution memory newResolution = Resolution(resolutions.length, 0, 0, 0, "In Progress", description);
        resolutions.push(newResolution);
        return true;
    }

    function castVote(uint resolutionID, int decision) public returns(bool) {
        require(governance[msg.sender] == true || resolutions[resolutionID]._castVotes[msg.sender] != true);

        if(decision == 1) {
            resolutions[resolutionID]._for++;
            resolutions[resolutionID]._castVotes[msg.sender] = true;
            return true;
        } else if(decision == -1) {
            resolutions[resolutionID]._against++;
            resolutions[resolutionID]._castVotes[msg.sender] = true;
            return true;
        } else if(decision == 0) {
            resolutions[resolutionID]._abstain++;
            resolutions[resolutionID]._castVotes[msg.sender] = true;
            return true;
        } else {
            revert();
            return false;
        }
    }

}