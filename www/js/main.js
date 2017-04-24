paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file

/* ONLOAD */

$(document).ready(function(){
    $('body').chardinJs('start');
});

window.onload = function(){
    console.log("window loaded");
    
    setUpScreen(); 
    initializeGlobals();
    startBackgroundSound();
    
    var myTool = new Tool();
    
    //plant button highlighted by default
    $(buttons.plant).trigger("click");
   
    $('.menuChoice').on('click', makeMenuChoice);

    $('.menuChoice').on('mouseenter', function(){
        choice = this;
        $(this).stop(); //prevent double-bounce
        menuAnims.animateMenuChoice(choice);
    });

     $('.menuChoice').on('mouseleave', function(){
        choice = this;
        menuAnims.unHighlightMenuChoice(choice);
    });

    $('#removeButton').on('click', removeButtonClicked);

    $('#sendToBackButton').on('click', sendToBackButtonClicked);

    $('#plantButton').on('click', plantButtonClicked);
    
    $("#helpButton").on('click', helpButtonClicked);
    
    $("#trashButton").on("click", trashButtonClicked);
        
    myTool.onMouseUp = function(event) {
        stopResize();
    };

    myTool.onMouseDown = function(event){
        hitOptions = {
            match: function(result){
                if(result.item == screenItems.cursorFlower){
                    return false;
                }
                if(result.item == arrows){
                    return false;
                }
                else{
                    return true;
                }
            }
        }
        var itemHit;
        var hit = project.hitTest(event.point, hitOptions)
        if(hit){
            itemHit = hit.item
        }
        
        if(itemHit){
            interactWithPlant(itemHit);
            //return so that you don't drop a new flower on top of one to resize
            return;
            
        } 
       if(currentMenuChoice && interactionModes.plant){
            dropFlower(event);
        }
    }
    
    myTool.onMouseDrag = function(event) { 
        if(interactionModes.plant && (appStates.droppedFlower || appStates.resizeOldFlower)){
            scaleFlower(event);
        }
    }
    myTool.onMouseMove = function(event){
        if(interactionModes.plant && appStates.cursorFlower){
            moveCursorFlower(event);
        }
    }

    paper.view.onFrame = globalOnFrame;
}

function globalOnFrame(frameEvent) {
    let dTime = frameEvent.delta;
    
    for(let key in canvasFlowers){
        if (canvasFlowers.hasOwnProperty(key)) {
            let flower = canvasFlowers[key];
            if (flower instanceof AnimatedComponent) {
                flower.update(dTime);
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
    var canvas = document.getElementById('canvas');
    view.draw();  
}

/*
 * Initializes global namespaces that we don't have access to until onload() but need 
 * globally
 */
initializeGlobals = function(){
    buttons.remove = document.getElementById("removeButton");
    buttons.plant = document.getElementById("plantButton");
    buttons.sendToBack = document.getElementById("sendToBackButton");
    buttons.help = document.getElementById("helpButton");  
}

/*
 * Stops resizing plant + resets droppedFlower
 */
stopResize = function(){
    if(appStates.resizeOldFlower){
        appStates.resizeOldFlower = false;
    }
    if(appStates.droppedFlower){
        appStates.droppedFlower = false;
    }
}

/*
 * Switches current flower being dropped and resets state variables
 * @param {event} menuItemClicked - flower selected from menu
 */
makeMenuChoice = function(menuItemClicked){
    menuAnims.animateMenuChoice(this);
    
    plantButtonClicked();
    
    currentMenuChoice.src = this.firstChild.src;
    currentMenuChoice.name = this.firstChild.id;
    
    appStates.droppedFlower = false;
    
    appStates.cursorFlower = true;
    resetCursorFlower();
}


/*
 * Resets states after plant button clicked
 */
plantButtonClicked = function(){
    interactionModes.remove = false;
    interactionModes.orderLayers = false; 
    interactionModes.plant = true;
    resetCursorFlower();
}

/*
 * Resets states after remove button clicked
 */
removeButtonClicked = function(){
    interactionModes.plant = false;
    interactionModes.orderLayers = false;
    interactionModes.remove = true;  
    appStates.cursorFlower = false;
    screenItems.cursorFlower.remove();
}

/*
 * Resets states after send to back button clicked
 */
sendToBackButtonClicked = function(){
    interactionModes.plant = false;
    interactionModes.remove = false;
    interactionModes.orderLayers = true; 
    appStates.cursorFlower = false;
    screenItems.cursorFlower.remove();
}

/*
 * Brings tutorial back up when help button is clicked
 */
helpButtonClicked = function(){
    $('body').chardinJs('start');
}

/*
 * Dialog box to confirm deletion of all flowers
 */
trashButtonClicked = function(){
    var trash = confirm("Are you sure you want to delete all flowers?");
    if (trash) {
        deleteAllFlowers();
    }
}


/*
 * Determine whether to delete, send to back, or resize a plant that's been clicked on  * based on current mode
 * @param {event} clickEvent - event passed in from onMouseDown handler
 */
interactWithPlant = function(plantClicked){
    appStates.currentFlower = canvasFlowers[plantClicked.id];
    appStates.flowerCenter = appStates.currentFlower.img.position;

    if(interactionModes.remove){
        deleteFlower();
    } /*else if(interactionModes.orderLayers){
       sendFlowerToBack();
    }*/ else {
        appStates.resizeOldFlower = true;
    } 
}


/*
 * Drop a plant on the screen
 * @param {event} clickEvent - click event passed from onMouseDown
 */
dropFlower = function(clickEvent){
    if(project.view.bounds.contains(clickEvent)){
        var newFlower = new Plant(
            new Raster(currentMenuChoice.src).scale(resize.initFlowerSize), 
            new Music(soundSources[currentMenuChoice.name],
            Math.floor((clickEvent.point.y*8)/canvas.height))
        )
        
        newFlower.playSound();
        
        appStates.currentFlower = newFlower;
        appStates.droppedFlower = true;
        appStates.currentFlower.img.position = clickEvent.point;
        appStates.flowerCenter = appStates.currentFlower.img.position;
        appStates.currentFlower.img.scale(1.5);
        
        newFlower.music.sound.on('play', function() {
     
            
//            Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
            newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
            newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));
            
//            Animation 2: Does a little spin thing. Kinda fun. 
//            newFlower.animate(new RotatingAnimation(-15,0.1,0));
//            newFlower.animate(new RotatingAnimation(30,0.1,0.1));
//            newFlower.animate(new RotatingAnimation(-15,0.1,0.2));
        });
        
        newFlower.music.sound.on('play', function() {
       
//            
//        //Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
            //test flower
          // newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.2,-1));
           //newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1.1,0.1));
            //Red flower
      //     newFlower.animate(new ScalingAnimation(new Point(1/1.3,1.3),0.8,0));
      //     newFlower.animate(new ScalingAnimation(new Point(1.3,1/1.3),1.2,0));
            
//            Animation 2: Does a little spin thing. Kinda fun. 
         //   newFlower.animate(new RotatingAnimation(-30,0.1,0));
         //   newFlower.animate(new RotatingAnimation(15,0.1,0.1));
         //   newFlower.animate(new RotatingAnimation(-5,0.1,0.2));
         //   newFlower.animate(new RotatingAnimation(5,0.1,0.3));
            
        });
        
        canvasFlowers[appStates.currentFlower.img.id] = newFlower;
    } 
}


/*
 * Delete a plant from screen and stop its associated sound
 */
deleteFlower = function(){
    canvasFlowers[appStates.currentFlower.img.id].stopSound();
    delete canvasFlowers[appStates.currentFlower.img.id];
    appStates.currentFlower.img.remove();
}

/*
 * Deetes all flowers on screen
 */
deleteAllFlowers = function(){
    for(var flower in canvasFlowers){
        canvasFlowers[flower].stopSound();
        canvasFlowers[flower].img.remove();
    }
    
    canvasFlowers = {}
}

/*
 * Send to back - not currently used
 */
sendFlowerToBack = function(){
    appStates.currentFlower.img.sendToBack();    
}

/*
 * Scale a flower based on whether mouse distance to flower center is increasing or 
 * decreasing
 * @param {event} clickEvent - event passed from onMouseDrag
 */
scaleFlower = function(clickEvent){
    //make sure old flowers don't jump to a smaller size if user drags in the middle of the
    if(clickEvent.count > 10){
        
        //math that creates a square around the center of the flower. Side length of the square is 2*sqrt(x distance of mouse to flower center^2 + y distance of mouse to  flower center^2)
        var flowerCenter = appStates.flowerCenter
        var mousePos = clickEvent.point;
        
        var xDist = Math.abs(flowerCenter.x - mousePos.x);
        var yDist = Math.abs(flowerCenter.y - mousePos.y);
        
        var maxDist = Math.hypot(xDist, yDist);
        var squareDiagLength = 2 * maxDist;
        var squareSideLength = squareDiagLength/(Math.sqrt(2))
        
        var halfSideLength = 0.5 * squareSideLength
        var newULx = flowerCenter.x - halfSideLength;
        var newULy = flowerCenter.y - halfSideLength;
        var newUpperLeft = new Point(newULx, newULy);
        
        //make sure old flowers don't get super small if users drag inside of them
        if(appStates.resizeOldFlower){
            if(squareSideLength < appStates.currentFlower.img.bounds.width && clickEvent.count < 5){
                return;
            }
        }

        //make sure flower is not going to be larger than 1/2 view width or smaller than 1/20 view width. If so, resize to fit bounds
        if(squareSideLength < 0.5*project.view.bounds.width && squareSideLength > 0.05*project.view.bounds.width){
            //resize image
            var rect = new Rectangle(newUpperLeft, new Size(squareSideLength, squareSideLength)); 
            appStates.currentFlower.img.fitBounds(rect);
            
            //handle loop length
          //uncomment when our animations are working. 
            //canvasFlowers[appStates.currentFlower.img.id].toggleSoundLength((squareDiagLength*5)/(canvas.width/2));

          
        }
    }
    
}

/*
 * Helper function used by scaleFlower to determine the distance from the mouse to the flower center
 * @param {event} dragEvent - the mouse drag event passed from scaleFlower
 */
distanceToFlowerCenter = function(dragEvent){
    var flowerCenter = appStates.currentFlower.img.position;
    var mousePos = dragEvent.point;
    var dist = pointDistance(mousePos, flowerCenter);
    return(dist);
}

/*
 * Starts background sound if it's not already started
 */
startBackgroundSound = function(){
    backgroundTrack.play();
    backgroundTrack.loop(true);
    backgroundTrack.volume(0.3);
}

/*
 * Create the "ghost" flower that tracks with the cursor
 */
createCursorFlower = function(){
    screenItems.cursorFlower = new Raster(currentMenuChoice.src).scale(0.07)
    screenItems.cursorFlower.opacity = 0.4 
    screenItems.cursorFlower.visible = false;
}

/*
 * Move the "ghost" flower that tracks with the cursor
 * @param{event} event - the mouseMouve event
 */ 

moveCursorFlower = function(event){
//make it lag less on initial click
    if(event.point.x > 0  && event.point.y > 0){
        screenItems.cursorFlower.visible = true;
        screenItems.cursorFlower.position.x = event.point.x;
        screenItems.cursorFlower.position.y = event.point.y;
    }
}

resetCursorFlower = function(){
    if(screenItems.cursorFlower){
        screenItems.cursorFlower.remove()
    }
    createCursorFlower();
}

/*
 * Euclidean distance 
 */
pointDistance = function(point1, point2){
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
    return(distance);
}