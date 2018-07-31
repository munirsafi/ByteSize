pragma solidity ^0.4.24;

contract ByteSizeOracle {

    struct Storage {
        mapping(bytes32 => int) _int;
        mapping(bytes32 => string) _string;
        mapping(bytes32 => bytes) _bytes;
    }

    event OracleRequest(bytes32 eventType);

    mapping(address => Storage) oracleStorage;

    address oracleOwner;

    constructor() public {
        oracleOwner = msg.sender;
    }

    function requestInfo(bytes32 dataRequest) public  {
        emit OracleRequest(dataRequest);
    }

    function setInfo(bytes32 header, int data) public {
        require(msg.sender == oracleOwner);
        oracleStorage[msg.sender]._int[header] = data;
    }

    function setInfo(bytes32 header, string data) public {
        require(msg.sender == oracleOwner);
        oracleStorage[msg.sender]._string[header] = data;
    }

    function setInfo(bytes32 header, bytes data) public {
        require(msg.sender == oracleOwner);
        oracleStorage[msg.sender]._bytes[header] = data;
    }

}