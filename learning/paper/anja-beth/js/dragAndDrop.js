/* Drag and drop flowers with cloning - abandoned the drag-and-drop mechanism because it made resizing awkward from a UX perspective, but keeping the code so I can come back to it if necessary */

/*Current problems w/ this file:
- cloning always clones the first menu flower clicked, even on subsequent clicks
- subsequent clicks erase the previously-dropped cloned flower (there's only ever one at a time)
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
    var draggingIndex = -1;
    var createdClone = false;
    var currentFlower;

    myTool.onMouseDrag = function(event) {
        //hit test to see if we are on top of a menu flower
        if (flowers.length > 0) {
            for (var ix = 0; ix < flowers.length; ix++) {
                //if you've hit a flower, make the dragging index equal to that flower
                if (flowers[ix].contains(event.point)) {
                    draggingIndex = ix;
                    break;
                }
            }
        }

        //clicked on a menu flower
        if (draggingIndex > -1) {
            //check if we already cloned it so that we don't get a million of them. if not, create a clone
            if(!createdClone){
                currentFlower = flowers[draggingIndex].clone()
                currentFlower.scale(0.5)
                createdClone = true;
            }
            currentFlower.position = event.point; //BTS will need to reset this later to prevent moving the wrong things
        } else {
            //need to handle case where we haven't hit flower - do we need to do anything here?
             
        }
    };

    function onMouseUp(event) {
        //here need to drop flower at event point
       
        // Reset the tool state
        draggingIndex = -1;
    };
}

