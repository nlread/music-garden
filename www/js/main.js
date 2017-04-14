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
        //prevent double-bounce
        $(this).stop();
        animateMenuChoice(choice);
    });

     $('.menuChoice').on('mouseleave', function(){
        choice = this;
        unHighlightMenuChoice(choice);
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
        var itemHit = project.hitTest(event.point).item;
        
        //ignore hits on cursor Flower
        if(itemHit == cursorFlower){
            itemHit = null;
        }
        
        if(itemHit){
            interactWithPlant(event);
            //return so that you don't drop a new flower on top of one to resize
            return;
            
        } 
       if(currentMenuChoice && modes.plant){
            dropFlower(event);
        }
    }
    
    myTool.onMouseDrag = function(event) { 
        if(modes.plant && (mouseStates.droppedFlower || mouseStates.resizeOldFlower)){
            scaleFlower(event);
        }
        
    }
    myTool.onMouseMove = function(event){
        if(modes.plant && mouseStates.cursorFlower){
            moveCursorFlower(event);
        }
        
        //change opacity of flower that is moused over
        if(modes.remove && project.hitTest(event.point)){
            var itemHit = project.hitTest(event.point);
            if(itemHit != cursorFlower){
                itemHit.item.opacity = 0.5;
                mouseStates.transparentFlower = itemHit.item;
            }
        }
        
        //change it back once hit test no longer applies
        else if(modes.remove){
            if(mouseStates.transparentFlower){
                mouseStates.transparentFlower.opacity = 1;
            }
            
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
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    view.draw();  
}

/*
 * Initializes global namespaces that we don't have access to until onload() but need 
 * globally
 */
initializeGlobals = function(){
    menuChoices.choice1 = document.getElementById("choice1");
    menuChoices.choice2 = document.getElementById("choice2");
    menuChoices.choice3 = document.getElementById("choice3");
    menuChoices.choice4 = document.getElementById("choice4");
    
    buttons.remove = document.getElementById("removeButton");
    buttons.plant = document.getElementById("plantButton");
    buttons.sendToBack = document.getElementById("sendToBackButton");
    buttons.help = document.getElementById("helpButton");
    
}

/*
 * Stops resizing plant + resets droppedFlower
 */
stopResize = function(){
    if(mouseStates.resizeOldFlower){
        mouseStates.resizeOldFlower = false;
    }
    if(mouseStates.droppedFlower){
        mouseStates.droppedFlower = false;
    }
}

/*
 * Switches current flower being dropped and resets state variables
 * @param {event} menuItemClicked - flower selected from menu
 */
makeMenuChoice = function(menuItemClicked){
    animateMenuChoice(this);
    plantButtonClicked();
    currentMenuChoice.src = this.firstChild.src;
    currentMenuChoice.name = this.firstChild.id;
    mouseStates.droppedFlower = false;
    mouseStates.cursorFlower = true;
    //delete old cursor flower
    if(cursorFlower){
        cursorFlower.remove()
    }
    createCursorFlower();
}


/*
 * Animates the menu on click - increases image size and highlights it
 * @param {HTML element} choice - div that is the menu button chosen
 */
animateMenuChoice = function(choice){
    if(currentMenuChoice.src){
    oldMenuChoice =  currentMenuChoice;

    $(oldMenuChoice.firstChild).animate({
        height: "95%",
        width: "95%",
        backgroundColor: colors.menuColor
            }, 100
        );
    }

    $(choice.firstChild).animate({
        height: "100%",
        width: "100%"
        }, 100
    );

    $(choice).animate({
        backgroundColor: colors.menuSelectColor
        }, 100
    );  
}

unHighlightMenuChoice = function(choice){
    $(choice.firstChild).animate({
        height: "95%",
        width: "95%"
        }, 100
    );

    $(choice).animate({
        backgroundColor: colors.menuColor
        }, 100
    );  
}

/*
 * Resets states after plant button clicked
 */
plantButtonClicked = function(){
    modes.remove = false;
    modes.orderLayers = false; 
    modes.plant = true;
    //delete old cursor flower
    if(cursorFlower){
        cursorFlower.remove()
    }
    createCursorFlower();
}

/*
 * Resets states after remove button clicked
 */
removeButtonClicked = function(){
    modes.plant = false;
    modes.orderLayers = false;
    modes.remove = true;  
    mouseStates.cursorFlower = false;
    cursorFlower.remove();
    
}

/*
 * Resets states after send to back button clicked
 */
sendToBackButtonClicked = function(){
    modes.plant = false;
    modes.remove = false;
    modes.orderLayers = true; 
    mouseStates.cursorFlower = false;
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
interactWithPlant = function(clickEvent){
    mouseStates.currentFlower = canvasFlowers[clickEvent.item.id];
    mouseStates.flowerCenter = mouseStates.currentFlower.img.position;

    if(modes.remove){
        deleteFlower();
    } /*else if(modes.orderLayers){
       sendFlowerToBack();
    }*/ else {
        mouseStates.resizeOldFlower = true;
    } 
}


/*
 * Drop a plant on the screen
 * @param {event} clickEvent - click event passed from onMouseDown
 */
dropFlower = function(clickEvent){
    if(project.view.bounds.contains(clickEvent)){
        var newFlower = new Plant(new Raster(currentMenuChoice.src).scale(resize.initFlowerSize), new Music(soundSources[currentMenuChoice.name],Math.floor((clickEvent.point.y*8)/canvas.height)))
        
        newFlower.playSound();
        
        mouseStates.currentFlower = newFlower;
        mouseStates.droppedFlower = true;
        mouseStates.currentFlower.img.position = clickEvent.point;
        mouseStates.flowerCenter = mouseStates.currentFlower.img.position;
        mouseStates.currentFlower.img.scale(1.5);
        
        newFlower.music.sound.on('play', function() {
           // console.log("played");
            
//            Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
//            newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
//            newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));
            
//            Animation 2: Does a little spin thing. Kinda fun. 
//            newFlower.animate(new RotatingAnimation(-15,0.1,0));
//            newFlower.animate(new RotatingAnimation(30,0.1,0.1));
//            newFlower.animate(new RotatingAnimation(-15,0.1,0.2));
        });
        
        newFlower.music.sound.on('play', function() {
          // console.log("played");
//            
//        //Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
           newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
           newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));
        });
        
        canvasFlowers[mouseStates.currentFlower.img.id] = newFlower;
    } 
}


/*
 * Delete a plant from screen and stop its associated sound
 */
deleteFlower = function(){
    canvasFlowers[mouseStates.currentFlower.img.id].stopSound();
    delete canvasFlowers[mouseStates.currentFlower.img.id];
    mouseStates.currentFlower.img.remove();
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
    mouseStates.currentFlower.img.sendToBack();    
}

/*
 * Scale a flower based on whether mouse distance to flower center is increasing or 
 * decreasing
 * @param {event} clickEvent - event passed from onMouseDrag
 */
scaleFlower = function(clickEvent){
    //make sure old flowers don't jump to a smaller size if user drags in the middle of the
    if(clickEvent.count > 10){
        var flowerCenter = mouseStates.flowerCenter
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
        if(mouseStates.resizeOldFlower){
            if(squareSideLength < mouseStates.currentFlower.img.bounds.width){
                return;
            }
        }

        if(squareSideLength < 0.5*project.view.bounds.width && squareSideLength > 0.05*project.view.bounds.width){
            var rect = new Rectangle(newUpperLeft, new Size(squareSideLength, squareSideLength)); 
            mouseStates.currentFlower.img.fitBounds(rect);
            //handle loop length
          //uncomment when our animations are working. //canvasFlowers[mouseStates.currentFlower.img.id].toggleSoundLength((squareDiagLength*5)/(canvas.width/2));
        
        }
       
        
        
        
        
        //handle volume
        //canvasFlowers[mouseStates.currentFlower.img.id].toggleVolume(resize.grow);
        //canvasFlowers[mouseStates.currentFlower.img.id].toggleVolume(resize.shrink);
    }
    
}

/*
 * Helper function used by scaleFlower to determine the distance from the mouse to the flower center
 * @param {event} dragEvent - the mouse drag event passed from scaleFlower
 */
distanceToFlowerCenter = function(dragEvent){
    var flowerCenter = mouseStates.currentFlower.img.position;
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
    cursorFlower = new Raster(currentMenuChoice.src).scale(0.07)
    cursorFlower.opacity = 0.4 
    cursorFlower.visible = false;
}

/*
 * Move the "ghost" flower that tracks with the cursor
 * @param{event} event - the mouseMouve event
 */ 

moveCursorFlower = function(event){
//make it lag less on initial click - kind of a hacky fix for now
    if(event.point.x > 0  && event.point.y > 0){
        cursorFlower.visible = true;
        cursorFlower.position.x = event.point.x;
        cursorFlower.position.y = event.point.y;
    }
}

/*
 * Euclidean distance 
 */
pointDistance = function(point1, point2){
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
    return(distance);
}