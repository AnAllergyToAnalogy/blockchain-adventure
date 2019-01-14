function Contract(){
    let contract =  {
        get_situation: async (id) => {
//TODO: this is all temp
            let situations = [{   //0
                situationText: "You are surrounded by angry bees.",
                choiceText: ["Kill the bees","Run from the bees","Act like a bee"]
            },{ //1
                fromSituation: 0,
                fromChoice: 0,
                situationText: "You try to kill the bees but they sting you.",
                choiceText: ["Look for a spoon","Look for a gun"]
            },{ //2
                fromSituation: 0,
                fromChoice: 0,
                situationText: "Situation with no choices",
                choiceText: []
            },{ //3
                fromSituation: 0,
                fromChoice: 1,
                situationText: "Situation with no choices",
                choiceText: []
            }];

            return situations[id];
        },
        get_signature: async (situation) => {
            return "Signature.";
        },
        get_author: async (situation) => {
            return "0xFF00FF";
        },
        get_next_situation: async (fromSituation,fromChoice) => {
            if(fromSituation === 0) return fromChoice;
            return '0';
        }
    };
    return contract;
}