let filenames = [
    "Adventure",
];



const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname,'build');
fs.removeSync(buildPath);

let thisFilename;
let thisPath, thisSource;
let input = {
    language: 'Solidity',
    sources:{},
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }

};
for(let i = 0; i < filenames.length; i++){
    thisFilename = filenames[i]+'.sol';
    thisPath = path.resolve(__dirname, 'contracts', thisFilename);
    thisSource = fs.readFileSync(thisPath, 'utf8');

    input.sources[thisFilename] = {
        content: thisSource
    };


}


fs.ensureDirSync(buildPath);


let output;
let compile;
compile = JSON.parse(solc.compile(JSON.stringify(input)));

if(compile.errors){
    console.log("== ERRORS ==");
    for(var e = 0; e < compile.errors.length; e++){
        console.log(compile.errors[e]);
    }
}

output = compile.contracts;


let outputFilename;

for (let contract in output){
    console.log(
        contract.substr(contract.indexOf(':')+1)
    );

    outputFilename = contract.substr(contract.indexOf(':')+1)+'.json';


    fs.outputJsonSync(
        // path.resolve(buildPath,contract.replace(':','')+'.json'),
        path.resolve(buildPath,outputFilename),
        output[contract]
    );
}

