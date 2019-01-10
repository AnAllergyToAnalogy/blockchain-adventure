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


let situations = [
    {
        situationText: "You are surrounded by angry bees.",
        choiceText: Choices(["Kill the bees","Run from the bees","Act like a bee"])
    },
    {
        fromSituation: 0,
        fromChoice: 0,
        situationText: "You try to kill the bees but they sting you.",
        choiceText: Choices(["Look for a spoon","Look for a gun"])
    }
];

let accounts;
let contract;
beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    contract = await new web3.eth.Contract(abi_array)
        .deploy({
            data: compiledContract.Adventure.evm.bytecode.object,
            arguments: [
                situations[0].situationText,
                situations[0].choiceText
            ]
        })
        .send({from: accounts[0], gas:'6000000'});
    contract.setProvider(provider);
});


function Choice(choiceText){
    return web3.utils.fromAscii(choiceText);
}
function Choices(choiceTexts){
    let choices = [];
    choiceTexts.forEach( choiceText =>{
        choices.push(Choice(choiceText));
    });
    return choices;
}
function DeChoice(choiceText){
    let converted = web3.utils.toAscii(choiceText);
    converted = converted.replace(/\u0000/g, '');
    return converted;
}
function DeChoices(choiceTexts){
    let choices = [];
    choiceTexts.forEach( choiceText =>{
        choices.push(DeChoice(choiceText));
    });
    return choices;
}

const read_situation = async(id) =>{
    return await contract.getPastEvents("Situation",{
        filter: {id: [0]},
        fromBlock: 0,
        toBlock: 'latest'
    }).then(events => {
        return {
            found: true,
            situationText: events[0].returnValues.situationText,
            choiceText: events[0].returnValues.choiceTexts
        }
    }).catch( error => {
        return {
            found: false,
            error: error,
        }
    });
}

describe("Adventure Contract", () =>{

//Deployment
    it("Deploys Adventure contract", async() => {
        assert.ok(contract.options.address);
    });
    it("First Situation emits event", async () => {
        let situation = await read_situation(0);
        assert(situation.found);
        if(situation.found){
            assert(situation.situationText === situations[0].situationText);
            for(let i = 0; i < situation.choiceText; i++){
                assert(situation.choiceText[i] === situations[0].choiceText[i]);
            }
        }
    });
    //Cbf testing that can't deploy with no choices

//add_situation
    it("Can add situation", async () => {

        try{
            await contract.methods.add_situation(
                situations[1].fromSituation,
                situations[1].fromChoice,
                situations[1].situationText,
                situations[1].choiceText
            ).send({
                from: accounts[0],
                gas: '6000000'
            });
            assert(true);
        }catch(err){
            console.log(err);
            assert(false);
        }


    });
    it("Can't close all pathways", async () => {

    });
    it("Can't make situation with empty situationText", async () => {

    });
    it("Can't use a situation.fromChoice that doesn't exist", async () => {

    });
    it("Can't come from a non-existant situation", async () => {

    });
    it("Situation emits event", async () => {

    });
    it("Situation ascribes correct author address", async () => {

    });


//add_signature
    it("Can add signature", async () => {

    });

//get_signature
    it("Reports correct signature for situation", async () => {

    });

//get_author
    it("Reports correct author address for situation", async () => {

    });

//get_next_situation
    it("Follows correct choice path", async () => {

    });




})