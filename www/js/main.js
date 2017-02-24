

paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file

//DECLARE GLOBAL CONSTANTS AND VARIABLES
var resize = {
    initFlowerSize: 0.1,
    shrink: 0.95,
    grow: 1.05
}

var mouseStates = {
    menuChoice: -1,
    droppedFlower: false,
    currentFlower: null,
    resizeOldFlower: false
};

var imageSources = {
        "img/blueflower.png": "mp3/track1Individuals/Op1.mp3",
        "img/orangeflower.png": "mp3/track1Individuals/Op2.mp3",
        "img/pinkflower.png": "mp3/track1Individuals/Au1.mp3",
        "img/purpleflower.png": "mp3/track1Individuals/Op4.mp3",
};

//this is the flower that will eventually track with the mouse - not currently in use
//var draggingFlower;

//namespace to be filled in onload with menu choice divs - outside of main function so that they're globally accessible
var menuChoices = {}

var currentMenuChoice;

//ONLOAD
window.onload = function(){
    //sanity check
    console.log("window loaded");
    
    setUpScreen(); 
    initializeGlobals();
    
    var myTool = new Tool();
    
    //set current choice to the image of the flower clicked on in the menu
    $('.menuChoice').on('click', function(){
        currentMenuChoice = event.target.src;
        //draggingFlower = new Raster(currentMenuChoice).scale(0.1); - could bring this back later when we want a flower to track with the mouse, but that's going to require more work
        //sweet, putting it at (0, 0) puts it at canvas 0,0 not window 0,0
        //also, it thinks that events that occur off the canvas (i.e. on the menu) occur at (0,0), so the next line always drops flowers at (0,0) - might make mouse tracking tricky
        mouseStates.droppedFlower = false;       
    });
    
    //Menu choice animations
    $('.menuChoice').on('mousedown', function(){
        $(event.target).animate({
            height: "100%",
            width: "100%" 
            }, 100
        );
    });
    
    $('.menuChoice').on('mouseup', function(){
        $(event.target).animate({
            height: "95%",
            width: "95%" 
            }, 100
        );
    });
    
    myTool.onMouseUp = function(event) {
        stopResize();
    };

    myTool.onMouseDown = function(event){
        //clicked on something -> see if we need to resize an old flower
        if(project.hitTest(event.point)){
            pointClicked = event.point;
            mouseStates.currentFlower = new Flower(null,event.item); 
            mouseStates.resizeOldFlower = true;
            //return so that you don't drop a new flower on top of one to resize
            //NOTE: this does prevent dropping flowers on top of each other, so if that's a feature we want we'll have to work around it somehow
            return;
        }
        
        if(currentMenuChoice){
            dropFlower(event);
        }
    }
    
    myTool.onMouseDrag = function(event) {
        if(mouseStates.droppedFlower || mouseStates.resizeOldFlower){
            scaleFlower(event);
        }
    };
}

//HELPER FUNCTIONS
setUpScreen = function(){
    paper.setup('canvas') //create canvas using id
    view.draw(); //helps speed up drawing
    
}

initializeGlobals = function(){
    menuChoices.choice1 = document.getElementById("choice1");
    menuChoices.choice2 = document.getElementById("choice2");
    menuChoices.choice3 = document.getElementById("choice3");
    menuChoices.choice4 = document.getElementById("choice4");
    
}

stopResize = function(){
    if(mouseStates.resizeOldFlower){
        mouseStates.resizeOldFlower = false;
    }
}
  

//drop a clone of a menu flower
dropFlower = function(clickEvent){
    newFlower =  new Flower(null, new Raster(currentMenuChoice).scale(resize.initFlowerSize), new Music(imageSources[currentMenuChoice.substring(23)])) //null is for the path since Component is path-based, also omitting sound argument for now
    //Hacky fix of getting substring fo currentMenuChoice, maybe have currentMenuChoice hold multiple parts.
    //Maybe we should have a way to keep track of the flowers that are in the canvas?
    newFlower.playSound();
    mouseStates.currentFlower = newFlower
    mouseStates.currentFlower.img.scale(0.3) //Note: all code with ".img." is so that we can work with the rasters, if we move to path or vector-based this will change
    mouseStates.currentFlower.img.position = clickEvent.point
    mouseStates.droppedFlower = true;
        
}

//scale a flower based on whether mouse distance to flower center is increasing or decreasing
scaleFlower = function(clickEvent){
    flowerCenter = mouseStates.currentFlower.img.position;
    mousePos = clickEvent.point;
    prevMousePos = clickEvent.lastPoint;
    prevDist = pointDistance(prevMousePos, flowerCenter);
    currentDist = pointDistance(mousePos, flowerCenter);
    change = currentDist - prevDist

    if(change > 0){
        if(!(mouseStates.currentFlower.img.bounds.width > (project.view.size.width / 2))){
           mouseStates.currentFlower.img.scale(resize.grow)
           //mouseStates.currentFlower.img.togleVolume(1.5);
        }
    }
    else if(change < 0){
        mouseStates.currentFlower.img.scale(resize.shrink)
        //mouseStates.currentFlower.img.togleVolume(.5);
    }
}

//helper function - used to determine whether to increase or decrease flower size
pointDistance = function(point1, point2){
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point2.x), 2));
    
    return(distance);
}