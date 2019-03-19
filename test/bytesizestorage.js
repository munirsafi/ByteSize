const ByteSizeStorage = artifacts.require("../contracts/ByteSizeStorage.sol");
const ByteSize = artifacts.require("../contracts/ByteSize.sol");

contract('ByteSizeStorage', async (accounts) => {

    it("should return the address of the account that deployed the contract", async () => {
        const instance = await ByteSizeStorage.deployed();
        const address = await instance.owner.call();
        assert.equal(address, accounts[0], "The addresses don't match");
    });
    
    it("should create a new loan and return the loan ID", async () => {
        const instance = await ByteSizeStorage.deployed();
        const loanID = await instance.createLoan.call();
        assert.equal(loanID.toNumber(), 0, "The loan was not successfully created");
    });

    it("should create 3 new loans and return the correct loan ID", async () => {
        const instance = await ByteSizeStorage.deployed();
        await instance.createLoan();
        await instance.createLoan();
        const loanID = await instance.createLoan.call();
        assert.equal(loanID.toNumber(), 2, "An unexpected loanID was returned");
    });

});