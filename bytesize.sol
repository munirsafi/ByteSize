pragma solidity ^0.4.17;

contract ByteSize {

    address owner;

    function ByteSize() public {
        owner = msg.sender;
    }

}