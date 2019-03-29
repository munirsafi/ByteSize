const ByteSize = artifacts.require("../contracts/ByteSize.sol");
const ByteSizeStorage = artifacts.require("../contracts/ByteSizeStorage.sol");

contract('ByteSize', async (accounts) => {

    /** Administrative **/

    it("should return the address of the ByteSizeStorage contract", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const instance = await ByteSize.new(byteStorageInstance.address);
        const address = await instance.byteStorage.call();
        assert.equal(address, byteStorageInstance.address, "The addresses don't match");
    });

    it("should update the address of the ByteSize contract in the ByteSizeStorage contract", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[0], gas: 450000 });

        const address = await byteStorageInstance.byteSize.call();
        assert.notEqual('0x' + '0'.repeat(40), address, "The address in ByteSizeStorage was not successfully updated");
    });

    /** Loan Creation **/

    it("should create a new loan and store it in ByteSizeStorage", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        const loanIndex = await byteSizeInstance.requestLoan.call(accounts[3], 100, 86400, 0, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.requestLoan(accounts[3], 100, 86400, 0, { from: accounts[0], gas: 450000 });
        
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
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        let result;
        try {
            result = await byteSizeInstance.requestLoan(accounts[0], 100, 86400, 10, { from: accounts[0], gas: 450000 });
        } catch(err) {
            result = err.toString().includes("Invalid request - you cannot be the lender!");
        }
        assert.equal(result, true, "The loan was created even though a revert should've occurred");
    });

    it("should revert since we're attempting to create a loan below the 100 wei requirement", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        let result;
        try {
            result = await byteSizeInstance.requestLoan(accounts[3], 10, 86400, 10, { from: accounts[0], gas: 450000 });
        } catch(err) {
            result = err.toString().includes("Invalid request - the minimum amount of wei should be 100");
        }
        assert.equal(result, true, "The loan was created even though a revert should've occurred");
    });

    it("should revert since we're attempting to create a loan that's shorter than 24 hours", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        let result;
        try {
            result = await byteSizeInstance.requestLoan(accounts[3], 100, 120, 10, { from: accounts[0], gas: 450000 });
        } catch(err) {
            result = err.toString().includes("Invalid request - the loan length must be at least 24 hours");
        }
        assert.equal(result, true, "The loan was created even though a revert should've occurred");
    });

    it("should revert since we're attempting to create a loan with over 100% interest", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        let result;
        try {
            result = await byteSizeInstance.requestLoan(accounts[3], 100, 86400, 110, { from: accounts[0], gas: 450000 });
        } catch(err) {
            result = err.toString().includes("Invalid request - interest percentage cannot exceed the entire value of the loan!");
        }
        assert.equal(result, true, "The loan was created even though a revert should've occurred");
    });

    /** Loan Administration **/

    it("should create a new loan and the lender should accept it", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 500, 86400, 10, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(0, { from: accounts[3], value: 500 });

        const result = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('status'), { from: accounts[0], gas: 450000 });
        assert.equal(result.toNumber(), 1, "The loan wasn't successfully accepted by the lender");
    });

    it("should create a new loan and the lender should deny it", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 500, 86400, 10, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.denyLoan(0, { from: accounts[3] });

        const result = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('status'), { from: accounts[0], gas: 450000 });
        assert.equal(result.toNumber(), 3, "The loan wasn't successfully denied by the lender");
    });

    it("should create a new loan and the borrower should cancel it", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 500, 86400, 10, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.cancelLoan(0, { from: accounts[0] });

        const result = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('status'), { from: accounts[0], gas: 450000 });
        assert.equal(result.toNumber(), 4, "The loan wasn't successfully denied by the lender");
    });

    it("should create a new loan and an account other than the lender will attempt to accept it but fail", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 500, 86400, 10, { from: accounts[0], gas: 450000 });
        
        let result;
        try {
            result = await byteSizeInstance.acceptLoan(0, { from: accounts[5], value: 500 });
        } catch(err) {
            result = err.toString().includes("Invalid request - you are not the lender of this loan");
        }
        assert.equal(result, true, "The loan was accepted by a non-lender account");
    });

    it("should return false since the loan's status is no longer requested and we're trying to deny it", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 500, 86400, 10, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(0, { from: accounts[3], value: 500 });

        const result = await byteSizeInstance.denyLoan.call(0, { from: accounts[3] });
        assert.equal(result, false, "The loan was denied even though it was in a non-requested state");
    });

    it("should return false since the loan's status is no longer requested and we're trying to accept it", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 500, 86400, 10, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.denyLoan(0, { from: accounts[3]});

        const result = await byteSizeInstance.acceptLoan.call(0, { from: accounts[3], value: 500 });
        assert.equal(result, false, "The loan was accepted even though it was in a non-requested state");
    });

    it("should revert since a borrower cannot request a loan from themselves", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        let result;
        try {
            result = await byteSizeInstance.requestLoan(accounts[3], 500, 86400, 10, { from: accounts[3], gas: 450000 });
        } catch(err) {
            result = err.toString().includes("Invalid request - you cannot be the lender!");
        }

        assert.equal(result, true, "The loan was accepted even though the lender would also be the borrower");
    });

    /** Loan Payments **/

    it("should return a value of 50, referencing the amount of wei paid back so far", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 100, 86400, 10, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(0, { from: accounts[3], value: 100 });
        await byteSizeInstance.payLoan(0, { from: accounts[0], value: 50 });

        const paidBack = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('paid_back'), { from: accounts[0] });
        assert.equal(paidBack.toNumber(), 50, "The amount was not successfully paid to the loan");
    });

    it("should submit multiple payments to a loan that will add up to 90", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 100, 86400, 10, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(0, { from: accounts[3], value: 100 });
        await byteSizeInstance.payLoan(0, { from: accounts[0], value: 40 });
        await byteSizeInstance.payLoan(0, { from: accounts[0], value: 20 });
        await byteSizeInstance.payLoan(0, { from: accounts[0], value: 30 });

        const paidBack = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('paid_back'), { from: accounts[0] });
        assert.equal(paidBack.toNumber(), 90, "The amount was not successfully paid to the loan");
    });

    it("should submit multiple payments to pay back the loan entirely and change its status to complete", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        await byteSizeInstance.requestLoan(accounts[3], 100, 86400, 10, { from: accounts[0], gas: 450000 });
        await byteSizeInstance.acceptLoan(0, { from: accounts[3], value: 100 });
        await byteSizeInstance.payLoan(0, { from: accounts[0], value: 40 });
        await byteSizeInstance.payLoan(0, { from: accounts[0], value: 40 });
        await byteSizeInstance.payLoan(0, { from: accounts[0], value: 30 });

        const status = await byteStorageInstance.getUint.call(0, web3.utils.soliditySha3('status'), { from: accounts[0] });
        assert.equal(status.toNumber(), 5, "The amount was not successfully paid to the loan");
    });

    it("should submit multiple payments to over pay a loan and cause the call to revert", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        const byteSizeInstance = await ByteSize.new(byteStorageInstance.address);
        await byteStorageInstance.updateContract(byteSizeInstance.address, { from: accounts[0], gas: 450000 });

        let result;
        try {
            await byteSizeInstance.requestLoan(accounts[3], 100, 86400, 10, { from: accounts[0], gas: 450000 });
            await byteSizeInstance.acceptLoan(0, { from: accounts[3], value: 100 });
            await byteSizeInstance.payLoan(0, { from: accounts[0], value: 40 });
            await byteSizeInstance.payLoan(0, { from: accounts[0], value: 40 });
            await byteSizeInstance.payLoan(0, { from: accounts[0], value: 35 });
            result = await byteSizeInstance.payLoan(0, { from: accounts[0], value: 30 });
        } catch(err) {
            result = err.toString().includes("This loan is not in an active state");
        }

        assert.equal(result, true, "The loan accepted the payment even though it was already paid back");
    });

});
