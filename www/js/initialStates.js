paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file
/* This file contains the initial and state variables that are used in main.js - they exist here mostly to keep main.js to a usable length */

var resize = {
    initFlowerSize: 0.05
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
    "green": {1:"www/mp3/mvpPlantSounds/plantA8.mp3",2:"www/mp3/mvpPlantSounds/plantA7.mp3",3:"www/mp3/mvpPlantSounds/plantA6.mp3",4:"www/mp3/mvpPlantSounds/plantA5.mp3",5:"www/mp3/mvpPlantSounds/plantA4.mp3",6:"www/mp3/mvpPlantSounds/plantA3.mp3",7:"www/mp3/mvpPlantSounds/plantA2.mp3",8:"www/mp3/mvpPlantSounds/plantA1.mp3"},
    "red": {1:"www/mp3/mvpPlantSounds/plantB8.mp3",2:"www/mp3/mvpPlantSounds/plantB7.mp3",3:"www/mp3/mvpPlantSounds/plantB6.mp3",4:"www/mp3/mvpPlantSounds/plantB5.mp3",5:"www/mp3/mvpPlantSounds/plantB4.mp3",6:"www/mp3/mvpPlantSounds/plantB3.mp3",7:"www/mp3/mvpPlantSounds/plantB2.mp3",8:"www/mp3/mvpPlantSounds/plantB1.mp3"},
    "jade": {1:"www/mp3/mvpPlantSounds/plantC8.mp3",2:"www/mp3/mvpPlantSounds/plantC7.mp3",3:"www/mp3/mvpPlantSounds/plantC6.mp3",4:"www/mp3/mvpPlantSounds/plantC5.mp3",5:"www/mp3/mvpPlantSounds/plantC4.mp3",6:"www/mp3/mvpPlantSounds/plantC3.mp3",7:"www/mp3/mvpPlantSounds/plantC2.mp3",8:"www/mp3/mvpPlantSounds/plantC1.mp3"},
    "succulent": {1:"www/mp3/mvpPlantSounds/plantD8.mp3",2:"www/mp3/mvpPlantSounds/plantD7.mp3",3:"www/mp3/mvpPlantSounds/plantD6.mp3",4:"www/mp3/mvpPlantSounds/plantD5.mp3",5:"www/mp3/mvpPlantSounds/plantD4.mp3",6:"www/mp3/mvpPlantSounds/plantD3.mp3",7:"www/mp3/mvpPlantSounds/plantD2.mp3",8:"www/mp3/mvpPlantSounds/plantD1.mp3"},
    "beet":  {1:"www/mp3/mvpPlantSounds/plantE8.mp3",2:"www/mp3/mvpPlantSounds/plantE7.mp3",3:"www/mp3/mvpPlantSounds/plantE6.mp3",4:"www/mp3/mvpPlantSounds/plantE5.mp3",5:"www/mp3/mvpPlantSounds/plantE4.mp3",6:"www/mp3/mvpPlantSounds/plantE3.mp3",7:"www/mp3/mvpPlantSounds/plantE2.mp3",8:"www/mp3/mvpPlantSounds/plantE1.mp3"},
    "sunflower": {1:"www/mp3/mvpPlantSounds/plantF8.mp3",2:"www/mp3/mvpPlantSounds/plantF7.mp3",3:"www/mp3/mvpPlantSounds/plantF6.mp3",4:"www/mp3/mvpPlantSounds/plantF5.mp3",5:"www/mp3/mvpPlantSounds/plantF4.mp3",6:"www/mp3/mvpPlantSounds/plantF3.mp3",7:"www/mp3/mvpPlantSounds/plantF2.mp3",8:"www/mp3/mvpPlantSounds/plantF1.mp3"
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
    src: ["www/mp3/track1Individuals/au1_louder.wav"]    
});


var buttons = {}

var currentMenuChoice = {
    src: "", //actual image source
    name: "", //flower name - "pink", "blue", etc
}

let flowersGroup = null;
