/* ONLOAD */

$(document).ready(function(){
    $('body').chardinJs('start');
});

window.onload = function() {
    console.log("window loaded");
    
    setUpScreen(); 
    initializeGlobals();
    startBackgroundSound();
    setupFlowerGroup();

    
    //plant button highlighted by default
    $(buttons.plant).trigger("click");
   
    $('.menuChoice').on('click', makeMenuChoice);

    $('.menuChoice').on('mouseenter', function() {
        choice = this;
        $(choice).stop(); //prevent double-bounce
        menuAnims.animateMenuChoice(choice);
    });

     $('.menuChoice').on('mouseleave', function() { 
        choice = this;
        menuAnims.unHighlightMenuChoice(choice);
    });

    $('#removeButton').on('click', removeButtonClicked);

    $('#sendToBackButton').on('click', sendToBackButtonClicked);

    $('#plantButton').on('click', plantButtonClicked);
    
    $("#helpButton").on('click', helpButtonClicked);
    
    $("#trashButton").on("click", trashButtonClicked);
        
    let inputs = new Tool();

    inputs.onMouseUp = function(event) {
        stopResize();
        //ghost flower comes back after resize
        if(screenItems.cursorFlower){
            screenItems.cursorFlower.visible = true;
        }
    };

    inputs.onMouseDown = function(event) {
        let hit = hitTestFlowers(event.point)
        if (hit) {
            appStates.currentFlower = hit;
            interactWithPlant(hit);
            return;
        } 

       if(currentMenuChoice && interactionModes.plant){
            //make arrows invisible after first plant
             if(screenItems.arrows){
                screenItems.arrows.visible = false;
             }
            dropFlower(event);
        }
        
        //don't show ghost flower during resize
        if(screenItems.cursorFlower){
            screenItems.cursorFlower.visible = false;
        }
        
}
    
    inputs.onMouseDrag = function(event) { 
        if(interactionModes.plant && (appStates.droppedFlower || appStates.resizeOldFlower)){
            scaleFlower(event);
        }
    }

    inputs.onMouseMove = function(event) {
        if(interactionModes.plant && screenItems.cursorFlower){
            moveCursorFlower(event);
        }
        
        //change opacity of flower that is moused over
         if(interactionModes.remove){
             var itemHit = hitTestFlowers(event.point);
             if(itemHit && itemHit != screenItems.cursorFlower) {
                itemHit.img.opacity = 0.5;
                appStates.transparentFlowers.push(itemHit)
             }
          }
         
         //change it back once hit test no longer applies
         if(appStates.prevItemHit && itemHit != appStates.prevItemHit){
             if(appStates.transparentFlowers){
                 for(flower of appStates.transparentFlowers){
                     flower.img.opacity = 1;
                 }

                 if (appStates.transparentFlowers.length > 0) {
                     appStates.transparentFlowers = [];
                 }
            }
            
        }
        
        appStates.prevItemHit = itemHit;
    }

    paper.view.onFrame = globalOnFrame;
}

function setupFlowerGroup() {
    flowersGroup = new Group();
}

function globalOnFrame(frameEvent) {
    let dTime = frameEvent.delta;
    for (let flowerId in canvasFlowers) {
        if (canvasFlowers.hasOwnProperty(flowerId)) {
            let flower = canvasFlowers[flowerId];
            if (flower instanceof AnimatedComponent) {
                flower.update(dTime);
            }
        }
    }
}


function hitTestFlowers(eventPoint) {
    let hitResult = flowersGroup.hitTest(eventPoint);
    if (hitResult) {
        return canvasFlowers[hitResult.item.id];
    } 
    return null;

}

//HELPER FUNCTIONS

/**
 * Sets up Paper.js screen
 */
function setUpScreen() {
    paper.setup('canvas')
    view.draw();  
}

/**
 * Initializes global namespaces that we don't have access to until onload() but need 
 * globally
 */
function initializeGlobals() {
    buttons.remove = document.getElementById("removeButton");
    buttons.plant = document.getElementById("plantButton");
    buttons.sendToBack = document.getElementById("sendToBackButton");
    buttons.help = document.getElementById("helpButton");  
}

/**
 * Stops resizing plant + resets droppedFlower
 */
function stopResize() {
    if (appStates.resizeOldFlower) {
        appStates.resizeOldFlower = false;
    }
    if (appStates.droppedFlower) {
        appStates.droppedFlower = false;
    }
    resizeFinish();
}

/**
 * Switches current flower being dropped and resets state variables
 * @param {Event} menuItemClicked - flower selected from menu
 */
 function makeMenuChoice(menuItemClicked) {
    menuAnims.animateMenuChoice(this);
    
    plantButtonClicked();
    
    currentMenuChoice.src = this.firstChild.src;
    currentMenuChoice.name = this.firstChild.id;
    
    appStates.droppedFlower = false;
    
    appStates.cursorFlower = true;
    resetCursorFlowerAndArrows();
}


/**
 * Resets states after plant button clicked
 */
function plantButtonClicked() {
    interactionModes.remove = false;
    interactionModes.orderLayers = false; 
    interactionModes.plant = true;
    resetCursorFlowerAndArrows();
    toggleButton(buttons.remove);
}

/**
 * Resets states after remove button clicked
 */
function removeButtonClicked() {
    interactionModes.plant = false;
    interactionModes.orderLayers = false;
    interactionModes.remove = true;
    toggleButton(buttons.plant);
    appStates.cursorFlower = false;
    screenItems.cursorFlower.remove();
}

/**
 * Resets states after send to back button clicked
 */
function sendToBackButtonClicked() {
    interactionModes.plant = false;
    interactionModes.remove = false;
    interactionModes.orderLayers = true; 
    appStates.cursorFlower = false;
    screenItems.cursorFlower.remove();
}

/**
 * Brings tutorial back up when help button is clicked
 */
function helpButtonClicked() {
    $('body').chardinJs('start');
}

/**
 * Dialog box to confirm deletion of all flowers
 */
function trashButtonClicked() {
    var trash = confirm("Are you sure you want to delete all flowers?");
    if (trash) {
        deleteAllFlowers();
    }
    $("#trashButton").button("toggle");
}

/**
 * Toggles a button's active class
 * @param {HTML button} button - the button to toggle
 */
function toggleButton(button) {
    if($(button).hasClass("active")){
        $(button).button("toggle");
    }
}

/**
 * Determine whether to delete, send to back, or resize a plant that's been clicked on  * based on current mode
 * @param {ToolEvent} clickEvent - event passed in from onMouseDown handler
 */
function interactWithPlant(plantClicked) {
    appStates.flowerCenter = appStates.currentFlower.img.position;

    if(interactionModes.remove){
        deleteFlower();
    } /*else if(interactionModes.orderLayers){
       sendFlowerToBack();
    }*/ else {
        appStates.resizeOldFlower = true;
        appStates.currentFlower.stopSound();
    } 
}


/**
 * Drop a plant on the screen
 * @param {ToolEvent} clickEvent - click event passed from onMouseDown
 */
function dropFlower(clickEvent) {
    if(project.view.bounds.contains(clickEvent)){
        let flowerImg = new Raster(currentMenuChoice.src).scale(resize.initFlowerSize);
        let flowerPitch = Math.floor((clickEvent.point.y * 8)/canvas.height);
        let flowerMusic = new Music(soundSources[currentMenuChoice.name], flowerPitch);

        let newFlower = new Plant(flowerImg, flowerMusic);
        flowersGroup.addChild(flowerImg);
        // newFlower.playSound();

        appStates.currentFlower = newFlower;
        appStates.droppedFlower = true;
        appStates.currentFlower.img.position = clickEvent.point;
        appStates.flowerCenter = appStates.currentFlower.img.position;
        appStates.currentFlower.img.scale(1.5);

        if(currentMenuChoice.name === "jade") {
            newFlower.music.sound.on('play',  function() {
                Animator.growShrink(newFlower);
            });
        } else if (currentMenuChoice.name === "red") {
            newFlower.music.sound.on('play',  function() {
                Animator.growShrink(newFlower);
            });
        } else if (currentMenuChoice.name === "succulent") {
            newFlower.music.sound.on('play',  function() {
                Animator.growShrink(newFlower);
            });
        } else if (currentMenuChoice.name === "sunflower") {
            newFlower.music.sound.on('play',  function() {
                Animator.growShrink(newFlower);
            });
        } else if (currentMenuChoice.name === "green"){
            newFlower.music.sound.on('play',  function() {
                Animator.growShrink(newFlower);
            });
        } else if (currentMenuChoice.name === "beet"){
            newFlower.music.sound.on('play',  function() {
                Animator.growShrink(newFlower);
            });
        }

        
        canvasFlowers[appStates.currentFlower.img.id] = newFlower;
        resetCursorFlowerAndArrows();
    } 
}

/**
 * Delete a plant from screen and stop its associated sound
 */
function deleteFlower() {
    canvasFlowers[appStates.currentFlower.img.id].stopSound();
    appStates.currentFlower.img.remove();
    delete canvasFlowers[appStates.currentFlower.img.id];
}

/**
 * Deletes all flowers on screen
 */
function deleteAllFlowers() {
    for(var flowerId in canvasFlowers){
        canvasFlowers[flowerId].stopSound();
        canvasFlowers[flowerId].img.remove();
    }
    
    canvasFlowers = {}
}

/**
 * Send to back - not currently used
 */
function sendFlowerToBack() {
    appStates.currentFlower.img.sendToBack();    
}

/**
 * Scale a flower based on whether mouse distance to flower center is increasing or 
 * decreasing
 * @param {ToolEvent} clickEvent - event passed from onMouseDrag
 */
function scaleFlower(clickEvent) {
    // Make sure old flowers don't jump to a smaller size if user drags in the middle of the
    if(clickEvent.count > 10){
        
        // Math that creates a square around the center of the flower. 
        // Side length of the square is 2*sqrt(x distance of mouse to flower center^2 + y distance of mouse to  flower center^2)
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
        
        // Make sure old flowers don't get super small if users drag inside of them
        if (appStates.resizeOldFlower) {
            if (squareSideLength < appStates.currentFlower.img.bounds.width && clickEvent.count < 5) {
                return;
            }
        }

        // Make sure flower is not going to be larger than 1/2 view width or smaller than 1/20 view width. If so, resize to fit bounds
        if(squareSideLength < 0.5 * project.view.bounds.width && squareSideLength > 0.05 * project.view.bounds.width) {
            //resize image
            rect = new Rectangle(newUpperLeft, new Size(squareSideLength, squareSideLength)); 
            appStates.currentFlower.img.fitBounds(rect);
        }
    }
    
}

/**
 * Triggers after the resizing of a plant finishes. 
 * Toggles the sound length of the resized flower based on the new size. 
 */
function resizeFinish() {
    let flower = appStates.currentFlower;
    let squareDiag = Math.sqrt(Math.pow(Math.min(flower.img.bounds.width, flower.img.bounds.height), 2) * 2);
    
    flower.toggleSoundLength(Math.floor((squareDiag * 4) / (canvas.width / 2)));  
}

/**
 * Helper function used by scaleFlower to determine the distance from the mouse to the flower center
 * @param {ToolEvent} dragEvent - the mouse drag event passed from scaleFlower
 */
function distanceToFlowerCenter(dragEvent) {
    var flowerCenter = appStates.currentFlower.img.position;
    var mousePos = dragEvent.point;
    var dist = pointDistance(mousePos, flowerCenter);
    return(dist);
}

/**
 * Starts background sound if it's not already started
 */
 function startBackgroundSound() {
    backgroundTrack.play();
    backgroundTrack.loop(true);
    backgroundTrack.volume(0.3);
}

/**
 * Create the "ghost" flower and arrows that tracks with the cursor
 */
function createCursorFlowerAndArrows() {
    screenItems.cursorFlower = new Raster(currentMenuChoice.src).scale(0.07)
    screenItems.cursorFlower.opacity = 0.4 
    screenItems.cursorFlower.visible = false;
    
    optionalArrows();
}

/**
 * Move the "ghost" flower that tracks with the cursor
 * @param {ToolEvent} event - The mouseMove event
 */ 
function moveCursorFlower(event){
    //make it lag less on initial click
    if(event.point.x > 0  && event.point.y > 0){
        screenItems.cursorFlower.visible = true;
        screenItems.cursorFlower.position.x = event.point.x;
        screenItems.cursorFlower.position.y = event.point.y;
        
        makeArrowsVisible(event);
    }
}

/**
 * Removes and recreates the cursor flower and expand arrows
 */
function resetCursorFlowerAndArrows() {
    if (screenItems.cursorFlower) {
        screenItems.cursorFlower.remove()
    }
    
    if (screenItems.arrows) {
        screenItems.arrows.remove()
    }
    
    createCursorFlowerAndArrows();
}

/*
 * Creates "guide arrows" for resize if there are no flowers on the screen - invisible on creation
 */
function optionalArrows() {
     if(Object.keys(canvasFlowers).length < 4){
         screenItems.arrows = new Raster("www/img/PNG/arrows.png").scale(0.4)
         screenItems.arrows.rotate(45);
         screenItems.arrows.opacity = 0.4
         screenItems.arrows.visible = false;
     }
}

/**
 * Makes arrows visible if they exist & there are no flowers on screen
 * @param {ToolEvent} event - the mouse event to center the arrows at
 */
function makeArrowsVisible(event) {
    if(screenItems.arrows && Object.keys(canvasFlowers).length < 4){
             screenItems.arrows.visible = true;
             screenItems.arrows.position.x = event.point.x;
             screenItems.arrows.position.y = event.point.y; 
    }
}

/**
 * Calculates the euclidean distance between the provided points
 * @param {Point} point1 - First point
 * @param {Point} point2 - Second point
 */
function pointDistance(point1, point2) {
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
    return(distance);
}