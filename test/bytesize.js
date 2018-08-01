const ByteSize = artifacts.require("../contracts/ByteSize.sol");
const ByteSizeGovernance = artifacts.require("../contracts/ByteSizeGovernance.sol");
const ByteSizeStorage = artifacts.require("../contracts/ByteSizeStorage.sol");

contract('ByteSize', (accounts) => {

    it("should return the address of the ByteSizeStorage contract", () => {
        return ByteSize.deployed().then((instance) => {
            return instance.byteStorage.call();
        }).then((address) => {
            assert.equal(address, ByteSizeStorage.address, "The addresses don't match");
        });
    });

});
