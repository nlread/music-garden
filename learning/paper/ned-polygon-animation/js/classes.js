class Component {
    
    constructor(paperPath) {
        this.paperPath = paperPath;
        
        this._position = paperPath.getPosition().clone();
        this._orientation = paperPath.getRotation();
        this._scaleFactor = paperPath.getScaling().clone();
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

class PhysicsPlant extends Component {
    
    
    constructor(paperPath, staticSegments) {
        super(paperPath);
        this.staticSegments = staticSegments;
        
        this.propsSet = [];
        for(let i=0; i<paperPath.segments.length; i++) {
            let props = new SegmentProperties(paperPath.segments[i].point)
            this.propsSet.push(props);
        }
    }
    
    applyForce(dTime, force) {
        for(let i=0; i<this.propsSet.length; i++) {
            if (this.staticSegments.includes(i)) {
                continue;
            }
            let props = this.propsSet[i];
            let seg = this.paperPath.segments[i];
            
            // Handle Velocity
            let dPosV = props.velocity.multiply(dTime);
            
            // Handle Acceleration
            let dPosA = props.acceleration.multiply(dTime * dTime);

            seg.point = seg.point.add(dPosV).add(dPosA);
            
            if(i==4)
                console.log(props.acceleration);
            
            props.velocity = props.velocity.add(props.acceleration.multiply(dTime)).multiply(.97);
            props.acceleration = force.add(props.base.subtract(seg.point).multiply(9));
        }
    }
    
}

class SegmentProperties {
    constructor(basePoint, velocity, acceleration) {
        if(arguments.length >= 1) {
            this.base = basePoint.clone();
        } else {
            throw 'no base point provided';
        }
        
        if(arguments.length >= 2) {
            this.velocity = velocity.clone();
        } else {
            this.velocity = new Point(0, 0);
        }
        
        if(arguments.length >= 3) {
            this.acceleration = acceleration.clone();
        } else {
            this.acceleration = new Point(0, 0);
        }
        
    }
}