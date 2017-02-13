/*
Current problems:

Future things to fix
- you can drop flowers on top of the menu, I should probably bound where you're allowed to drop them
- probably should use higher-res flower images in the images dir and then just scale them when I create the rasters - better image quality when they're enlarged via dragging
- you can't make anything smaller
- limit how big you can make the flowers?
- look into let vs var
*/

paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file

//run after window has loaded
window.onload = function(){
    //sanity check
    console.log("window loaded");
    
    //create canvas first using id
    paper.setup('canvas')
    
    view.draw(); //helps speed up drawing
    
    var myTool = new Tool();
    

    
    //drag and drop code adapted from here http://stackoverflow.com/questions/16876253/paperjs-drag-and-drop-circle
    
    //Menu flower options w/ scaling for size
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
    
    var flowers = [pink, orange, blue, purple];
    
    //position flowers along the left side of the canvas
    var xPos = 50
    var yPos = 50
    for(var i = 0; i < flowers.length; i++){
        flowers[i].position = new Point(xPos, yPos)
        yPos += 150 //put them in a vertical line
    }
    
    //Flower scaling constant - determined via experimentation
    var FLOWER_RESIZE = 1.05

    // Mouse tool state
    var menuChoice = -1;
    var droppedFlower = false;
    var currentFlower;
    var resizeOldFlower = false;
    
   

    myTool.onMouseUp = function(event) {
        //hit test to see if we are on top of a menu flower
        if (flowers.length > 0) {
            for (var ix = 0; ix < flowers.length; ix++) {
                //if you've hit a flower, make the dragging index equal to that flower
                if (flowers[ix].contains(event.point)) {
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
            //currentFlower is the clicked one so that MouseDrag has access to it
            currentFlower = project.hitTest(event.point).item;
            resizeOldFlower = true;
            //return so that you don't drop a new flower on top of one to resize
            //NOTE: this does prevent dropping flowers on top of each other, so if that's a feature we want we'll have to work around it somehow
            return;
        }
        
        //clicked on a menu flower already
        if (menuChoice > -1) {
            //clone and drop a flower at event point
            currentFlower = flowers[menuChoice].clone()
            currentFlower.scale(0.3)
            currentFlower.position = event.point //NTS: might need to reset currentFlower at some point?
            droppedFlower = true; //flag for the onMouseDrag method for resizing
        }
        
    }
    myTool.onMouseDrag = function(event) {
        //we've just dropped a flower, now to resize it
        if(droppedFlower || resizeOldFlower){
            //might need to do this later by seeing which DOM element we're on top of and resizing that, but that has its own problems, so going to do it w/ currentFlower for now
            currentFlower.scale(FLOWER_RESIZE)
        }
       
    };
}

