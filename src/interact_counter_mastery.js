/* interact_counter
 * Interact with deployed counter contract
 * node interact_counter.js {contractAddress}
 */
const fs = require("fs");
const rp = require("request-promise");
const Accounts = require("aion-keystore");
// directory where Web3 is stored, in Aion Kernel
global.Web3 = require("aion-web3");
// connecting to Aion local node
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

// Importing unlock, compile and deploy scripts
const unlock = require("./contracts/unlock.js");
const compile = require("./contracts/compile.js");
const deploy = require("./contracts/deploy.js");
const readlineSync = require("readline-sync");
const sol = fs.readFileSync("./contracts/Counter.sol", {
  encoding: "utf8"
});

let contractAddr = process.argv[2]; // Contract Address
let contractInstance;
let events;
let privateKey =
  "private_key";
const account = new Accounts();
const acc = account.privateKeyToAccount(privateKey);
Promise.all([
  // Unlock accounts & complile contract
  compile(web3, sol),
  console.log("[log] 2. compiling contract")
]).then(res => {
  let a0 = res[0];
  let abi = res[0].Counter.info.abiDefinition;
  let code = res[0].Counter.code;
  console.log("[log] accessing contract\n");
  // Contract Instantiantion
  contractInstance = web3.eth.contract(abi).at(contractAddr);

  readlineSync.promptCLLoop({
    // return count
    getCount: function() {
      let count = contractInstance.getCount();
      console.log("counter =", count.toString(), "\n");
    },

    // increment counter by 1
    incrementCounter: function() {
      console.log("The incr counter : ", contractInstance.incrementCounter);
      // get NRG estimate for contract
      let estimate = web3.eth.estimateGas({ data: code });
      // Contract object
      const contract = web3.eth.contract(abi);
      // Get contract data
      const contractData = contract.new.getData({
        data: code
      });

      let tempNonce = "";

      const data = {
        jsonrpc: "2.0",
        method: "eth_getTransactionCount",
        params: [`${acc.address}`, "latest"],
        id: 1
      };
      rp({
        method: "POST",
        uri: "http://127.0.0.1:8545",
        body: data,
        json: true
      }).then(body => {
        tempNonce = body.result;
        console.log("Nonce => ", tempNonce);
        const transaction = {
          nonce: tempNonce,
          gasPrice: web3.eth.gasPrice,
          gasLimit: estimate,
          data: contractData,
          timestamp: Date.now() * 1000
        };
        console.log("transaction => ", transaction);
        console.log("[log] 3. deploying... ");
        acc
          .signTransaction(transaction)
          .then(signed => {
            console.log(`signed ${JSON.stringify(signed)}`);
            const hash = contractInstance.incrementCounter(
              signed.rawTransaction
            );

            console.log("The hash : ", hash);
            console.log("[log] counter increased \n");
          })
          .catch(e => {
            console.log("error => ", e);
          });
      }).catch(e=>{
        console.log('error => ',e)
      });
    },
    //tx receipt
    receipt: function(hash) {
      // get receipt for given tx hash
      let txReceipt = web3.eth.getTransactionReceipt(hash);

      // print tx receipt
      console.log("transaction receipt:");
      console.log(txReceipt);
    },
    // decrement counter by 1
    decrementCounter: function() {
      contractInstance.decrementCounter({
        from: acc.address,
        data: code,
        gas: 50000
      });
      console.log("[log] counter decreased\n");
    }
  });
});
