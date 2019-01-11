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
    {   //0
        situationText: "You are surrounded by angry bees.",
        choiceText: Choices(["Kill the bees","Run from the bees","Act like a bee"])
    },{ //1
        fromSituation: 0,
        fromChoice: 0,
        situationText: "You try to kill the bees but they sting you.",
        choiceText: Choices(["Look for a spoon","Look for a gun"])
    },{ //2
        fromSituation: 0,
        fromChoice: 0,
        situationText: "Situation with no choices",
        choiceText: Choices([])
    },{ //3
        fromSituation: 0,
        fromChoice: 1,
        situationText: "Situation with no choices",
        choiceText: Choices([])
    },{ //4
        fromSituation: 0,
        fromChoice: 2,
        situationText: "Situation with no choices",
        choiceText: Choices([])
    },{ //5
        fromSituation: 0,
        fromChoice: 0,
        situationText: "",  //No situation text
        choiceText: Choices([])
    },{ //6
        fromSituation: 0,
        fromChoice: 4,
        situationText: "Non existent choice",
        choiceText: Choices([])
    },{ //7
        fromSituation: 1000,
        fromChoice: 0,
        situationText: "Non existent situation",
        choiceText: Choices([])
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
        filter: {id: [id]},
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
            for(let i = 0; i < situation.choiceText.length; i++){
                assert(DeChoice(situation.choiceText[i]) === DeChoice(situations[0].choiceText[i]));
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
        await contract.methods.add_situation(
            situations[2].fromSituation,
            situations[2].fromChoice,
            situations[2].situationText,
            situations[2].choiceText
        ).send({
            from: accounts[0],
            gas: '6000000'
        });
        await contract.methods.add_situation(
            situations[3].fromSituation,
            situations[3].fromChoice,
            situations[3].situationText,
            situations[3].choiceText
        ).send({
            from: accounts[0],
            gas: '6000000'
        });

        let failed = false;
        try{
            await contract.methods.add_situation(
                situations[4].fromSituation,
                situations[4].fromChoice,
                situations[4].situationText,
                situations[4].choiceText
            ).send({
                from: accounts[0],
                gas: '6000000'
            });
        }catch(err){
            failed = true;
        }
        assert(failed);
    });


    it("Can't make situation with empty situationText", async () => {
        let failed = false;
        try{
            await contract.methods.add_situation(
                situations[5].fromSituation,
                situations[5].fromChoice,
                situations[5].situationText,
                situations[5].choiceText
            ).send({
                from: accounts[0],
                gas: '6000000'
            });
        }catch(err){
            failed = true;
        }
        assert(failed);
    });


    it("Can't use a situation.fromChoice that doesn't exist", async () => {
        let failed = false;
        try{
            await contract.methods.add_situation(
                situations[6].fromSituation,
                situations[6].fromChoice,
                situations[6].situationText,
                situations[6].choiceText
            ).send({
                from: accounts[0],
                gas: '6000000'
            });
        }catch(err){
            failed = true;
        }
        assert(failed);
    });
    it("Can't come from a non-existant situation", async () => {
        let failed = false;
        try{
            await contract.methods.add_situation(
                situations[7].fromSituation,
                situations[7].fromChoice,
                situations[7].situationText,
                situations[7].choiceText
            ).send({
                from: accounts[0],
                gas: '6000000'
            });
        }catch(err){
            failed = true;
        }
        assert(failed);
    });

    it("Situation emits event", async () => {
        await contract.methods.add_situation(
            situations[1].fromSituation,
            situations[1].fromChoice,
            situations[1].situationText,
            situations[1].choiceText
        ).send({
            from: accounts[0],
            gas: '6000000'
        });

        let situation = await read_situation(1);
        assert(situation.found);
        if(situation.found){
            assert(situation.situationText === situations[1].situationText);
            for(let i = 0; i < situation.choiceText.length; i++){
                assert(DeChoice(situation.choiceText[i]) === DeChoice(situations[1].choiceText[i]));
            }
        }
        // assert(true);

    });


//     it("Situation ascribes correct author address", async () => {
//
//     });
//
//
// //add_signature
//     it("Can add signature", async () => {
//
//     });
//
// //get_signature
//     it("Reports correct signature for situation", async () => {
//
//     });
//
// //get_author
//     it("Reports correct author address for situation", async () => {
//
//     });
//
// //get_next_situation
//     it("Follows correct choice path", async () => {
//
//     });




})