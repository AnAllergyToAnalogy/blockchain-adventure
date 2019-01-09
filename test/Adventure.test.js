const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
// const provider = require("../ethereum/provider.js");

const provider = ganache.provider({
    gasLimit: 10000000
});

const web3 = new Web3(provider);

// const contracts = require("../ethereum/contracts.js");

const compiledContract = require("../ethereum/build/Adventure.sol.json");


let abi = compiledContract.Adventure.abi;
let abi_array = [];
for(let i in abi){
    abi_array.push(abi[i]);
}

let accounts;
let contract;
beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    contract = await new web3.eth.Contract(abi_array)
        .deploy({
            data: compiledContract.Adventure.evm.bytecode.object,
            arguments: ["Bees",["0x61","0x62"]]
        })
        .send({from: accounts[0], gas:'6000000'});
    contract.setProvider(provider);
});

describe("Adventure Contract", () =>{
    it("Deploys Adventure contract", async() => {
        assert.ok(contract.options.address);
    });
})