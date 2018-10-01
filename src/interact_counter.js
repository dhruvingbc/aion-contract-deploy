/* interact_counter
 * Interact with deployed counter contract
 * node interact_counter.js {contractAddress}
 */
const fs = require('fs');
// directory where Web3 is stored, in Aion Kernel
global.Web3 = require('aion-web3');
// connecting to Aion local node
const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.201:8545"));

// Importing unlock, compile and deploy scripts
const unlock = require('./contracts/unlock.js')
const compile = require('./contracts/compile.js');
const deploy = require('./contracts/deploy.js');
const readlineSync = require('readline-sync');
const Accounts = require("aion-keystore");

const sol = fs.readFileSync('./contracts/Counter.sol', {
  encoding: 'utf8'
});

let contractAddr = process.argv[2]; // Contract Address
let contractInstance;
let privateKey =
  "0x5746bd483659b19d37a0724925972536b9625be0deb91f72550ab4fa403154920a984f798a95d1f45b6f31f0b15e00d993466036fe0c39962a69cc2bb3006b47";
// let acc = web3.personal.listAccounts;
let events;
// let a0 = acc[2];
// let pw0 = "_password_";

const account = new Accounts();

const acc = account.privateKeyToAccount(privateKey);

Promise.all([
  // Unlock accounts & complile contract
  // unlock(web3, a0, pw0),
  compile(web3, sol),
  console.log("\n[log] 1. unlocking account:"),
  console.log("[log] 2. compiling contract"),

]).then((res) => {
  let a0 = res[0];
  let abi = res[0].Counter.info.abiDefinition;
  let code = res[1].Counter.code;
  console.log("[log] accessing contract\n");
  // Contract Instantiantion
  contractInstance = web3.eth.contract(abi).at(contractAddr);

  // --Get the count value
  let count = contractInstance.getCount();
  console.log("counter =", count.toString(), "\n");
  const hash = contractInstance.incrementCounter(
    {
      from: a0,
      data: code
    }
  )

  console.log("Transaction hash : ", hash);
  events = contractInstance.CounterIncreased({}, { fromBlock: (web3.eth.blockNumber - 1), toBlock: 'latest' });
  // console.log(`event => ${JSON.stringify(events)}`);
  events.watch(function (err, res) {
    if ((res.transactionHash === hash) &&
      (res.event === 'CounterIncreased') &&
      (res.args.counter)) {
      console.log('[log] counter increased \n');
      console.log('[log] Getting latest count.... \n');
      count = contractInstance.getCount();
      console.log("counter =", count.toString(), "\n");
      events.stopWatching();
    }
    else if (err) {
      console.log('error');
      events.stopWatching();
    }

  });
   readlineSync.promptCLLoop({

     // return count
     getCount: function () {
       let count = contractInstance.getCount();
       console.log("counter =", count.toString(), "\n");
     },

     // increment counter by 1
     incrementCounter: function () {
       console.log("The incr counter : ", contractInstance.incrementCounter)
       const hash = contractInstance.incrementCounter(
         {
           from: privateKey,
           data: code
         }
       )

       console.log("The hash : ", hash);
       console.log('[log] counter increased \n');
       events = contractInstance.CounterIncreased({}, { fromBlock: 2627, toBlock: 'latest' });
       console.log(`event => ${JSON.stringify(events)}`);
       events.watch(function (err, res) {
         if (err) {
           console.log(`err => ${JSON.stringify(err)}`);
         }
         else {
           console.log(`res => ${JSON.stringify(res)}`);
         }

       })
     },
     //tx receipt
     receipt: function (hash) {
       // get receipt for given tx hash
       let txReceipt = web3.eth.getTransactionReceipt(hash);
    
 // print tx receipt
     console.log("transaction receipt:");
      console.log(txReceipt);
   },
      //decrement counter by 1
     decrementCounter: function () {
       contractInstance.decrementCounter(
         {
           from: privateKey,
           data: code,
           gas: 50000
         }
       )
       console.log('[log] counter decreased\n');
     }
   })
});
