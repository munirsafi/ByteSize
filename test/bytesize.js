const ByteSize = artifacts.require("../contracts/ByteSize.sol");
const ByteSizeStorage = artifacts.require("../contracts/ByteSizeStorage.sol");

contract('ByteSize', async (accounts) => {

    /** Administrative **/

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

    /** Loan Creation **/

    it("should create a new loan and store it in ByteSizeStorage", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        const loanIndex = await byteSizeInstance.requestLoan.call(accounts[3], 100, 86400, 0, { from: accounts[0], gas: 550000 });
        await byteSizeInstance.requestLoan(accounts[3], 100, 86400, 0, { from: accounts[0], gas: 550000 });
        
        const lender = await byteStorageInstance.getAddress.call(0, web3.utils.soliditySha3('lender'), { from: accounts[0], gas: 450000 });
        const borrower = await byteStorageInstance.getAddress.call(0, web3.utils.soliditySha3('borrower'), { from: accounts[0], gas: 450000 });
        const loanAmount = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('loan_amount'), { from: accounts[0], gas: 450000 });
        const loanLength = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('loan_length'), { from: accounts[0], gas: 450000 });
        const targetCompletionDate = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('target_completion_date'), { from: accounts[0], gas: 450000 });
        const loanInterest = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('loan_interest'), { from: accounts[0], gas: 450000 });
        const loanStatus = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('loan_status'), { from: accounts[0], gas: 450000 });

        assert.equal(loanIndex, 0, "The loan wasn't successfully created");
        assert.equal(lender, accounts[3], "The lender wasn't saved correctly");
        assert.equal(borrower, accounts[0], "The borrower wasn't saved correctly");
        assert.equal(loanAmount, 100, "The loan amount wasn't saved correctly");
        assert.equal(loanLength, 86400, "The loan amount wasn't saved correctly");
        assert.notEqual(targetCompletionDate, 0, "The loan's target completion date wasn't saved correctly");
        assert.equal(loanInterest, 0, "The loan's interest percentage wasn't saved correctly");
        assert.equal(loanStatus, 0, "The loan's current status wasn't saved correctly");
    });

    it("should revert since we're attempting to create a loan to ourselves", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        let result;
        try {
            result = await byteSizeInstance.requestLoan(accounts[0], 100, 86400, 10, { from: accounts[0], gas: 450000 });
        } catch(err) {
            result = err.toString().includes("Invalid request - you cannot be the lender!");
        }
        assert.equal(result, true, "The loan was created even though a revert should've occurred");
    });

    it("should revert since we're attempting to create a loan below the 100 wei requirement", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        let result;
        try {
            result = await byteSizeInstance.requestLoan(accounts[3], 10, 86400, 10, { from: accounts[0], gas: 450000 });
        } catch(err) {
            result = err.toString().includes("Invalid request - the minimum amount of wei should be 100");
        }
        assert.equal(result, true, "The loan was created even though a revert should've occurred");
    });

    it("should revert since we're attempting to create a loan that's shorter than 24 hours", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        let result;
        try {
            result = await byteSizeInstance.requestLoan(accounts[3], 100, 120, 10, { from: accounts[0], gas: 450000 });
        } catch(err) {
            result = err.toString().includes("Invalid request - the loan length must be at least 24 hours");
        }
        assert.equal(result, true, "The loan was created even though a revert should've occurred");
    });

    it("should revert since we're attempting to create a loan with over 100% interest", async () => {
        const byteSizeInstance = await ByteSize.deployed();
        const byteStorageInstance = await ByteSizeStorage.deployed();
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        let result;
        try {
            result = await byteSizeInstance.requestLoan(accounts[3], 100, 86400, 110, { from: accounts[0], gas: 450000 });
        } catch(err) {
            result = err.toString().includes("Invalid request - interest percentage cannot exceed the entire value of the loan!");
        }
        assert.equal(result, true, "The loan was created even though a revert should've occurred");
    });

});
