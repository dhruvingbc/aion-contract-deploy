# Wallet Tests

This repository contains the mocha test files for web3 API.

## System Requirements

* **NodeJS** > 8
* **Bignumber.js library**
* **Mocha and Chai**


## Test Requirements

* Make sure you have at least 4 accounts.
* Put the password of the miner in the ``pw`` field in ``wallet_test.js``.
* Set the _aion-web3_ location in ``wallet_test.js``.

## Running Tests

* Running a single mocha test:
In a terminal navigate to the `test` folder and run the test using
```
mocha testName_test.js
```

* Running all the mocha tests:
In a terminal navigate to the `test` folder and run the following command:

```
mocha --recursive
```
