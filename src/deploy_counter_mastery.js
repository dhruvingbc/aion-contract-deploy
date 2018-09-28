/* deploy_counter
 * Deploy counter.sol contract
 * node deploy_counter.js
 * Output: deployed contract address {0x.....}
 */
const fs = require("fs");
const rp = require("request-promise");
const Accounts = require("aion-keystore");
// directory where Web3 is stored, in Aion Kernel
global.Web3 = require("aion-web3");
// connecting to Aion local node
const networkName = "testnet";
const token = "9d77c366fbae49cba9472ba725cb6180";
const bdNodes = 'http://aion-mastery.bdnodes.net:8545';
const localNodeUrl = "http://127.0.0.1:8545";
const web3 = new Web3(new Web3.providers.HttpProvider(bdNodes));

// Importing unlock, compile and deploy scripts
const unlock = require("./contracts/unlock.js");
const compile = require("./contracts/compile.js");
const deploy = require("./contracts/deploy.js");
const readlineSync = require("readline-sync");

const sol = fs.readFileSync("./contracts/Counter.sol", {
  encoding: "utf8"
});

let contractAddr; // Contract Address
let contractInstance; //
let privateKey =
  "private_key";
const account = new Accounts();
const acc = account.privateKeyToAccount(privateKey);
// Promise.all([
//   //complile contract
//   // compile(web3, sol),
//   console.log("[log] 2. compiling contract")
// ]).then(res => {
const res = JSON.parse(
  fs.readFileSync("./compile.json", {
    encoding: "utf8"
  })
);
let a0 = res[0];
let abi = res[0].Counter.info.abiDefinition;
let code = res[0].Counter.code;

// fs.writeFileSync("./compile.json", JSON.stringify(res), { encoding: "utf8" });

console.log("[log]compile successful! \n");
// get NRG estimate for contract
let estimate = web3.eth.estimateGas({ data: code });
console.log(estimate);
// Contract object
const contract = web3.eth.contract(abi);
// Get contract data
const contractData = contract.new.getData({
  data: code
});

// let tempNonce = "";

// const data = {
//   jsonrpc: "2.0",
//   method: "eth_getTransactionCount",
//   params: [`${acc.address}`, "latest"],
//   id: 1
// };
// rp({
//   method: "POST",
//   uri: "http://127.0.0.1:8545",
//   body: data,
//   json: true
// }).then(body => {
//   tempNonce = body.result;
//   console.log("Nonce => ", tempNonce);
//   const transaction = {
//     nonce: tempNonce,
//     gasPrice: web3.eth.gasPrice,
//     gasLimit: estimate,
//     data: contractData,
//     timestamp: Date.now() * 1000
//   };
//   console.log("transaction => ", transaction);
//   console.log("[log] 3. deploying... ");
//   acc
//     .signTransaction(transaction)
//     .then(signed => {
//       console.log(`signed ${JSON.stringify(signed)}`);
//       const body = {
//         jsonrpc: "2.0",
//         method: "eth_sendRawTransaction",
//         params: [signed.rawTransaction],
//         id: 1
//       };
//       rp({
//         method: "POST",
//         uri: "http://127.0.0.1:8545",
//         body,
//         json: true
//       })
//         .then(response => {
//           console.log("txHash " + JSON.stringify(response.result));
//           console.log("submitted");
//           const txHash = response.result;
//           resp = {
//             isError: false,
//             data: txHash
//           };
//           function poll(txHash) {
//             const checkCondition = (resolve, reject) => {
//               let res = {};
//               const txReceipt = web3.eth.getTransactionReceipt(txHash);
//               if (txReceipt) {
//                 res.txReceipt = txReceipt;
//                 res.tx = web3.eth.getTransaction(txHash);
//                 resolve(res);
//               } else {
//                 console.log("pending");
//                 setTimeout(checkCondition, 500, resolve, reject);
//               }
//             };
//             return new Promise(checkCondition);
//           }
//           poll(txHash).then(resp => {
//             console.log("confirm");
//             console.log(`txReceipt from server `, resp.txReceipt);
//             console.log(`tx from server `, resp.tx);
//           });
//         })
//         .catch(response => {
//           console.log("error " + response);
//           console.log("failed");
//         });
//     })
//     .catch(e => {
//       console.log("error => ", e);
//     });
// });
// });
