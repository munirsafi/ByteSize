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

    it("should create a new loan and store it in ByteSizeStorage", () => {
        return ByteSize.deployed().then((instance) => {
            return instance.requestLoan.call("0x9275EfB616D2A347ea607de9B21de9998CCb7366", 1000 * Math.pow(10, 18), 1000, 100 * Math.pow(10, 18), { from: accounts[0], gas: 450000 });
        }).then((loanIndex) => {
            
            assert.equal(loanIndex, 1, "The loan wasn't successfully stored in the loans array");
        });
    });

});
