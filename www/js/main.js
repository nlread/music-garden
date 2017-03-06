paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file

//DECLARE GLOBAL CONSTANTS AND VARIABLES
var resize = {
    initFlowerSize: 0.2,
    shrink: 0.95,
    grow: 1.05
}

var mouseStates = {
    menuChoice: -1,
    droppedFlower: false,
    currentFlower: null,
    resizeOldFlower: false,
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

//namespace to be filled in onload with menu choice divs
var menuChoices = {}

var buttons = {}

var currentMenuChoice = {
    src: "", //actual image source
    name: "" //flower name - "pink", "blue", etc
}

//ONLOAD
window.onload = function(){
    //sanity check
    console.log("window loaded");
    
    setUpScreen(); 
    initializeGlobals();
    
    var myTool = new Tool();
    
    //plant button highlighted by default
    highlightToolbarButton(buttons.plant)
    
    $('.menuChoice').on('click', makeMenuChoice);
    
    $('#removeButton').on('click', function(){
        highlightToolbarButton(buttons.remove);
        unHighlightToolbarButton(buttons.sendToBack);
        unHighlightToolbarButton(buttons.plant);
        modes.plant = false;
        modes.orderLayers = false;
        modes.remove = true;
    })
    
    $('#sendToBackButton').on('click', function(){
        highlightToolbarButton(buttons.sendToBack);
        unHighlightToolbarButton(buttons.remove);
        unHighlightToolbarButton(buttons.plant);
        modes.plant = false;
        modes.remove = false;
        modes.orderLayers = true; 
    })

      $('#plantButton').on('click', function(){
        highlightToolbarButton(buttons.plant);
        unHighlightToolbarButton(buttons.remove);
        unHighlightToolbarButton(buttons.sendToBack);
        modes.remove = false;
        modes.orderLayers = false; 
        modes.plant = true;
    })
        
    myTool.onMouseUp = function(event) {
        stopResize();
    };

    myTool.onMouseDown = function(event){
        
        if(project.hitTest(event.point)){
            pointClicked = event.point;
            mouseStates.currentFlower = new Flower(null,event.item);
            if(modes.remove){
                deleteFlower(event);
            }
            else if(modes.orderLayers){
               sendFlowerToBack();
            }
            else{
                mouseStates.resizeOldFlower = true;
            }
        
            //return so that you don't drop a new flower on top of one to resize
            //NOTE: this does prevent dropping flowers on top of each other, so if that's a feature we want we'll have to work around it somehow
            return;
        }
        
        if(currentMenuChoice && modes.plant){
            dropFlower(event);
        }
    }
    
    myTool.onMouseDrag = function(event) {
        if(modes.plant){
            scaleFlower(event);
        }
    };
}

//HELPER FUNCTIONS
setUpScreen = function(){
    paper.setup('canvas')
    view.draw(); 
    
}

initializeGlobals = function(){
    menuChoices.choice1 = document.getElementById("choice1");
    menuChoices.choice2 = document.getElementById("choice2");
    menuChoices.choice3 = document.getElementById("choice3");
    menuChoices.choice4 = document.getElementById("choice4");
    
    buttons.remove = document.getElementById("removeButton");
    buttons.plant = document.getElementById("plantButton");
    buttons.sendToBack = document.getElementById("sendToBackButton");
    
}

stopResize = function(){
    if(mouseStates.resizeOldFlower){
        mouseStates.resizeOldFlower = false;
    }
}
  
makeMenuChoice = function(){
    animateMenuChoice();
    currentMenuChoice.src = event.target.src;
    //NOTE: the below relies on images being named _____flower, which will probably change later
    currentMenuChoice.name = event.target.src.match(/\/(\w+)flower/)[1]
    mouseStates.droppedFlower = false;       
    
}

animateMenuChoice = function(){
    //shrink old menu choice but first make sure it's not null
    if(currentMenuChoice.src){
        //regex relies on current image naming scheme of ___flower.png
        oldMenuChoice = document.getElementById(currentMenuChoice.src.match(/\/(\w+)flower/)[1])
        $(oldMenuChoice).animate({
        height: "95%",
        width: "95%" 
        }, 100
        );

        //unhighlight color
        $(oldMenuChoice.parentElement).animate({
        backgroundColor: colors.menuColor
        }, 100
    );
    }

    //increase size of new menu choice
    $(event.target).animate({
        height: "100%",
        width: "100%"
        }, 100
    );

    //highlight color
    $(event.target.parentElement).animate({
        backgroundColor: colors.menuSelectColor
        }, 100
    );  
}

highlightToolbarButton = function(button){
    $(button).animate({
        backgroundColor: colors.toolbarSelectColor
        }, 100
    ); 
}

unHighlightToolbarButton = function(button){
     $(button).animate({
        backgroundColor: colors.toolbarColor
        }, 100
    ); 
}

//drop a clone of a menu flower
dropFlower = function(clickEvent){
    if(project.view.bounds.contains(clickEvent)){
        var newFlower;
        //all the code that deals with the SVG has to live in the callback function because it's asynchronous (https://groups.google.com/forum/#!searchin/paperjs/svg|sort:relevance/paperjs/ohy3oXUmLPg/G9ehRKhEfVgJ)
        //for reference, item is the svg that's imported
        project.importSVG(currentMenuChoice.src, 
            {onError: console.log("error"), 
            onLoad: function(item){
            console.log(item)
            newFlower = new Flower(null, item.scale(resize.initFlowerSize), new Music(soundSources[currentMenuChoice.name]))//null is for the path since Component is path-based, also omitting sound argument for now
            
            newFlower.playSound();
            mouseStates.currentFlower = newFlower
            mouseStates.currentFlower.img.scale(0.3)
            mouseStates.currentFlower.img.position = clickEvent.point
            mouseStates.droppedFlower = true;
            canvasFlowers[clickEvent.item.id] = newFlower;
            if(!backgroundSound){
                backgroundTrack.play();
                backgroundTrack.loop(true);
                backgroundSound = true;
            }
        }});
    } 
}

deleteFlower = function(clickEvent){
    canvasFlowers[clickEvent.item.id].stopSound();
    delete canvasFlowers[clickEvent.item.id];
    mouseStates.currentFlower.img.remove();
    if(Object.keys(canvasFlowers).length == 0){
        backgroundTrack.stop();
        backgroundSound = false;
    }
}

sendFlowerToBack = function(){
    mouseStates.currentFlower.img.sendToBack();    
}

//scale a flower based on whether mouse distance to flower center is increasing or decreasing
scaleFlower = function(clickEvent){
    console.log(clickEvent);
    flowerCenter = mouseStates.currentFlower.img.position;
    mousePos = clickEvent.point;
    prevMousePos = clickEvent.lastPoint;
    prevDist = pointDistance(prevMousePos, flowerCenter);
    currentDist = pointDistance(mousePos, flowerCenter);
    change = currentDist - prevDist

    if(change > 0){
        if(!(mouseStates.currentFlower.img.bounds.width > (project.view.size.width / 2))){
           mouseStates.currentFlower.img.scale(resize.grow)
           //Sound doesn't scale properly, it goes away after resizeing too many times.
           //canvasFlowers[clickEvent.item.id].toggleVolume(resize.grow);
        }
    }
    else if(change < 0){
        //current fix for teeny flowers - should be solved if/when we move to distance-based sizing, but fixing for now
        if(!(mouseStates.currentFlower.img.bounds.width < (project.view.size.width / 20))){
            mouseStates.currentFlower.img.scale(resize.shrink)
            //Sound doesn't scale properly, it goes away after resizeing too many times.
            //canvasFlowers[clickEvent.item.id].toggleVolume(resize.shrink);
        }
    }
}

//helper function - used to determine whether to increase or decrease flower size
pointDistance = function(point1, point2){
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point2.x), 2));
    return(distance);
}