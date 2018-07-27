module.exports = {

  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "5777" // Match any network id
    }
  },
  solc: {
    optimizer: {
      enabled: true
    }
  }

};
