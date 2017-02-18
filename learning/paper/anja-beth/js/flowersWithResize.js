/*
Task list:
- limit how big you can make the flowers
- make it so flowers can't overlap the menu (limit resizing)


Future things to fix
- make flowers scale based on actual mouse distance, not just estimated constants
- look into let vs var
- classes(?) for menu, flowers on flower menu, flowers dropped
- once you have classes/items, you can add event handlers specifically to them (path.onDrag) instead of having a tool handle all of them, which might make code simpler (altho idk if we can apply it to a whole class of items, we might need an array of all the flowers on the screen or something like that)
*/

paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file

window.onload = function(){
    //sanity check
    console.log("window loaded");
     //create canvas first using id
    setUpScreen();
    menuItems = createFlowersMenu();
    flowersMenu = menuItems[0]
    menuRect = menuItems[1]
    
    var myTool = new Tool();
    
    //Flower scaling constant - determined via experimentation
    var FLOWER_RESIZE = 1.05

    // Mouse tool state
    var menuChoice = -1;
    var droppedFlower = false;
    var currentFlower;
    var resizeOldFlower = false;

    myTool.onMouseUp = function(event) {
        //hit test to see if we are on top of a menu flower
        if (flowersMenu.length > 0) {
            for (var ix = 0; ix < flowersMenu.length; ix++) {
                //if you've hit a flower, make the dragging index equal to that flower
                if (flowersMenu[ix].contains(event.point)) {
                    menuChoice = ix;
                    droppedFlower = false; //we're now about to drop a flower, done dealing with the old one
                    break;
                }
            }
        }
        
        //stop resizing after drag
        if(resizeOldFlower){
            resizeOldFlower = false;
        }
        
    };

    myTool.onMouseDown = function(event){
        //clicked on something -> see if we need to resize an old flower
        if(project.hitTest(event.point)){
            
            pointClicked = event.point;
           
            if(!(menuRect.contains(pointClicked))){
                currentFlower = event.item;
                resizeOldFlower = true;
            }
           
            //return so that you don't drop a new flower on top of one to resize
            //NOTE: this does prevent dropping flowers on top of each other, so if that's a feature we want we'll have to work around it somehow
            return;
        }
        
        //clicked on a menu flower already
        if (menuChoice > -1) {
            //clone and drop a flower at event point
            currentFlower = flowersMenu[menuChoice].clone()
            currentFlower.scale(0.3)
            currentFlower.position = event.point 
            droppedFlower = true; //flag for the onMouseDrag method for resizing
        }
        
    }
    
    myTool.onMouseDrag = function(event) {
        //we've just dropped a flower, now to resize it
        if(droppedFlower || resizeOldFlower){
            
            //determine whether distance from center of flower is increasing or decreasing in order to decide whether to make it larger or smaller
            flowerCenter = currentFlower.position;
            mousePos = event.point;
            prevMousePos = event.lastPoint;
            prevDist = pointDistance(prevMousePos, flowerCenter);
            currentDist = pointDistance(mousePos, flowerCenter);
            change = currentDist - prevDist
            
            //scale values currently determined via experimentation, still need to figure out how to actually do it based on the mouse position
            if(change > 0){
                currentFlower.scale(1.05)
            }
            else if(change < 0){
                currentFlower.scale(0.78)
                
            }
            //not sure how to check the distance on successive iterations - can I save it between calls to this function?

            currentFlower.scale(FLOWER_RESIZE);
        }
    };
}

setUpScreen = function(){
    paper.setup('canvas') //create canvas using id
    view.draw(); //helps speed up drawing
}

createFlowersMenu = function(){
    //scaling for size since images are large
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
    return([flowers, menu]) //we need access to both for choosing flowers and making sure we can't drop flowers on menu
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

//helper function - used to determine whether to increase or decrease flower size
pointDistance = function(point1, point2){
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point2.x), 2));
    
    return(distance);
}