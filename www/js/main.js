/* ONLOAD */

$(document).ready(function(){
    $('body').chardinJs('start');
});

window.onload = function() {
    console.log("window loaded");
    
    setUpScreen(); 
    setupPlants();
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

    myTool.onMouseDown = function(event) {

        if(window.printHitTest) {
            console.log('hit test at ' + event.point.x + ',' + event.point.y);
            console.log(hitTestFlowers(event.point));;
            return;
        }

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
}
    
    myTool.onMouseDrag = function(event) { 
        if(interactionModes.plant && (appStates.droppedFlower || appStates.resizeOldFlower)){
            scaleFlower(event);
        }
    }
    myTool.onMouseMove = function(event){
        if(interactionModes.plant && screenItems.cursorFlower){
            moveCursorFlower(event);
        }
        
        //change opacity of flower that is moused over
         if(interactionModes.remove && hitTestFlowers(event.point)){
             var itemHit = hitTestFlowers(event.point);
             if(itemHit != screenItems.cursorFlower){
                 itemHit.img.opacity = 0.5;
                 appStates.transparentFlowers.push(itemHit)
              }
          }
         
         //change it back once hit test no longer applies
         if(appStates.prevItemHit && itemHit != appStates.prevItemHit){
             if(appStates.transparentFlowers){
                 for(flower in appStates.transparentFlowers){
                     appStates.transparentFlowers[flower].img.opacity = 1;
                 }
            }
            
        }
        
        appStates.prevItemHit = itemHit;
        
    }
    
    myTool.onKeyDown = function(event) {
        if (event.key == 'p') {
            printHitTest = true;            
        }
    }

    myTool.onKeyUp = function(event) {
        if (event.key == 'p') {
            printHitTest = false;            
        }
    }

    paper.view.onFrame = globalOnFrame;
}
window.printHitTest = false;

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

function hitTestFlowers(eventPoint) {
    for(let flowerId in canvasFlowers) {
        let flower = canvasFlowers[flowerId]
        if(flower.isPresentAt(eventPoint)) {
            return flower;
        }
    }
    return undefined;
}

function setupPlants() {
    for (let plant in plantDisplaySources) {
        project.importSVG(plantDisplaySources[plant], 
                          {insert: false, 
                           onLoad: (loadedData) => plantSVGLoadSuccess(plant, loadedData),
                           onError: plantSVGLoadFailure});
    }
}

function plantSVGLoadSuccess(plant, loadedData) {
    let plantRaster = loadedData.rasterize();
    loadedPlantRasters[plant] = plantRaster;
}

function plantSVGLoadFailure(error) {
    console.log(error);
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
    resetCursorFlowerAndArrows();
}


/*
 * Resets states after plant button clicked
 */
plantButtonClicked = function(){
    interactionModes.remove = false;
    interactionModes.orderLayers = false; 
    interactionModes.plant = true;
    resetCursorFlowerAndArrows();
    toggleButton(buttons.remove);
}

/*
 * Resets states after remove button clicked
 */
removeButtonClicked = function(){
    interactionModes.plant = false;
    interactionModes.orderLayers = false;
    interactionModes.remove = true;
    toggleButton(buttons.plant);
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
    $("#trashButton").button("toggle");
}

/*
 * Toggles a button's active class
 * @param{HTML button} button - the button to toggle
 */

toggleButton = function(button){
    if($(button).hasClass("active")){
        $(button).button("toggle");
    }
}

/*
 * Determine whether to delete, send to back, or resize a plant that's been clicked on  * based on current mode
 * @param {event} clickEvent - event passed in from onMouseDown handler
 */
interactWithPlant = function(plantClicked){
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
function dropFlower(clickEvent) {
    if(project.view.bounds.contains(clickEvent)){
        let flowerDisplay = new Raster(currentMenuChoice.src).scale(resize.initFlowerSize);
        let flowerPitch = Math.floor((clickEvent.point.y*8)/canvas.height);
        let flowerMusic = new Music(soundSources[currentMenuChoice.name], flowerPitch);

        let newFlower = new Plant(flowerDisplay, flowerMusic);
        newFlower.playSound();
        newFlower.setCollisionRaster(loadedPlantRasters[currentMenuChoice.name])
        newFlower.setBoundsRatio(plantBoundsRatios[currentMenuChoice.name])

        appStates.currentFlower = newFlower;
        appStates.droppedFlower = true;
        appStates.currentFlower.img.position = clickEvent.point;
        appStates.flowerCenter = appStates.currentFlower.img.position;
        appStates.currentFlower.img.scale(1.5);

        if(currentMenuChoice.name === "jade"){
           newFlower.music.sound.on('play',  function() {


    //            Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
                newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
                newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));

    //            Animation 2: Does a little spin thing. Kinda fun. 
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0));
    //            newFlower.animate(new RotatingAnimation(30,0.1,0.1));
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0.2));
            });
        }
        else if (currentMenuChoice.name === "red"){
            newFlower.music.sound.on('play',  function() {


    //            Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
                newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
                newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));

    //            Animation 2: Does a little spin thing. Kinda fun. 
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0));
    //            newFlower.animate(new RotatingAnimation(30,0.1,0.1));
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0.2));
            });
        }
        else if (currentMenuChoice.name === "succulent"){
            newFlower.music.sound.on('play',  function() {


    //            Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
                newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
                newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));

    //            Animation 2: Does a little spin thing. Kinda fun. 
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0));
    //            newFlower.animate(new RotatingAnimation(30,0.1,0.1));
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0.2));
            });
        }
        else if (currentMenuChoice.name === "sunflower"){
            newFlower.music.sound.on('play',  function() {


    //            Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
                newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
                newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));

    //            Animation 2: Does a little spin thing. Kinda fun. 
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0));
    //            newFlower.animate(new RotatingAnimation(30,0.1,0.1));
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0.2));
            });
        }
        else if (currentMenuChoice.name === "green"){
            newFlower.music.sound.on('play',  function() {


    //          Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
                newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
                newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));

    //            Animation 2: Does a little spin thing. Kinda fun. 
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0));
    //            newFlower.animate(new RotatingAnimation(30,0.1,0.1));
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0.2));
            });
        }
        else if (currentMenuChoice.name === "beet"){
            newFlower.music.sound.on('play',  function() {


    //            Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
                newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
                newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));

    //            Animation 2: Does a little spin thing. Kinda fun. 
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0));
    //            newFlower.animate(new RotatingAnimation(30,0.1,0.1));
    //            newFlower.animate(new RotatingAnimation(-15,0.1,0.2));
            });
        }

        
//        newFlower.music.sound.on('play', function() {
//       
////            
////        //Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
//            //test flower
//          // newFlower.animate(new ScalingAnimation(new Point(1.3,1.3),0.2,-1));
//           //newFlower.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1.1,0.1));
//            //Red flower
//      //     newFlower.animate(new ScalingAnimation(new Point(1/1.3,1.3),0.8,0));
//      //     newFlower.animate(new ScalingAnimation(new Point(1.3,1/1.3),1.2,0));
//            
////            Animation 2: Does a little spin thing. Kinda fun. 
//         //   newFlower.animate(new RotatingAnimation(-30,0.1,0));
//         //   newFlower.animate(new RotatingAnimation(15,0.1,0.1));
//         //   newFlower.animate(new RotatingAnimation(-5,0.1,0.2));
//         //   newFlower.animate(new RotatingAnimation(5,0.1,0.3));
//            
//        });
        
        canvasFlowers[appStates.currentFlower.img.id] = newFlower;
        resetCursorFlowerAndArrows();
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


//test variable
var testRect = null;

/*
 * Scale a flower based on whether mouse distance to flower center is increasing or 
 * decreasing
 * @param {event} clickEvent - event passed from onMouseDrag
 */
function scaleFlower (clickEvent) {
    //make sure old flowers don't jump to a smaller size if user drags in the middle of the
    /*
    if(testRect){
        testRect.remove(); 
    }
    */
    
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
            rect = new Rectangle(newUpperLeft, new Size(squareSideLength * appStates.currentFlower.boundsRatio, 
            squareSideLength * appStates.currentFlower.boundsRatio)); 
            
            /*
            testRect = new Path.Rectangle(rect)
            testRect.fillColor = new Color("red");
            */ 
            
            appStates.currentFlower.img.fitBounds(rect);
            
            flowerSprite = canvasFlowers[appStates.currentFlower.img.id]

            //handle loop length
            //un-comment when our animations are working
            flowerSprite.toggleSoundLength(Math.floor((squareDiagLength*4)/(canvas.width/2)));  
            //flowerSprite.stopAnimate();
            //console.log(flowerSprite);
//            flowerSprite.music.sound.on('play', flowerSprite.stopAnimate());
            
//           flowerSprite.music.sound.on('play', function() {
//     
//            
////            Animation 1: Gets bigger then smaller, kind of like a pop. Could also reverse it.
//            flowerSprite.animate(new ScalingAnimation(new Point(1.3,1.3),0.5,0));
//            flowerSprite.animate(new ScalingAnimation(new Point(1/1.3,1/1.3),1,0));
//            
////            Animation 2: Does a little spin thing. Kinda fun. 
////            newFlower.animate(new RotatingAnimation(-15,0.1,0));
////            newFlower.animate(new RotatingAnimation(30,0.1,0.1));
////            newFlower.animate(new RotatingAnimation(-15,0.1,0.2));
//        });
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
 * Create the "ghost" flower and arrows that tracks with the cursor
 */
createCursorFlowerAndArrows = function(){
    screenItems.cursorFlower = new Raster(currentMenuChoice.src).scale(0.07)
    screenItems.cursorFlower.opacity = 0.4 
    screenItems.cursorFlower.visible = false;
    
    optionalArrows();
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
        
        makeArrowsVisible(event);
        
    }
}

resetCursorFlowerAndArrows = function(){
    if(screenItems.cursorFlower){
        screenItems.cursorFlower.remove()
    }
    
    if(screenItems.arrows){
        screenItems.arrows.remove()
    }
    
    createCursorFlowerAndArrows();
}

/*
 * Creates "guide arrows" for resize if there are no flowers on the screen - invisible on creation
 */

optionalArrows = function(){
     if(Object.keys(canvasFlowers).length < 4){
         screenItems.arrows = new Raster("www/img/PNG/arrows.png").scale(0.4)
         screenItems.arrows.rotate(45);
         screenItems.arrows.opacity = 0.4
         screenItems.arrows.visible = false;
     }
}

/*
 * Makes arrows visible if they exist & there are no flowers on screen
 * @param{mouseEvent} event - the mouse event to center the arrows at
 */
makeArrowsVisible = function(event){
    if(screenItems.arrows && Object.keys(canvasFlowers).length < 4){
             screenItems.arrows.visible = true;
             screenItems.arrows.position.x = event.point.x;
             screenItems.arrows.position.y = event.point.y; 
    }
}
/*
 * Euclidean distance 
 */
pointDistance = function(point1, point2){
    distance = Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
    return(distance);
}