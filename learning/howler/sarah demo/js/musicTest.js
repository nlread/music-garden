//Set's up 4 sounds to be associated with each flower
var Music = function(){
    let sound1 = new Howl({
        src: ['sounds/Badge.m4a']
    });
    let sound2 = new Howl({
        src: ['sounds/Berry.m4a']
    });
    let sound3 = new Howl({
        src: ['sounds/Start.m4a']
    });
    let sound4 = new Howl({
        src: ['sounds/Beginning.m4a']
    });

    //Set's up 4 sounds to be associated with each flower
    let sounds = [sound1,sound2,sound3,sound4];

    //Adds the sound that is associated with the flower
    let play = function(menuChoice){
        sounds[menuChoice].play();
        sounds[menuChoice].loop(true);
    }
}

