const ByteSize = artifacts.require("../contracts/ByteSize.sol");
const ByteSizeStorage = artifacts.require("../contracts/ByteSizeStorage.sol");

module.exports = function (deployer) {
    deployer.deploy(ByteSizeStorage).then(() => {
        deployer.deploy(ByteSize, ByteSizeStorage.address);
    });
};
