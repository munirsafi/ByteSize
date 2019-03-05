const ByteSize = artifacts.require("../contracts/ByteSize.sol");
const ByteSizeStorage = artifacts.require("../contracts/ByteSizeStorage.sol");

const web3 = require('web3-utils');


contract('ByteSize', async (accounts) => {

    it("should return the address of the ByteSizeStorage contract", async () => {
        const instance = await ByteSize.deployed();
        const address = await instance.byteStorage.call();
        assert.equal(address, ByteSizeStorage.address, "The addresses don't match");
    });

    it("should update the address of the ByteSize contract in the ByteSizeStorage contract", async () => {
        await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        const address = await byteStorageInstance.byteSize.call();
        assert.notEqual('0x' + '0'.repeat(40), address, "The address in ByteSizeStorage was not successfully updated");
    });

    it("should create a new loan and store it in ByteSizeStorage", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        const loanIndex = await byteSizeInstance.requestLoan.call(accounts[3], 100, 1000, 100, { from: accounts[0], gas: 450000 });
        assert.equal(loanIndex, 0, "The loan wasn't successfully stored in the loans array");
    });

    it("should create a new loan and the lender should accept it", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 100, 1000, 100, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(0, { from: accounts[3] });

        const result = await byteStorageInstance.getUint.call(0, web3.soliditySha3('status'), { from: accounts[0], gas: 450000 });
        assert.equal(result.toNumber(), 1, "The loan wasn't successfully accepted by the lender");
    });

});
