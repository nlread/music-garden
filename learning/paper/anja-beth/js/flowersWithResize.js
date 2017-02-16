/*
Task list:
- make it so you can make flowers smaller! (this involved figuring out how to scale based on event.delta, not just my approximation)
- making it smaller is a lot more complicated - how do you decide when the user is trying to make it smaller vs. larger? it's probably based on whether they're moving towards or away from the image center, right? how do we figure that out?
- make it so you can't resize menu flowers!


Future things to fix
- limit how big you can make the flowers
- make it so flowers can't overlap the menu (limit resizing)
- look into let vs var
- classes(?) for menu, flowers on flower menu, flowers dropped
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
        //clicked on a cloned flower -> set flag to resize
        if(project.hitTest(event.point)){
            pointClicked = project.hitTest(event.point).point;
            //TO FIX: you can resize menu flowers. I know how to fix this with a for loop (just check if itemClic, but that's a really inelegant way to do it right here, so I'm leaving the bug for now and fixing it when we refactor
            if(!menuRect.contains(pointClicked)){
                //currentFlower is the clicked one so that MouseDrag has access to it - this line must not be working
                currentFlower = project.hitTest(event.point).item;
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
            currentFlower.position = event.point //NTS: might need to reset currentFlower at some point?
            droppedFlower = true; //flag for the onMouseDrag method for resizing
        }
        
    }
    
    myTool.onMouseDrag = function(event) {
        //we've just dropped a flower, now to resize it
        if(droppedFlower || resizeOldFlower){
            console.log(event.deltaf)
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
    
    /*note to self - might need to return menu at some point so we have access to it, can javascript return two things? or can we attach them somehow? make the menu the parent? */
    
    var allFlowersArray = [pink, orange, blue, purple]
    var flowers = positionFlowers(allFlowersArray);
    return([flowers, menu])
}

positionFlowers = function(flowersArray){
    //position flowers along the left side of the canvas
    var xPos = 50
    var yPos = 50
    for(var i = 0; i < flowersArray.length; i++){
        flowersArray[i].position = new Point(xPos, yPos)
        yPos += 150 //put them in a vertical line
    }
    return(flowersArray)  
}
