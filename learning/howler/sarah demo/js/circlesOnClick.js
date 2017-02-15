/* Creates randomly-colored circles on mouse drag, size proportionate to how far mouse has been dragged */

paper.install(window); //make paper scope global by injecting it into window - from here http://blog.lindsayelia.com/post/128346565323/making-paperjs-work-in-an-external-file

//run after window has loaded
window.onload = function(){
    //sanity check
    console.log("window loaded");
    
    //create canvas first using id
    paper.setup('canvas')
    
    view.draw(); //helps speed up drawing
    
    var myTool = new Tool();
    
    //place mytool before event handlers + use function expression syntax, not declaration syntax, when creating event handler functions (not totally sure what this is, need to look into it)
    
    myTool.onMouseUp= function(event){
        //do things on mouse click
        createCircle(event.middlePoint, event.delta.length)
    }
}

function createCircle(circleCenter, circleRadius){
    var circle = new Path.Circle( circleCenter, circleRadius)
    circle.fillColor = Color.random(); 
}