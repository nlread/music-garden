paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file
/* This file contains the initial and state variables that are used in main.js - they exist here mostly to keep main.js to a usable length */

var resize = {
    initFlowerSize: 0.025
}

var appStates = {
    droppedFlower: false,
    currentFlower: null,
    resizeOldFlower: false,
    cursorFlower: false,
    prevItemHit: null,
    transparentFlowers: []
};

var interactionModes = {
    plant: true,
    remove: false,
    orderLayers: false
}

//For each flower there is a dictionary for its different pitches
var soundSources = {
    "green": {1:"www/mp3/mvpPlantSounds/plantA8.wav",2:"www/mp3/mvpPlantSounds/plantA7.wav",3:"www/mp3/mvpPlantSounds/plantA6.wav",4:"www/mp3/mvpPlantSounds/plantA5.wav",5:"www/mp3/mvpPlantSounds/plantA4.wav",6:"www/mp3/mvpPlantSounds/plantA3.wav",7:"www/mp3/mvpPlantSounds/plantA2.wav",8:"www/mp3/mvpPlantSounds/plantA1.wav"},
    "red": {1:"www/mp3/mvpPlantSounds/plantB8.wav",2:"www/mp3/mvpPlantSounds/plantB7.wav",3:"www/mp3/mvpPlantSounds/plantB6.wav",4:"www/mp3/mvpPlantSounds/plantB5.wav",5:"www/mp3/mvpPlantSounds/plantB4.wav",6:"www/mp3/mvpPlantSounds/plantB3.wav",7:"www/mp3/mvpPlantSounds/plantB2.wav",8:"www/mp3/mvpPlantSounds/plantB1.wav"},
    "jade": {1:"www/mp3/mvpPlantSounds/plantC8.wav",2:"www/mp3/mvpPlantSounds/plantC7.wav",3:"www/mp3/mvpPlantSounds/plantC6.wav",4:"www/mp3/mvpPlantSounds/plantC5.wav",5:"www/mp3/mvpPlantSounds/plantC4.wav",6:"www/mp3/mvpPlantSounds/plantC3.wav",7:"www/mp3/mvpPlantSounds/plantC2.wav",8:"www/mp3/mvpPlantSounds/plantC1.wav"},
    "succulent": {1:"www/mp3/mvpPlantSounds/plantD8.wav",2:"www/mp3/mvpPlantSounds/plantD7.wav",3:"www/mp3/mvpPlantSounds/plantD6.wav",4:"www/mp3/mvpPlantSounds/plantD5.wav",5:"www/mp3/mvpPlantSounds/plantD4.wav",6:"www/mp3/mvpPlantSounds/plantD3.wav",7:"www/mp3/mvpPlantSounds/plantD2.wav",8:"www/mp3/mvpPlantSounds/plantD1.wav"},
    "beet":  {1:"www/mp3/mvpPlantSounds/plantE8.wav",2:"www/mp3/mvpPlantSounds/plantE7.wav",3:"www/mp3/mvpPlantSounds/plantE6.wav",4:"www/mp3/mvpPlantSounds/plantE5.wav",5:"www/mp3/mvpPlantSounds/plantE4.wav",6:"www/mp3/mvpPlantSounds/plantE3.wav",7:"www/mp3/mvpPlantSounds/plantE2.wav",8:"www/mp3/mvpPlantSounds/plantE1.wav"},
    "sunflower": {1:"www/mp3/mvpPlantSounds/plantF8.wav",2:"www/mp3/mvpPlantSounds/plantF7.wav",3:"www/mp3/mvpPlantSounds/plantF6.wav",4:"www/mp3/mvpPlantSounds/plantF5.wav",5:"www/mp3/mvpPlantSounds/plantF4.wav",6:"www/mp3/mvpPlantSounds/plantF3.wav",7:"www/mp3/mvpPlantSounds/plantF2.wav",8:"www/mp3/mvpPlantSounds/plantF1.wav"
    }
};

var colors = {
    menuColor: "#81E5A9",
    menuSelectColor: "#90F0B3",
};

//namespace for things on screen that may or may not exist at a given time
var screenItems = {
    cursorFlower: null,
    arrows: null
}
//Holds all the flower on the canvas at any time
var canvasFlowers = {};

var backgroundTrack = new Howl({
    src: ["www/mp3/track1Individuals/au1_louder.mp3"]    
});


var buttons = {}

var currentMenuChoice = {
    src: "", //actual image source
    name: "", //flower name - "pink", "blue", etc
}

let flowersGroup = null;