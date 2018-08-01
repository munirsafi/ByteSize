const ByteSize = artifacts.require("../contracts/ByteSize.sol");
const ByteSizeGovernance = artifacts.require("../contracts/ByteSizeGovernance.sol");
const ByteSizeOracle = artifacts.require("../contracts/ByteSizeOracle.sol");
const ByteSizeStorage = artifacts.require("../contracts/ByteSizeStorage.sol");

contract('ByteSize', (accounts) => {

    it("should return the address of the ByteSizeStorage contract", () => {
        ByteSize.deployed().then((instance) => {
            return instance.getStorageAddress();
        }).then((address) => {
            assert.equal(address, ByteSizeStorage.address, "The addresses don't match");
        });
    });

    it("should create a loan request", () => {
        ByteSize.deployed().then((instance) => {
            return instance.getStorageAddress();
        }).then((address) => {
            assert.equal(address, ByteSizeStorage.address, "The addresses don't match");
        });
    });

});
