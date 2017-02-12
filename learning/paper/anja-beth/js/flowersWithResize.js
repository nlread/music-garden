

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
    
    //need to fill this array with things (flowers)
    var pink = new Raster('pink');
    var orange = new Raster('orange');
    var blue = new Raster('blue');
    var purple = new Raster('purple');
    
    var flowers = [pink, orange, blue, purple];
    
    //position flowers along the left side of the canvas
    xPos = 20
    yPos = 20
    for(var i = 0; i < flowers.length; i++){
        flowers[i].position = new Point(xPos, yPos)
        yPos += 150 //put them in a vertical line
    }

    // Mouse tool state
    var menuChoice = -1;
    var droppedFlower = false;
    var currentFlower;

    myTool.onMouseUp = function(event) {
        //hit test to see if we are on top of a menu flower
        if (flowers.length > 0) {
            for (var ix = 0; ix < flowers.length; ix++) {
                //if you've hit a flower, make the dragging index equal to that flower
                if (flowers[ix].contains(event.point)) {
                    menuChoice = ix;
                    console.log(menuChoice);
                    break;
                }
            }
        }

        //clicked on a menu flower already
        if (menuChoice > -1) {
            currentFlower = flowers[menuChoice].clone()
            currentFlower.scale(0.3)
            currentFlower.position = event.point //NTS: might need to reset currentFlower at some point?
            droppedFlower = true; //flag for the onMouseDrag method for resizing
        }
    };

    function onMouseDrag(event) {
        
       
    };
}

