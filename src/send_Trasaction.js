const fs = require("fs");
const rp = require("request-promise");
const Accounts = require("aion-keystore");

// directory where Web3 is stored, in Aion Kernel
global.Web3 = require('aion-web3');
// connecting to Aion local node
const web3 = new Web3(new Web3.providers.HttpProvider("http://aion-mastery.bdnodes.net:8545"));

// Importing unlock, compile and deploy scripts
// const unlock = require('./scripts/unlock.js')
const compile = require('./contracts/compile.js');
const deploy = require('./contracts/deploy.js');
const readlineSync = require('readline-sync')



let privateKey =
  "0x5746bd483659b19d37a0724925972536b9625be0deb91f72550ab4fa403154920a984f798a95d1f45b6f31f0b15e00d993466036fe0c39962a69cc2bb3006b47";
const account = new Accounts();
const acc = account.privateKeyToAccount(privateKey);
const nonce = web3.eth.getTransactionCount(acc.address);
const value = process.argv[2];


const tx = {
    to: '0xa0f717ba35f5c539c73e144dbe2cb0a1bf951a93b3dc933ccde97b0100770487',
    value,
    gasPrice: 10000000000,
    gas: 220000,
    nonce,
    timestamp: Date.now() * 1000
}

acc.signTransaction(tx).then((signed) => {
    console.log(`signed ${JSON.stringify(signed)}`);
    const body = {
        jsonrpc: "2.0",
        method: "eth_sendRawTransaction",
        params: [signed.rawTransaction],
        id: 1
    };
    rp({
        method: "POST",
        uri: "http://aion-mastery.bdnodes.net:8545",
        body,
        json: true
    })
    .then(response => {
        console.log("txHash " + JSON.stringify(response.result));
        console.log("submitted");
    })
})
