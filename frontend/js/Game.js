function Game(container,contract){
    let game = {
          screens: {
              welcome:      ById("welcome"),
              situation:    ById("situation"),
              create:       ById("create"),
              confirm:      ById("confirm"),
              wait:         ById("wait"),
          },
        reveals: (elements /*array*/) => {
              for(let i = 0; i < elements.length; i++){
                Show(elements[i],false);
                  // elements[i].style.display = "none";
                setTimeout(()=>{
                    Show(elements[i],true);
                    // elements[i].style.display = "initial";
                }, (i + 1) * 50 + 250);
              }
        },

        init: () => {
            //Start page
            onClick(ById("start-game"),()=>{
                game.open_situation(0);
            });
        },

        show_screen: (screen) => {
              for(let s in game.screens){
                  Show(game.screens[s],s === screen);
                  //
                  // if(s === screen){
                  //   game.screens[s].style.display = "initial";
                  // }else{
                  //     game.screens[s].style.display = "none";
                  // }
              }
        },
        start: () => {
              // console.log(container);
            container.style.display = "inherit";
            game.show_screen("welcome");
        },

        open_create: async(from_situation,from_choice) => {
            game.show_screen(false);
            let previous_situation = await contract.get_situation(from_situation);
            SetText(ById('create-prev-situation'),previous_situation.situationText);


            let prevChoices = ById('create-prev-choices');
            prevChoices.innerHTML = '';
            for(let i = 0; i < previous_situation.choiceText.length; i++){
                prevChoices.appendChild(
                    PrevChoice(previous_situation.choiceText[i],String(i) === String(from_choice))
                )
            }


            game.show_screen('create');



        },
        open_situation: async (id) => {
            game.show_screen(false);

            ById('situation-text').style.color = "#FFFFFF";

            let situation = await contract.get_situation(id);
            let author = await contract.get_author(id);
            let signature = await contract.get_signature(id);

            //Clear Choices
            while(game.screens.situation.children.length > 4){
                let length = game.screens.situation.children.length;
                game.screens.situation.removeChild(
                    game.screens.situation.children[length - 2]
                )
            }
            //Add new choices

            for( let i = 0; i < situation.choiceText.length; i++){
                let choice_label = situation.choiceText[i];
                let length = game.screens.situation.children.length;
                let newOption = Option(choice_label);
                onClick(newOption,()=>{
                    game.goto_next_situation(id,i);
                });
                game.screens.situation.insertBefore(
                    newOption,
                    game.screens.situation.children[length - 1]
                );
            }
            if(situation.choiceText.length === 0){
                game.screens.situation.insertBefore(
                    GameOver(),
                    game.screens.situation.children[3]
                );
                let play_again = Option("Play again?");
                onClick(play_again,game.start);
                game.screens.situation.insertBefore(
                    play_again,
                    game.screens.situation.children[4]
                )
            }


            game.show_screen('situation');

                SetText(ById('situation-text'),situation.situationText);

                SetText(ById('credit-signature'),signature);
                SetText(ById('credit-author'),author);

              let screen_elements = game.screens.situation.children;
              game.reveals(screen_elements);
        },
        propt_situation_creation: async(from_situation,from_choice) =>{
            game.show_screen(false);

            SetText(ById('situation-text'),
                "It looks like nobody has decided what happens next... yet. But don't despair! You can go back to the previous situation, or if you're feeling creative, add to the story."
            );
            ById('situation-text').style.color = "#00ffff";

            let author = "";
            let signature = "";

            //Clear Choices
            while(game.screens.situation.children.length > 4){
                let length = game.screens.situation.children.length;
                game.screens.situation.removeChild(
                    game.screens.situation.children[length - 2]
                )
            }

            //Add new choices
            let go_back  = Option("Take me back to the last situation");
            onClick(go_back,()=>{game.open_situation(from_situation)});
            game.screens.situation.insertBefore(
                go_back,
                game.screens.situation.children[3]
            );

            let add_situation = Option("Add to the story");
            onClick(add_situation,()=>{game.open_create(from_situation,from_choice)});
            game.screens.situation.insertBefore(
                add_situation,
                game.screens.situation.children[4]
            )


            let play_again = Option("Start the game again");
            onClick(play_again,game.start);
            game.screens.situation.insertBefore(
                play_again,
                game.screens.situation.children[5]
            )


            game.show_screen('situation');


            SetText(ById('credit-signature'),signature);
            SetText(ById('credit-author'),author);

            let screen_elements = game.screens.situation.children;
            game.reveals(screen_elements);
        },
        goto_next_situation: async (from_situation, from_choice) => {
            game.show_screen(false);
            // console.log(from_situation,from_choice);
            //TODO: may need to async here
            let next_situation = await contract.get_next_situation(from_situation,from_choice);
            if(next_situation !== '0'){
                game.open_situation(next_situation);
            }else{
                game.propt_situation_creation(from_situation,from_choice);
            }

        }
    };

    // console.log(game.screens.welcome.getElementsByClassName("title"));//.style.color = "red";

    game.init();
    game.start();
    game.open_create('0','0');

    return game;

}

function onClick(element, action){
    element.addEventListener("click", function(event){
        event.preventDefault();
        action();
    });
}
function Show(element,onOff){
    if(onOff){
        element.style.display = "block";
    }else{
        element.style.display = "none";
    }
}
function ById(id){
    return document.getElementById(id);
}
function SetText(element,text){
    element.innerText = text;
}
function Option(option_text){
    let a = document.createElement('A');
    a.setAttribute("href","");
    let div = document.createElement("DIV");
    div.setAttribute("class","option");
    div.innerText = option_text;
    a.appendChild(div);
    return a;
}

function PrevChoice(choice_text,selected){
    let div = document.createElement("DIV");
    if(selected){
        div.setAttribute("class","prev-option-selected");
        choice_text = "SELECTED: "+choice_text;
    }
    div.innerText = choice_text;
    return div;
}

function GameOver(){
    let div = document.createElement("DIV");
    div.setAttribute("class","game-over");
    div.innerText = " - Game over - ";
    return div;
}