module.exports = {

  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "1"
    }
  },
  solc: {
    optimizer: {
      enabled: true
    }
  }

};
