paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file

/*DECLARE GLOBAL CONSTANTS AND VARIABLES*/
var resize = {
    initFlowerSize: 0.2,
    shrink: 0.95,
    grow: 1.05
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
    toolbarColor: "#aaeec5",
    toolbarSelectColor: "#55dd8b"
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

window.interactiveMode = true;

/* ONLOAD */

$(document).ready(function(){
    $('body').chardinJs('start');
});

window.onload = function(){
    console.log("window loaded");
    
    setUpScreen(); 
    initializeGlobals();
    startBackgroundSound();
    
    var myTool = new Tool();
    
    //plant button highlighted by default
    highlightToolbarButton(buttons.plant);
    
    //prevent menus from responding during overlay tutorial
   
    $('.menuChoice').on('click', makeMenuChoice);

    $('.menuChoice').on('mouseover', function(){
        choice = this;
        animateMenuChoice(choice);
    });

     $('.menuChoice').on('mouseout', function(){
        choice = this;
        unHighlightMenuChoice(choice);
    });

    $('#removeButton').on('click', removeButtonClicked);

    $('#sendToBackButton').on('click', sendToBackButtonClicked);

    $('#plantButton').on('click', plantButtonClicked);

    /* these aren't working, commenting out for now
    $('.toolbarButton').on('mouseover', function(){
        $(this.children[1]).animate({
            height: '100%',
            width: '100%'
        })
    })

    $('.toolbarButton').on('mouseout', function(){
        $(this.children[1]).animate({
            height: '95%',
            width: '95%'
        })
    })
    */
    
    
   
        
    myTool.onMouseUp = function(event) {
        stopResize();
    };

    myTool.onMouseDown = function(event){
        if(project.hitTest(event.point)){
            interactWithPlant(event);
            //return so that you don't drop a new flower on top of one to resize
            return;
        } 
        if(currentMenuChoice && modes.plant){
            dropFlower(event);
        }
    }
    
    myTool.onMouseDrag = function(event) { 
        if(modes.plant && mouseStates.droppedFlower){
            scaleFlower(event);
        }
    }
    myTool.onMouseMove = function(event){
        if(modes.plant && mouseStates.cursorFlower){
            moveCursorFlower(event);
        }
    }

    paper.view.onFrame = globalOnFrame;
}

function globalOnFrame(frameEvent) {
    let dTime = frameEvent.delta;
    
    for(let key in canvasFlowers){
        if (canvasFlowers.hasOwnProperty(key)) {
            let flower = canvasFlowers[key];
            if (flower instanceof AnimatedComponent) {
                flower.update(dTime);
            }
        }
    }
}


//HELPER FUNCTIONS

/*
 * Sets up Paper.js screen
 */
setUpScreen = function(){
    paper.setup('canvas')
    view.draw();   
}


/*
 * Initializes global namespaces that we don't have access to until onload() but need 
 * globally
 */
initializeGlobals = function(){
    menuChoices.choice1 = document.getElementById("choice1");
    menuChoices.choice2 = document.getElementById("choice2");
    menuChoices.choice3 = document.getElementById("choice3");
    menuChoices.choice4 = document.getElementById("choice4");
    
    buttons.remove = document.getElementById("removeButton");
    buttons.plant = document.getElementById("plantButton");
    buttons.sendToBack = document.getElementById("sendToBackButton");
    
}

/*
 * Stops resizing plant
 */
stopResize = function(){
    if(mouseStates.resizeOldFlower){
        mouseStates.resizeOldFlower = false;
    }
}

/*
 * Switches current flower being dropped and resets state variables
 */
makeMenuChoice = function(){
    animateMenuChoice(this);
    plantButtonClicked();
    currentMenuChoice.src = this.firstChild.src;
    currentMenuChoice.name = this.firstChild.id
    currentMenuChoice.div = this
    mouseStates.droppedFlower = false;
    mouseStates.cursorFlower = true;
    //delete old cursor flower
    if(cursorFlower){
        cursorFlower.remove()
    }
    cursorFlower = new Raster(currentMenuChoice.src).scale(0.07)
    cursorFlower.opacity = 0.4 
}


/*
 * Animates the menu on click - increases image size and highlights it
 */
animateMenuChoice = function(choice){
    if(currentMenuChoice.src){
        oldMenuChoice =  document.getElementById(currentMenuChoice.name)
        
        $(oldMenuChoice.firstChild).animate({
            height: "95%",
            width: "95%",
            backgroundColor: colors.menuColor
            }, 100
        );
    }

    $(choice.firstChild).animate({
        height: "100%",
        width: "100%"
        }, 100
    );

    $(choice).animate({
        backgroundColor: colors.menuSelectColor
        }, 100
    );  
}

unHighlightMenuChoice = function(choice){
    $(choice.firstChild).animate({
        height: "95%",
        width: "95%"
        }, 100
    );

    $(choice).animate({
        backgroundColor: colors.menuColor
        }, 100
    );  
}

/*
 * Resets states after plant button clicked
 */
plantButtonClicked = function(){
    highlightToolbarButton(buttons.plant);
    unHighlightToolbarButton(buttons.remove);
    unHighlightToolbarButton(buttons.sendToBack);
    modes.remove = false;
    modes.orderLayers = false; 
    modes.plant = true;
}

/*
 * Resets states after remove button clicked
 */
removeButtonClicked = function(){
    highlightToolbarButton(buttons.remove);
    unHighlightToolbarButton(buttons.sendToBack);
    unHighlightToolbarButton(buttons.plant);
    modes.plant = false;
    modes.orderLayers = false;
    modes.remove = true;  
    mouseStates.cursorFlower = false;
}

/*
 * Resets states after send to back button clicked
 */
sendToBackButtonClicked = function(){
    highlightToolbarButton(buttons.sendToBack);
    unHighlightToolbarButton(buttons.remove);
    unHighlightToolbarButton(buttons.plant);
    modes.plant = false;
    modes.remove = false;
    modes.orderLayers = true; 
    mouseStates.cursorFlower = false;
}

/*
 * Helper function to highlight a given toolbar button
 */
highlightToolbarButton = function(button){
    $(button).animate({
        backgroundColor: colors.toolbarSelectColor
        }, 100
    ); 
}

/*
 * Helper function to unhighlight a given toolbar button
 */
unHighlightToolbarButton = function(button){
     $(button).animate({
        backgroundColor: colors.toolbarColor
        }, 100
    ); 
}

/*
 * Determine whether to delete, send to back, or resize a plant that's been clicked on  * based on current mode
 */
interactWithPlant = function(clickEvent){
    pointClicked = clickEvent.point;
    mouseStates.currentFlower = canvasFlowers[clickEvent.item.id];

    if(modes.remove){
        deleteFlower(event);
    } else if(modes.orderLayers){
       sendFlowerToBack();
    } else {
        mouseStates.resizeOldFlower = true;
    } 
}


/*
 * Drop a plant on the screen
 */
dropFlower = function(clickEvent){
    if(project.view.bounds.contains(clickEvent)){
        var newFlower;
        //all the code that deals with the SVG has to live in the callback function because it's asynchronous (https://groups.google.com/forum/#!searchin/paperjs/svg|sort:relevance/paperjs/ohy3oXUmLPg/G9ehRKhEfVgJ)
        project.importSVG(currentMenuChoice.src, {
            onError: function(message){
                console.log("import error");
            }, 
            onLoad: function(item){
                newFlower = new Plant(null, item.scale(resize.initFlowerSize), new Music(soundSources[currentMenuChoice.name],Math.floor(clickEvent.point.y/(window.innerHeight*.125))), clickEvent.point.x)//null is for the path since Component is path-based, also omitting sound argument for now
                newFlower.playSound();
                mouseStates.currentFlower = newFlower;
                mouseStates.droppedFlower = true;
                mouseStates.currentFlower.img.position = clickEvent.point;
                mouseStates.currentFlower.img.scale(0.3);
                canvasFlowers[mouseStates.currentFlower.img.id] = newFlower;
            }
        });
    } 
}


/*
 * Delete a plant from screen and stop its associated sound
 */
deleteFlower = function(clickEvent){
    canvasFlowers[mouseStates.currentFlower.img.id].stopSound();
    delete canvasFlowers[mouseStates.currentFlower.img.id];
    mouseStates.currentFlower.img.remove();
}

/*
 * Send to back
 */
sendFlowerToBack = function(){
    mouseStates.currentFlower.img.sendToBack();    
}

/*
 * Scale a flower based on whether mouse distance to flower center is increasing or 
 * decreasing
 */
scaleFlower = function(clickEvent){
    change = calculateMouseDirection(clickEvent);
    if(change > 0){
        if(!(mouseStates.currentFlower.img.bounds.width > (project.view.size.width / 2))){
           /*mouseStates.currentFlower.img.scale(resize.grow);*/
            topX = mouseStates.currentFlower.img.bounds.point.x;
            topY = mouseStates.currentFlower.img.bounds.point.y;
            origPoint = mouseStates.currentFlower.img.bounds.point;
            newPoint = clickEvent.point;
            
            rect = new Rectangle(origPoint, newPoint);
            mouseStates.currentFlower.img.fitBounds(rect);
        
            /*mouseStates.currentFlower.img.scale(distanceToFlowerCenter(clickEvent)/10)*/
          canvasFlowers[mouseStates.currentFlower.img.id].toggleVolume(resize.grow);
          
        }
    }
    else if(change < 0){
        //current fix for teeny flowers - should be solved if/when we move to distance-based sizing, but fixing for now
        if(!(mouseStates.currentFlower.img.bounds.width < (project.view.size.width / 20))){
            topX = mouseStates.currentFlower.img.bounds.point.x;
            topY = mouseStates.currentFlower.img.bounds.point.y;
            origPoint = mouseStates.currentFlower.img.bounds.point;
            newPoint = clickEvent.point;
            
            rect = new Rectangle(origPoint, newPoint);
            mouseStates.currentFlower.img.fitBounds(rect);
            /*mouseStates.currentFlower.img.scale(resize.shrink);*/ canvasFlowers[mouseStates.currentFlower.img.id].toggleVolume(resize.shrink)
        }
    }
}

distanceToFlowerCenter = function(dragEvent){
    var flowerCenter = mouseStates.currentFlower.img.position;
    var mousePos = dragEvent.point;
    var dist = pointDistance(mousePos, flowerCenter);
    return(dist);
}

/*
 * Helper function to calculate direction mouse is moving in relation to plant on drag
 */
calculateMouseDirection = function(dragEvent){
    var flowerCenter = mouseStates.currentFlower.img.position;
    var mousePos = dragEvent.point;
    var prevMousePos = dragEvent.lastPoint;
    var prevDist = pointDistance(prevMousePos, flowerCenter);
    var currentDist = pointDistance(mousePos, flowerCenter);
    return(currentDist - prevDist);
}

/*
 * Starts background sound if it's not already started
 */
startBackgroundSound = function(){
    backgroundTrack.play();
    backgroundTrack.loop(true);
    backgroundTrack.volume(0.3);
}

/*
 * Moves the "ghost" flower that tracks with the cursor
 */ 

moveCursorFlower = function(event){
//make it lag less on initial click - kind of a hacky fix for now
    if(event.point.x != 0  && event.point.y != 0){
        cursorFlower.position.x = event.point.x+20;
        cursorFlower.position.y = event.point.y+20;
    }
}

/*
 * Euclidean distance (helper function for calculateMouseDirection)
 */
pointDistance = function(point1, point2){
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point2.x), 2));
    return(distance);
}