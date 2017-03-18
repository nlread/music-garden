class Component {
    
    /**
     * Class which wraps a paper.js Group or Path and gives it the ability
     * to set the rotation and scaling, instead of only changing the rotation
     * and scaling. 
     * @param {Group} paperGroup 
     */
    constructor(paperGroup) {
        //null check enables having components with only Rasters and not Paths
        if(paperGroup != null){
            this.paperGroup = paperGroup;
        
            this._position = paperGroup.getPosition().clone();
            this._orientation = paperGroup.getRotation();
            this._scaleFactor = paperGroup.getScaling().clone();
        }
        
    }
    
    /**
     * Sets the position of the group relative to its starting position. 
     * @param {Number} x
     * @param {Number} y 
     */
    setPosition(x, y) {
        this._position.x = x;
        this._position.y = y;
        
        let deltaPos = this._position.subtract(this._currentPosition);
        this.paperGroup.translate(deltaPos.x, deltaPos.y);
    }
    
    /**
     * Changes the position of the group by the provided values. 
     * @param {Number} x 
     * @param {Number} y 
     */
    translate(x, y) {   
        this._position.x = x;
        this._position.y = y;
        this.paperGroup.translate(new Point(x, y));
    }
    
    /**
     * Sets the rotation of the path relative to its starting 
     * rotation when it was created. 
     * @param {Number} angle 
     */
    setRotation(angle) {        
        let deltaAngle = angle - this._orientation
        this.paperGroup.rotate(deltaAngle);
        this._orientation = angle;
    }
    
    /**
     * Changes the rotation of the group by the provided amount. 
     * @param {Number} deltaAngle 
     */
    rotate(deltaAngle) {
        this.paperGroup.rotate(deltaAngle);
        this._orientation += deltaAngle;
    }
    
    /**
     * Scales the path to match the provided values relative to it's
     * starting size when it was created.  
     * @param {Number} factorX 
     * @param {Number} factorY 
     */
    setScaleFactor(factorX, factorY) {
        let deltaScale = new Point()
        deltaScale.x = factorX;
        deltaScale.y = factorY;
        
        if(this._scaleFactor.x == 0 || this._scaleFactor.y == 0)
            deltaScale = new Point(1, 1);
        else
            deltaScale = this._deltaScale.multiply(this._scaleFactor);
        this.paperGroup.scale(deltaScale);
        
        this._scaleFactor.x = factorX;
        this._scaleFactor.y = factorY;
    }
    
    /**
     * Scales the group by the provided amounts. 
     * 1 does not change the size in the given direction. 
     * @param {Number} factorX 
     * @param {Number} factorY 
     */
    scale(factorX, factorY) {
        this.paperGroup.scale(factorX, factorY);
        
        this._scaleFactor.x *= factorX;
        this._scaleFactor.y *= factorY;
    }
}

class AnimatedComponent extends Component {
    constructor(paperGroup) {
        super(paperGroup);
        this.animations = [];
    }

    update(dTime) {
        for(let i=0; i<this.animations.length; i++) {
            
        }
    }
}

class Plant extends Component {
    
    //takes both a path and a raster for now so it can extend component, but should amend that to just one or the other later
    constructor(paperGroup, svg, music){
        super(paperGroup)
        this.img = svg;
        //in the future this could be set automatically depending on plant type - can you have default parameters like you can in Python?
        this.music = music;
        this.volume = 0.5
        
        //plays the music of the plant, setting it to loop and the volume at 0.5
        this.playSound = function(){
            this.music.sound.play();
            this.music.sound.loop(true);
            this.music.sound.volume(this.volume);
        };
        
        this.stopSound = function(){
            this.music.sound.stop();
        };
        
        this.toggleVolume = function(x){
            this.volume = this.volume*x;
            this.music.sound.volume(this.volume);
        };
    };
}



class Flower extends Plant {
    //later, this will have more specific animation/sound characteristics, placeholder for now
    
    constructor(paperGroup, raster, music){
        super(paperGroup, raster, music);
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

class Animation {
    /**
     * Parent class of any tweens to apply to on screen components. 
     * @constructor
     * @param {Number} duration 
     */
    constructor(duration) {
        this.duration = duration;
        this.elapsed = 0;
    }

    /**
     * Have the animation apply nessessary changes to the provided component. 
     * Handles timing, then calss applyChange implemented in child. 
     * @param {Number} dTime 
     * @param {Component} component 
     */
    update(dTime, component) {
        if (this.elapsed + dTime > this.duration) {
            this.dTime = this.duration - this.elapsed;
        }
        this.elapsed += dTime;
        
        this.applyChange(dTime, component);
    }

}

class ScalingAnimation extends Animation {
    
    /**
     * Animation which tweens the size of a component. 
     * @constructor
     * @param {Number} duration 
     * @param {Point} scaleRadio 
     */
    constructor(duration, scaleRadio) {
        super(duration);
        this.scaleRadio = scaleRadio;
        this.changedBy = new Point(0, 0);
    }

    /**
     * Scales the provided component by the amount required given the amount of time passed
     * and this animations target scaling. 
     * @param {Number} dTime 
     * @param {Component} component 
     */
    applyChange(dTime, component) {
        let toChangeBy = this.scaleRadio.multiply(dTime / this.duration);
        
        if(toChangeBy.x + this.changedBy.x >= this.scaleRadio.x) {
            toChangeBy.x = this.scaleRadio.x - this.changedBy.x;
        }

        if(toChangeBy.y + this.changedBy.y >= this.scaleRadio.y) {
            toChangeBy.y = this.scaleRadio.y - this.changedBy.y;
        }

        component.scale(toChangeBy.x, toChangeBy.y);
        
        this.changedBy = this.changedBy.add(toChangeBy);
    }
}