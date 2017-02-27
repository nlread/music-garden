class Component {
    
    constructor(paperPath) {
        //null check enables having components with only Rasters and not Paths
        if(paperPath != null){
            this.paperPath = paperPath;
        
            this._position = paperPath.getPosition().clone();
            this._orientation = paperPath.getRotation();
            this._scaleFactor = paperPath.getScaling().clone();
        }
        
    }
    
    // Not needed as paperPath keeps track of its position? 
    // Need way to account for position moving on rotation. 
    setPosition(x, y) {
        this._position.x = x;
        this._position.y = y;
        
        let deltaPos = this._position.subtract(this._currentPosition);
        this.paperPath.translate(deltaPos.x, deltaPos.y);
    }
    
    translate(x, y) {   
        this._position.x = x;
        this._position.y = y;
        this.paperPath.translate(new Point(x, y));
    }
    
    /*
     * Sets the rotation of the path relative to its starting 
     * rotation when it was created.
     */
    setRotation(angle) {        
        let deltaAngle = angle - this._orientation
        this.paperPath.rotate(deltaAngle);
        this._orientation = angle;
    }
    
    rotate(deltaAngle) {
        this.paperPath.rotate(deltaAngle);
        this._orientation += deltaAngle;
    }
    
    /*
     * Scales the path to match the provided values relative to it's
     * starting size when it was created. 
     */
    setScaleFactor(factorX, factorY) {
        let deltaScale = new Point()
        deltaScale.x = factorX;
        deltaScale.y = factorY;
        
        if(this._scaleFactor.x == 0 || this._scaleFactor.y == 0)
            deltaScale = new Point(1, 1);
        else
            deltaScale = this._deltaScale.multiply(this._scaleFactor);
        this.paperPath.scale(deltaScale);
        
        this._scaleFactor.x = factorX;
        this._scaleFactor.y = factorY;
    }
    
    scale(factorX, factorY) {
        this.paperPath.scale(factorX, factorY);
        
        this._scaleFactor.x *= factorX;
        this._scaleFactor.y *= factorY;
    }
}


class Plant extends Component{
    
    //takes both a path and a raster for now so it can extend component, but should amend that to just one or the other later
    constructor(paperPath, raster, music){
        super(paperPath);
        //so it has access to oaper's Raster properties
        this.img = raster;
        //in the future this could be set automatically depending on plant type - can you have default parameters like you can in Python?
        this.music = music;
        
        //plays the music of the plant, setting it to loop and the volume at 0.5
        this.playSound = function(){
            console.log(this.music.sound)
            this.music.sound.play();
            this.music.sound.loop(true);
            this.music.sound.volume(0.5);
        };
        
        this.togleVolume = function(x){
            this.volume = this.music.sound.volume()*x;
            console.log(this.volume);
            this.music.sound.volume(this.volume);
        };
    };
}

class Flower extends Plant{
    //later, this will have more specific animation/sound characteristics, placeholder for now
    
    constructor(paperPath, raster, music){
        super(paperPath, raster, music);
    };
}

//I'm not sure if this class is necessary. we could easily make the sound in plant

class Music {

    constructor(source){
        this.source = source;
        this.sound = new Howl({
            src: [source]
        });
    };
    
}