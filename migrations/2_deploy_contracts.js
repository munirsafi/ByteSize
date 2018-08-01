const ByteSize = artifacts.require("../contracts/ByteSize.sol");
const ByteSizeStorage = artifacts.require("../contracts/ByteSizeStorage.sol");

module.exports = (deployer) => {
    deployer.deploy(ByteSizeStorage).then(() => {
        return ByteSizeStorage.deployed().then((instance) => {
            return instance;
        }).then((byteSizeStorage) => {
            return deployer.deploy(ByteSize, byteSizeStorage.address);
        });
    })
};
