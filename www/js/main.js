/*Task list:
- currently the first time you click on the menu it drops a flower at the origin, should stop that from happening

Future things to fix
- once you have classes/items, you can add event handlers specifically to them (path.onDrag) instead of having a tool handle all of them, which might make code simpler (altho idk if we can apply it to a whole class of items, we might need an array of all the flowers on the screen or something like that)

*/

paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file

//Declare global constants + variables
var resize = {
    shrink: 0.95,
    grow: 1.05
}

var mouseStates = {
    menuChoice: -1,
    droppedFlower: false,
    currentFlower: null,
    resizeOldFlower: false
};

//this is the flower that tracks with the mouse 
var draggingFlower;
//namespace to be filled in onload with menu choice divs - outside of main function so that they're globally accessible
var menuChoices = {
  
}

var currentMenuChoice;

window.onload = function(){
    //sanity check
    console.log("window loaded");
    setUpScreen(); 
    initializeGlobals();
    
    var menuItems = createFlowersMenu();
    var flowersMenu = menuItems[0]
    var menuRect = menuItems[1]
    
    var myTool = new Tool();
    
    //set current choice to the image of the flower clicked on in the menu
    $('.menuChoice').on('click', function(){
        currentMenuChoice = event.target.src;
        draggingFlower = new Raster(currentMenuChoice).scale(0.1);
        //sweet, putting it at (0, 0) puts it at canvas 0,0 not window 0,0
        //also, it thinks that events that occur off the canvas (i.e. on the menu) occur at (0,0), so the next line always drops flowers at (0,0) - might make mouse tracking tricky
        draggingFlower.position = event.position;
        mouseStates.droppedFlower = false;
    });
    
    myTool.onMouseUp = function(event) {
        stopResize();
    };

    myTool.onMouseDown = function(event){
        //clicked on something -> see if we need to resize an old flower
        if(project.hitTest(event.point)){
            pointClicked = event.point;
           
            if(!(menuRect.contains(pointClicked))){
                mouseStates.currentFlower = new Flower(null,event.item); 
                mouseStates.resizeOldFlower = true;
            }
           
            //return so that you don't drop a new flower on top of one to resize
            //NOTE: this does prevent dropping flowers on top of each other, so if that's a feature we want we'll have to work around it somehow
            return;
        }
        
        if(currentMenuChoice){
            dropFlower(event, flowersMenu);
        }
    }
    
    myTool.onMouseDrag = function(event) {
        if(mouseStates.droppedFlower || mouseStates.resizeOldFlower){
            scaleFlower(event);
        }
    };
}

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

createFlowersMenu = function(){
    //scaling for size since images are large
    //menu flowers are just rasters, not Components, because they don't need to be moved/chanegd
    var pink = new Raster('pink');
    pink.scale(0.05)
    var orange = new Raster('orange');
    orange.scale(0.1)
    var blue = new Raster('blue');
    blue.scale(0.07)
    var purple = new Raster('purple');
    purple.scale(0.1)
    var menu = new Path.Rectangle(new Point(0, 0), new Size(100, 900))
    menu.fillColor = '#c1f4f2';
    menu.sendToBack();
    
    var allFlowersArray = [pink, orange, blue, purple]
    var flowers = positionFlowers(allFlowersArray);
    return([flowers, menu])
}

positionFlowers = function(flowersArray){
    var xPos = 50
    var yPos = 50
    for(var i = 0; i < flowersArray.length; i++){
        flowersArray[i].position = new Point(xPos, yPos);
        yPos += 150;
    }
    return(flowersArray)  ;
}



stopResize = function(){
    if(mouseStates.resizeOldFlower){
        mouseStates.resizeOldFlower = false;
    }
}
  

//drop a clone of a menu flower
dropFlower = function(clickEvent){
    mouseStates.currentFlower = new Flower(null, draggingFlower.clone()) //null is for the path since Component is path-based, also omitting sound argument for now
    mouseStates.currentFlower.img.scale(0.3) //Note: all code with ".img." is so that we can work with the rasters, if we move to path-based this will change
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
        mouseStates.currentFlower.img.scale(resize.grow)
    }
    else if(change < 0){
        mouseStates.currentFlower.img.scale(resize.shrink)

    }
}

//helper function - used to determine whether to increase or decrease flower size
pointDistance = function(point1, point2){
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point2.x), 2));
    
    return(distance);
}