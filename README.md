# ByteSize

> A decentralized lending platform running on the Ethereum blockchain allowing users to set up loans independently from any centralized entity that would require oversight.

## Background

ByteSize is a decentralized lending platform built on the [Ethereum](https://www.ethereum.org/) blockchain. It allows users to request loans without a central authority overseeing the terms and conditions of a loan. ByteSize serves to provide an open lending network for anyone to use; but due to its trustless nature and lack of centralized regulation, is not immune to the potential of fraudulent loan thefts. Users are expected to be knowledgable in the loan transactions which they choose to be a part of. In addition, this platform does not currently provide for adjustments if a renegotiation of terms between a lender and borrower occur. Once a loan starts, it continues until its specified completion deadline.

ByteSize is built to be upgradable, utilizing a proxy pattern known as [Eternal Storage](https://fravoll.github.io/solidity-patterns/eternal_storage.html). Eternal Storage allows for the separation of "business" and "data" logic - allowing for updates to be made to the logic behind the smart contract's functionality, without having any major changes made to the way data is being stored. In addition, since traditional smart contract design involves putting logic and data storage in one contract, any upgrade to the contract would wipe out any persisted data that had been previously saved. Fortunately, Eternal Storage provides a method of circumventing this issue and decoupling the business and data storage logic entirely.

  
## Features

- **Currency-Agnostic:** ByteSize will not require its own token to be used, since there is no real reason to create yet ***another*** token for users to have to store when the platform it lives on provides access to a large list of well adopted tokens/currencies already. Therefore, ByteSize will be currency agnostic and provide support for many different currencies and tokens.

- **Flexible:** Providing as many options as possible for lenders and borrowers will allow for a complete solution to create a decentralized loan from start to finish. Users will be able to choose loan types, durations, interest percentages, and document any additional information when creating the loan contract.

- **Secure:** Being built on the Ethereum blockchain allows ByteSize to utilize all of the security features Ethereum has built in to it. In addition, ByteSize undergoes rigorous testing to ensure that all functions meet the standard of security expected from a decentralized application.

- **Upgradable:** As blockchain technology continues to improve and advance through many iterations and over time, it is vital to have the ability to upgrade the "business" logistic behind the smart contract's functionality. This adds the ability to version different loan objects as well, in order to differentiate compatibility of loan properties to the smart contract's latest features that support the version of the loan making a request.
