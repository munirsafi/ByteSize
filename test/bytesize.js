const ByteSize = artifacts.require("../contracts/ByteSize.sol");
const ByteSizeStorage = artifacts.require("../contracts/ByteSizeStorage.sol");

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

        await byteSizeInstance.requestLoan(accounts[3], web3.utils.toWei("0.5", 'ether'), 1000, 100, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(0, { from: accounts[3], value: web3.utils.toWei("0.5", 'ether') });

        const result = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('status'), { from: accounts[0], gas: 450000 });
        assert.equal(result.toNumber(), 1, "The loan wasn't successfully accepted by the lender");
    });

    it("should return false since the loan's status is no longer requested and we're trying to deny it", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 100, 1000, 100, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(1, { from: accounts[3], value: 1000 });

        const result = await byteSizeInstance.denyLoan.call(1, { from: accounts[3] });
        assert.equal(result, false, "The loan was denied even though it was in a non-requested state");
    });

    it("should return a date value for the loan's start date property", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 100, 1000, 100, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(2, { from: accounts[3], value: 100 });

        const result = await byteStorageInstance.getUint.call(2, web3.utils.soliditySha3('start_time'), { from: accounts[0] });
        assert.ok(typeof result.toNumber() === 'number');
    });

    it("should return a value of 50, referencing the amount of wei paid back so far", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 100, 1000, 100, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(3, { from: accounts[3], value: 100 });
        await byteSizeInstance.payLoan(3, { from: accounts[0], value: 50 });

        const paidBack = await byteStorageInstance.getUint.call(3, web3.utils.soliditySha3('paid_back'), { from: accounts[0] });
        assert.equal(paidBack.toNumber(), 50, "The amount was not successfully paid to the loan");
    });

    it("should submit multiple payments to a loan that will add up to 90", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 100, 1000, 100, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(4, { from: accounts[3], value: 100 });
        await byteSizeInstance.payLoan(4, { from: accounts[0], value: 40 });
        await byteSizeInstance.payLoan(4, { from: accounts[0], value: 20 });
        await byteSizeInstance.payLoan(4, { from: accounts[0], value: 30 });

        const paidBack = await byteStorageInstance.getUint.call(4, web3.utils.soliditySha3('paid_back'), { from: accounts[0] });
        assert.equal(paidBack.toNumber(), 90, "The amount was not successfully paid to the loan");
    });

});
