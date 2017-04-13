/*This file contains the initial and state variables that are used in main.js - they exist here mostly to keep main.js to a usable length */

var resize = {
    initFlowerSize: 0.025,
    shrink: 0.95,
    grow: 1.05,
    dragTolerance: 20
}

var mouseStates = {
    droppedFlower: false,
    currentFlower: null,
    resizeOldFlower: false,
    cursorFlower: false,
};

var modes = {
    plant: true,
    remove: false,
    orderLayers: false
}

//For each flower there is a dictionary for its different pitches
var soundSources = {
    "green": {1:"mp3/MVP Plant Sounds/Plant A8.wav",2:"mp3/MVP Plant Sounds/Plant A7.wav",3:"mp3/MVP Plant Sounds/Plant A6.wav",4:"mp3/MVP Plant Sounds/Plant A5.wav",5:"mp3/MVP Plant Sounds/Plant A4.wav",6:"mp3/MVP Plant Sounds/Plant A3.wav",7:"mp3/MVP Plant Sounds/Plant A2.wav",8:"mp3/MVP Plant Sounds/Plant A1.wav"},
    "red": {1:"mp3/MVP Plant Sounds/Plant B8.wav",2:"mp3/MVP Plant Sounds/Plant B7.wav",3:"mp3/MVP Plant Sounds/Plant B6.wav",4:"mp3/MVP Plant Sounds/Plant B5.wav",5:"mp3/MVP Plant Sounds/Plant B4.wav",6:"mp3/MVP Plant Sounds/Plant B3.wav",7:"mp3/MVP Plant Sounds/Plant B2.wav",8:"mp3/MVP Plant Sounds/Plant B1.wav"},
    "jade": {1:"mp3/MVP Plant Sounds/Plant C8.wav",2:"mp3/MVP Plant Sounds/Plant C7.wav",3:"mp3/MVP Plant Sounds/Plant C6.wav",4:"mp3/MVP Plant Sounds/Plant C5.wav",5:"mp3/MVP Plant Sounds/Plant C4.wav",6:"mp3/MVP Plant Sounds/Plant C3.wav",7:"mp3/MVP Plant Sounds/Plant C2.wav",8:"mp3/MVP Plant Sounds/Plant C1.wav"},
    "succulent": {1:"mp3/MVP Plant Sounds/Plant D8.wav",2:"mp3/MVP Plant Sounds/Plant D7.wav",3:"mp3/MVP Plant Sounds/Plant D6.wav",4:"mp3/MVP Plant Sounds/Plant D5.wav",5:"mp3/MVP Plant Sounds/Plant D4.wav",6:"mp3/MVP Plant Sounds/Plant D3.wav",7:"mp3/MVP Plant Sounds/Plant D2.wav",8:"mp3/MVP Plant Sounds/Plant D1.wav"}
};

var colors = {
    menuColor: "#81E5A9",
    menuSelectColor: "#90F0B3",
};

//Holds all the flower on the canvas at any time
var canvasFlowers = {};

var backgroundTrack = new Howl({
    src: ["mp3/track1Individuals/Au1 louder.mp3"]    
});

var menuChoices = {}

var buttons = {}

var currentMenuChoice = {
    src: "", //actual image source
    name: "", //flower name - "pink", "blue", etc
    div: "", //div that contains it
}

var cursorFlower = null;