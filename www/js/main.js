paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file

/*DECLARE GLOBAL CONSTANTS AND VARIABLES*/
var resize = {
    initFlowerSize: 0.2,
    shrink: 0.95,
    grow: 1.05
}

var mouseStates = {
    menuChoice: -1,
    menuChoiceClicked: false,
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
var soundSources = {
    "green": "mp3/track1Individuals/Op4 louder.mp3",
    "red": "mp3/track1Individuals/Op3 louder.mp3",
    "jade": "mp3/track1Individuals/Op1 louder.mp3",
    "succulent": "mp3/track1Individuals/Op2 louder.mp3"
};

var colors = {
    menuColor: "#81E5A9",
    menuSelectColor: "#90F0B3",
    toolbarColor: "#aaeec5",
    toolbarSelectColor: "#55dd8b"
};

//Holds all the flower on the canvas at any time
var canvasFlowers = {};

//This track will play while any flower is on the canvas.
var backgroundTrack = new Howl({
    src: ["mp3/track1Individuals/Au1 louder.mp3"]    
});

var backgroundSound = false;

var menuChoices = {}

var buttons = {}

var currentMenuChoice = {
    src: "", //actual image source
    name: "", //flower name - "pink", "blue", etc
    div: "", //div that contains it
}

var cursorFlower = null;

/*ONLOAD*/
window.onload = function(){
    //sanity check
    console.log("window loaded");
    
    setUpScreen(); 
    initializeGlobals();
    
    var myTool = new Tool();
    
    //plant button highlighted by default
    highlightToolbarButton(buttons.plant);
    
    $('.menuChoice').on('click', makeMenuChoice);
    
    $('.menuChoice').on('mouseover', function(){
        choice = this;
        animateMenuChoice(choice);
    });
    
     $('.menuChoice').on('mouseout', function(){
        choice = this;
        unHighlightMenuChoice(choice);
    });
    
    $('#removeButton').on('click', function(){
       removeButtonClicked();
    })
    
    $('#sendToBackButton').on('click', function(){
        sendToBackButtonClicked();
    })

    $('#plantButton').on('click', function(){
        plantButtonClicked();
    })
        
    myTool.onMouseUp = function(event) {
        stopResize();
    };

    myTool.onMouseDown = function(event){
        console.log(currentMenuChoice)
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
    };
    
    myTool.onMouseMove = function(event){
        if(modes.plant && mouseStates.cursorFlower){
            //make it lag less on initial click - kind of a hacky fix for now
            if(event.point.x != 0  && event.point.y != 0){
                cursorFlower.position.x = event.point.x+20;
                cursorFlower.position.y = event.point.y+20;
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
    mouseStates.currentFlower = new Flower(null,clickEvent.item);
    if(modes.remove){
        deleteFlower(event);
    }
    else if(modes.orderLayers){
       sendFlowerToBack();
    }
    else{
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
        //for reference, item is the svg that's imported
        project.importSVG(currentMenuChoice.src, {
            onError: function(message){
                console.log("import error");
            }, 
            onLoad: function(item){ 
                newFlower = new Flower(null, item.scale(resize.initFlowerSize), new Music(soundSources[currentMenuChoice.name]))//null is for the path since Component is path-based, also omitting sound argument for now
                newFlower.playSound();
                mouseStates.currentFlower = newFlower;
                mouseStates.droppedFlower = true;
                mouseStates.currentFlower.img.position = clickEvent.point;
                mouseStates.currentFlower.img.scale(0.3);
                
                canvasFlowers[clickEvent.item.id] = newFlower;
                if(!backgroundSound){
                    backgroundTrack.play();
                    backgroundTrack.loop(true);
                    backgroundSound = true;
                }
            }
        });
    } 
}


/*
 * Delete a plant from screen and stop its associated sound
 */
deleteFlower = function(clickEvent){
    canvasFlowers[clickEvent.item.id].stopSound();
    delete canvasFlowers[clickEvent.item.id];
    mouseStates.currentFlower.img.remove();
    if(Object.keys(canvasFlowers).length == 0){
        backgroundTrack.stop();
        backgroundSound = false;
    }
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
           mouseStates.currentFlower.img.scale(resize.grow)
           //Sound doesn't scale properly, goes away after resizing too many times
           canvasFlowers[mouseStates.currentFlower.img.id].toggleVolume(resize.grow);
        }
    }
    else if(change < 0){
        //current fix for teeny flowers - should be solved if/when we move to distance-based sizing, but fixing for now
        if(!(mouseStates.currentFlower.img.bounds.width < (project.view.size.width / 20))){
            mouseStates.currentFlower.img.scale(resize.shrink);
            //Sound doesn't scale properly, it goes away after resizeing too many times.
            canvasFlowers[mouseStates.currentFlower.img.id].toggleVolume(resize.shrink)
        }
    }
}


/*
 * Helper function to calculate direction mouse is moving in relation to plant on drag
 */
calculateMouseDirection = function(dragEvent){
    flowerCenter = mouseStates.currentFlower.img.position;
    mousePos = dragEvent.point;
    prevMousePos = dragEvent.lastPoint;
    prevDist = pointDistance(prevMousePos, flowerCenter);
    currentDist = pointDistance(mousePos, flowerCenter);
    return(currentDist - prevDist);
}

/*
 * Euclidean distance (helper function for calculateMouseDirection)
 */


pointDistance = function(point1, point2){
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point2.x), 2));
    return(distance);
}