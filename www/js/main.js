/*Task list:
- limit how big you can make the flowers
- make it so flowers can't overlap the menu (limit resizing)


Future things to fix
- make flowers scale based on actual mouse distance, not just estimated constants
- look into let vs var
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



window.onload = function(){
    //sanity check
    console.log("window loaded");
    
    setUpScreen(); 
    
    var menuItems = createFlowersMenu();
    var flowersMenu = menuItems[0]
    var menuRect = menuItems[1]
    
    var myTool = new Tool();
    

    myTool.onMouseUp = function(event) {
        
        getMenuChoice(event, flowersMenu);
       
        stopResize();
    };

    myTool.onMouseDown = function(event){
        //clicked on something -> see if we need to resize an old flower
        if(project.hitTest(event.point)){
            pointClicked = event.point;
           
            if(!(menuRect.contains(pointClicked))){
                mouseStates.currentFlower = new Flower(null,event.item); //Note: not sure if this will work - will it create a new object or keep the pointer to the old one?
                mouseStates.resizeOldFlower = true;
            }
           
            //return so that you don't drop a new flower on top of one to resize
            //NOTE: this does prevent dropping flowers on top of each other, so if that's a feature we want we'll have to work around it somehow
            return;
        }
        
        //clicked on a menu flower already
        if (mouseStates.menuChoice > -1) {
            //clone and drop a flower at event point
            mouseStates.currentFlower = new Flower(null, flowersMenu[mouseStates.menuChoice].clone()) //null is for the path since Component is path-based, also omitting sound argument for now
            mouseStates.currentFlower.img.scale(0.3) //Note: all code with ".img." is so that we can work with the rasters, if we move to path-based this will change
            mouseStates.currentFlower.img.position = event.point 
            mouseStates.droppedFlower = true; //flag for the onMouseDrag method for resizing
        }
        
    }
    
    myTool.onMouseDrag = function(event) {
        //we've just dropped a flower, now to resize it
        if(mouseStates.droppedFlower || mouseStates.resizeOldFlower){
            flowerCenter = mouseStates.currentFlower.img.position;
            mousePos = event.point;
            prevMousePos = event.lastPoint;
            prevDist = pointDistance(prevMousePos, flowerCenter);
            currentDist = pointDistance(mousePos, flowerCenter);
            change = currentDist - prevDist
            
            //scale values currently determined via experimentation, still need to figure out how to actually do it based on the mouse position
            if(change > 0){
                mouseStates.currentFlower.img.scale(resize.grow)
            }
            else if(change < 0){
                mouseStates.currentFlower.img.scale(resize.shrink)
                
            }
        }
    };
}

setUpScreen = function(){
    paper.setup('canvas') //create canvas using id
    view.draw(); //helps speed up drawing
    
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

//Figures out which menu flower user clicked on
getMenuChoice = function(clickEvent, flowersMenu){
    if (flowersMenu.length > 0) {
            for (var ix = 0; ix < flowersMenu.length; ix++) {
                if (flowersMenu[ix].contains(clickEvent.point)) {
                    mouseStates.menuChoice = ix;
                    mouseStates.droppedFlower = false; 
                    break;
                }
            }
        }
}

stopResize = function(){
    if(mouseStates.resizeOldFlower){
        mouseStates.resizeOldFlower = false;
    }
}
  
//helper function - used to determine whether to increase or decrease flower size
pointDistance = function(point1, point2){
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point2.x), 2));
    
    return(distance);
}