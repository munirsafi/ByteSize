const ByteSizeStorage = artifacts.require("../contracts/ByteSizeStorage.sol");
const ByteSize = artifacts.require("../contracts/ByteSize.sol");

contract('ByteSizeStorage', async (accounts) => {

    it("should return the address of the account that deployed the contract", async () => {
        const instance = await ByteSizeStorage.new();
        const address = await instance.owner.call();
        assert.equal(address, accounts[0], "The addresses don't match");
    });
    
    it("should create a new loan and return the loan ID", async () => {
        const instance = await ByteSizeStorage.new();
        const loanID = await instance.createLoan.call();
        assert.equal(loanID.toNumber(), 0, "The loan was not successfully created");
    });

    it("should create 3 new loans and return the correct loan ID", async () => {
        const instance = await ByteSizeStorage.new();
        await instance.createLoan();
        await instance.createLoan();
        const loanID = await instance.createLoan.call();
        assert.equal(loanID.toNumber(), 2, "An unexpected loanID was returned");
    });

    it("should revert if a non-owner account attempts to update the contract", async () => {
        const byteStorageInstance = await ByteSizeStorage.new();
        await ByteSize.new(byteStorageInstance.address);

        let result;
        try {
            result = await byteStorageInstance.updateContract(ByteSize.address, { from: accounts[5], gas: 450000 });
        } catch(err ) {
            result = err.toString().includes("You are not the owner of this contract");
        }

        assert.equal(result, true, "The address in ByteSizeStorage was updated when it shouldn't have");
    });

});