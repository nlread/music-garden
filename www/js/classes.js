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
     * @public
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
     * @private
     * Sets the position of the group.
     * @param {Point} newPos - Point to move group to
     */
    _setPositionPoint(newPos) {
        this.setPosition(newPos.x, newPos.y);
    }

    /**
     * @private
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
     * @public
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
     * @private
     * Changes the position of the group by the provided point
     * @param {Point} deltaPoint - Amount to move group by
     */
    _translatePoint(deltaPoint) {
        this._position.x += deltaPoint.x;
        this._position.y += deltaPoint.y;
        this.paperGroup.translate(deltaPoint);
    }

    /**
     * @private
     * Changes the position of the group by the provided values. 
     * @param {Number} x - Amount to move group in x coord
     * @param {Number} y - Amount to move group in y coord
     */
    _translateCoords(x, y) {   
        this._translatePoint(new Point(x, y));
    }
    
    /**
     * @public
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
     * @public
     * Changes the rotation of the group by the provided amount. 
     * @param {Number} deltaAngle 
     */
    rotate(deltaAngle) {
        this.paperGroup.rotate(deltaAngle);
        this._orientation += deltaAngle;
    }
    
    /**
     * @public
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
     * @private
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
     * @private
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
     * @public
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
     * Scales the path to match the provided values relative to it's
     * starting size when it was created.  
     * @param {Number} factorX 
     * @param {Number} factorY 
     */
    setScaleFactor(factorX, factorY) {
        let deltaScale = new Point(factorX, factorY);
        this.setScaleFactor(deltaScale);
    }
    
    /**
     * @private
     * Scales the group by the provided amounts. 
     * 1 does not change the size in the given direction. 
     * @param {Point} scalingFactor 
     */
    _scalePoint(scalingFactor) {
        this._scaleXY(scalingFactor.x, scalingFactor.y);
    }

    /**
     * @private
     * Scales the group by the provided amounts. 
     * 1 does not change the size in the given direction. 
     * @param {Number} widthFactor - Amount to scale width by
     * @param {Number} heightFactor - Amount to scale height by 
     */
    _scaleXY(widthFactor, heightFactor) {
        this.paperGroup.rotate(-this._orientation)
        this.paperGroup.scale(widthFactor, heightFactor);
        this.paperGroup.rotate(this._orientation);

        this._scaleFactor.x *= widthFactor;
        this._scaleFactor.y *= heightFactor;
    }
}

class AnimatedComponent extends Component {

    constructor(paperGroup) {
        super(paperGroup);
        this.animations = [];
    }

    /**
     * @public
     * Adds animation to list to apply to this Component
     * @param {Animation} anim - Animation to apply
     */
    animate(anim) {
        this.animations.push(anim);
    }

    /**
     * @public
     * Performs tasks that should be done pre-draw:
     *     - Apply animations
     * @param {Number} dTime - Amount of time passed since last update
     */
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

class Plant extends AnimatedComponent {
    
    //takes both a path and a raster for now so it can extend component, 
    //but should amend that to just one or the other later
    constructor(paperGroup, svg, music, length){
        super(svg)

        this.img = svg;

        //in the future this could be set automatically depending on plant type
        //can you have default parameters like you can in Python?
        this.music = music;
        this.length = length;
        this.volume = .5
        this.music.sound.volume(this.volume);
        this.intervalID;
        
        //plays the music of the plant, setting it to loop and the volume at 0.5
        this.playSound = function(){
//            this.intervalID = window.setInterval(this.music.sound.play, 100);
            this.music.sound.play();
            this.music.sound.loop();
        };
        
        this.stopSound = function(){
//            window.clearInterval(this.intervalID);
            this.music.sound.stop();
        };
        
        this.toggleVolume = function(x){
            this.volume = this.volume*x;
            this.music.sound.volume(this.volume);
        };
    };
}

//I'm not sure if this class is necessary. we could easily make the sound in plant

class Music {

    constructor(source, pitch){
        this.source = source;
        this.pitch = pitch+1;
        this.sound = new Howl({
            src: [this.source[this.pitch]],
        });
    };
    
}

class Animation {

    /**
     * Parent class of any tweens to apply to on screen components. 
     * @constructor
     * @param {Number} duration - Amount of time to apply for
     * @param {Number} delay - Amount of time before begining to apply animation
     */
    constructor(duration, delay) {
        if (!delay || delay === 0) {
            this.delayRemaining = 0;
            this.active = true;
        } else {
            this.delayRemaining = delay;
            this.active = false;
        }

        this.duration = duration;
        this.elapsed = 0;
    }

    /**
     * @public
     * Have the animation apply nessessary changes to the provided component. 
     * Handles timing, then calss applyChange implemented in child. 
     * @param {Number} dTime 
     * @param {Component} component 
     * @public
     */
    update(dTime, component) {
        if (!this.active) { // Change to delayRemaining <= 0 ?
            if (this.delayRemaining - dTime <= 0) {
                // Apply changes for correct amount of time
                dTime = dTime - this.delayRemaining; 
                this.active = true;
                this.delayRemaining = 0;
            } else {
                this.delayRemaining -= dTime;
                return; // Still more delay, do not apply changes
            }
        }

        if (this.elapsed + dTime >= this.duration) {
            dTime = this.duration - this.elapsed;
        }
        this.elapsed += dTime;
        
        this.applyChange(dTime, component);
    }

    /**
     * @public
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
     * @param {Point} scaleRatio - Amount to scale by
     * @param {Number} duration - Time to scale over
     * @param {Number} delay - Time to delay for
     */
    constructor(scaleRatio, duration, delay) {
        super(duration, delay);
        this.scaleRatio = scaleRatio;
        this.scaledBy = new Point(1, 1);
    }

    /**
     * Scales the provided component by the amount required given the amount of time passed
     * and this animations target scaling. 
     * @param {Number} dTime - Amount of time since last application
     * @param {Component} component - Component to apply to
     */
    applyChange(dTime, component) {
        let deltaScale = this.scaleRatio.multiply(dTime / this.duration);

        if (this.scaleRatio.x >= 1) {
            if (deltaScale.x + this.scaledBy.x >= this.scaleRatio.x) {
                deltaScale.x = this.scaleRatio.x - this.scaledBy.x;
            }
        } else {
            if (this.scaledBy.x - deltaScale.x <= this.scaleRatio.x) {
                deltaScale.x = this.scaledBy.x - this.scaleRatio.x;
            }
        }

        if (this.scaleRatio.y >= 1) {
            if(deltaScale.y + this.scaledBy.y >= this.scaleRatio.y) {
                deltaScale.y = this.scaleRatio.y - this.scaledBy.y;
            }
        } else {
            if (this.scaledBy.y - deltaScale.y <= this.scaleRatio.y) {
                deltaScale.y = this.scaledBy.y - this.scaleRatio.y;
            }
        }


        // Need to account for fact that component.scale() uses values relative to its size
        // Must basically scale down then up to new value. 
        let actualScaleFactor = new Point(1, 1);
        if (this.scaleRatio.x >= 1) {
            actualScaleFactor.x = deltaScale.x + this.scaledBy.x;
        } else {
            actualScaleFactor.x = this.scaledBy.x - deltaScale.x;
        }

        if (this.scaleRatio.y >= 1) {
            actualScaleFactor.y = deltaScale.y + this.scaledBy.y;
        } else {
            actualScaleFactor.y = this.scaledBy.y - deltaScale.y;
        }

        actualScaleFactor = actualScaleFactor.divide(this.scaledBy);
        
        component.scale(actualScaleFactor.x, actualScaleFactor.y);

        if (this.scaleRatio.x > 1) {
            this.scaledBy.x += deltaScale.x;
        } else {
            this.scaledBy.x -= deltaScale.x;
        }

        if (this.scaleRatio.y > 1) {
            this.scaledBy.y += deltaScale.y;
        } else {
            this.scaledBy.y -= deltaScale.y;
        }
    }


}

class RotatingAnimation extends Animation {

    /**
     * Animation which tweens rotating a Component the provided degrees over the 
     * provided amount of time.
     * @param {Number} degreeChange - Amount to rotate by
     * @param {Number} duration - Time to apply rotation over
     * @param {Number} delay - Time to delay for 
     */
    constructor(degreeChange, duration, delay) {
        super(duration, delay);
        this.degreeChange = degreeChange;
        this.rotatedBy = 0;
    }

    /**
     * Applies the appriate amount of rotation to the provided component based on the
     * time that has passed and overall change.
     * @param {Number} dTime - Time since last application
     * @param {Component} component - Component to apply to
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
     * @param {Point} distChange - Amount to translate by
     * @param {Number} duration - Time to apply translation over
     * @param {Number} delay - Time to delay for
     */
    constructor(distChange, duration, delay) {
        super(duration);
        this.distChange = distChange;
        this.translatedBy = new Point(0, 0);
        
    }

    /**
     * Applies amount of translation given the amount of time since the
     * last application.
     * @param {Number} dTime - Time since last application
     * @param {Component} component - Component to apply to 
     */
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