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
     * Sets the position of the group. 
     * @param {(Point|Number)} args - Point or Coords to move group to
     */
    setPosition(...args) {
        if (args.length === 1) {
            this._setPositionPoint(args[0]);
        } else if (args.length === 2) {
            this._setPositionCoords(args[0], args[1]);
        }
    }
    /**
     * Sets the position of the group.
     * @param {Point} newPos - Point to move group to
     */
    _setPositionPoint(newPos) {
        this.setPosition(newPos.x, newPos.y);
    }
    /**
     * Sets the position of the group.
     * @param {Number} x - x coord to move group to
     * @param {Number} y - y coord to move group to
     */
    _setPositionCoords(x, y) {
        this._position.x = x;
        this._position.y = y;
        
        let deltaPos = this._position.subtract(this._currentPosition);
        this.paperGroup.translate(deltaPos.x, deltaPos.y);
    }
    

    /**
     * Changes the position of the group by the provided values
     * @param {(Point|Number)} args - Amount to move group by
     */
    translate(...args) {
        if (args.length === 1) {
            this._translatePoint(args[0]);
        } else if (args.length === 2) {
            this._translateCoords(args[0], args[1]);
        }
    }
    
    /**
     * Changes the position of the group by the provided point
     * @param {Point} deltaPoint - Amount to move group by
     */
    _translatePoint(deltaPoint) {
        this._position.x += deltaPoint.x;
        this._position.y += deltaPoint.y;
        this.paperGroup.translate(deltaPoint);
    }

    /**
     * Changes the position of the group by the provided values. 
     * @param {Number} x - Amount to move group in x coord
     * @param {Number} y - Amount to move group in y coord
     */
    _translateCoords(x, y) {   
        this._translatePoint(new Point(x, y));
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
     * Scales the group to match the provided values, relative to its
     * starting size.
     * @param {(Point|Number)} args 
     */
    setScaleFactor(...args) {
        if (args.length === 1) {
            this._setScaleFactorPoint(args[0]);
        } else if(args.length === 2) {
            this._setScaleFactorXY(args[0], args[1]);
        }
    }

    /**
     * Scales the group to match the provided values relative to it's
     * starting size. 
     * @param {Point} deltaScale 
     */
    _setScaleFactorPoint(deltaScale) {
        if (this._scaleFactor.x == 0 || this._scaleFactor.y == 0) {
            // Can't scale out if factor set to 0.
            deltaScale = new Point(1, 1);
        } else {
            deltaScale = deltaScale.divide(this._scaleFactor);
        }

        this.paperGroup.scale(deltaScale);
        
        this._scaleFactor.x = deltaScale.x;
        this._scaleFactor.y = deltaScale.y;
    }

    /**
     * Scales the group to match the provided values relative to it's
     * starting size.
     * @param {Number} widthFactor - Amount to scale width by
     * @param {Number} heightFactor - Amount to scale height by
     */
    _setScaleFactorXY(widthFactor, heightFactor) {
        let deltaScale = new Point(widthFactor, heightFactor);
        this._setScaleFactorPoint(deltaScale);
    }

    /**
     * Scales the group by the provided values.
     * @param {(Point|Number)} args - Values to scale object by
     */
    scale(...args) {
        if (args.length === 1) {
            this._scalePoint(args[0]);
        } else if(args.length === 2) {
            this._scaleXY(args[0], args[1]);
        }
    }
    
    /**
     * Scales the group by the provided amounts. 
     * 1 does not change the size in the given direction. 
     * @param {Point} scalingFactor 
     */
    _scalePoint(scalingFactor) {
        this._scaleXY(scalingFactor.x, scalingFactor.y);
    }

    /**
     * Scales the group by the provided amounts. 
     * 1 does not change the size in the given direction. 
     * @param {Number} widthFactor - Amount to scale width by
     * @param {Number} heightFactor - Amount to scale height by 
     */
    _scaleXY(widthFactor, heightFactor) {
        this.paperGroup.scale(widthFactor, heightFactor);
        
        this._scaleFactor.x *= widthFactor;
        this._scaleFactor.y *= heightFactor;
    }
}

class AnimatedComponent extends Component {

    constructor(paperGroup) {
        super(paperGroup);
        this.animations = [];
    }

    animate(anim) {
        this.animations.push(anim);
    }

    update(dTime) {
        for(let i=0; i < this.animations.length; i++) {
            let anim = this.animations[i];
            anim.update(dTime, this);
            
            if(!anim.isValid()) {
                this.animations.splice(i, 1);
            }
        }
    }
}

class Plant extends Component {
    
    //takes both a path and a raster for now so it can extend component, 
    //but should amend that to just one or the other later
    constructor(paperGroup, svg, music){
        super(paperGroup)
        this.img = svg;

        //in the future this could be set automatically depending on plant type
        //can you have default parameters like you can in Python?
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
        if (this.elapsed + dTime >= this.duration) {
            dTime = this.duration - this.elapsed;
        }
        this.elapsed += dTime;
        
        this.applyChange(dTime, component);
    }

    /**
     * Returns if the animation is still valid or not.
     * Eg has performed its tween or not. 
     * @returns {Boolean}
     */
    isValid() {
        return this.elapsed <= this.duration;
    }
}

class ScalingAnimation extends Animation {
    
    /**
     * Animation which tweens the size of a component. 
     * @constructor
     * @param {Number} duration 
     * @param {Point} scaleRatio 
     */
    constructor(duration, scaleRatio) {
        super(duration);
        this.scaleRatio = scaleRatio;
        this.scaledBy = new Point(1, 1);
    }

    /**
     * Scales the provided component by the amount required given the amount of time passed
     * and this animations target scaling. 
     * @param {Number} dTime 
     * @param {Component} component 
     */
    applyChange(dTime, component) {
        let onePoint = new Point(1, 1);
        let deltaScale = this.scaleRatio.multiply(dTime / this.duration);
        
        if(deltaScale.x + this.scaledBy.x >= this.scaleRatio.x) {
            deltaScale.x = this.scaleRatio.x - this.scaledBy.x;
        }

        if(deltaScale.y + this.scaledBy.y >= this.scaleRatio.y) {
            deltaScale.y = this.scaleRatio.y - this.scaledBy.y;
        }


        // Need to account for fact that component.scale() uses values relative to its size
        // Must basically scale down then up to new value. 
        let actualScaleFactor;
        if(this.scaledBy.x === 0) {
            actualScaleFactor = deltaScale.add(this.scaledBy);
        } else {
            actualScaleFactor = deltaScale.add(this.scaledBy);
            actualScaleFactor = actualScaleFactor.divide(this.scaledBy);
        }

        component.scale(actualScaleFactor.x, actualScaleFactor.y);

        this.scaledBy = this.scaledBy.add(deltaScale);
    }
}

class RotatingAnimation extends Animation {

    /**
     * Animation which tweens rotating a Component the provided degrees over the 
     * provided amount of time.
     * @param {Number} duration 
     * @param {Number} degreeChange 
     */
    constructor(duration, degreeChange) {
        super(duration);
        this.degreeChange = degreeChange;
        this.rotatedBy = 0;
    }

    /**
     * Applies the appriate amount of rotation to the provided component based on the
     * time that has passed and overall change.
     * @param {Number} dTime 
     * @param {Component} component 
     */
    applyChange(dTime, component) {
        let deltaRotation = this.degreeChange * dTime / this.duration;
        
        if (Math.abs(deltaRotation + this.rotatedBy) >= Math.abs(this.degreeChange)) {
            deltaRotation = this.degreeChange - this.rotatedBy;
        }

        component.rotate(deltaRotation);

        this.rotatedBy += deltaRotation;
    }
}

class TranslationAnimation extends Animation {

    /**
     * Animation which tweens moving a Component over 
     * @param {Number} duration 
     * @param {Point} distChange 
     */
    constructor(duration, distChange) {
        super(duration);
        this.distChange = distChange;
        this.translatedBy = new Point(0, 0);
        
    }

    applyChange(dTime, component) {
        let deltaPos = this.distChange.multiply(dTime / this.duration);

        if(this.translatedBy.x + deltaPos.x  > this.distChange.y) {
            deltaPos.x = this.distChange.x - this.translatedBy.x;
        }

        if (this.translatedBy.y + deltaPos.y > this.distChange.y) {
            deltaPos.y = this.distChange.y - this.translatedBy.y;
        }

        component.translate(deltaPos);
        
        this.translatedBy = this.translatedBy.add(deltaPos);
    }
}