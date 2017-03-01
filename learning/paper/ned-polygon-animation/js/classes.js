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
    
    applyForce(dTime, forceGenerator) {
        for(let i=0; i<this.propsSet.length; i++) {
            if (this.staticSegments.includes(i)) {
                continue;
            }
            
            let props = this.propsSet[i];
            let seg = this.paperPath.segments[i];
            let force = forceGenerator.getForce(seg.point);
            
            // Handle Velocity
            let dPosV = props.velocity.multiply(dTime);
            
            // Handle Acceleration
            let dPosA = props.acceleration.multiply(dTime * dTime);

            seg.point = seg.point.add(dPosV).add(dPosA);
            
            props.velocity = props.velocity.add(props.acceleration.multiply(dTime)).multiply(.97);
            props.acceleration = force.add(props.base.subtract(seg.point).multiply(9));
        }
    }
    
    applyForces(dTime, forceGenerators) {
        for(let i=0; i<this.propsSet.length; i++) {
            
            if (this.staticSegments.includes(i)) {
                continue;
            }
            
            
            let forceTotalAtPoint = new Point(0, 0);
            
            let props = this.propsSet[i];
            let seg = this.paperPath.segments[i];
            
            for(let f=0; f<forceGenerators.length; f++) {
                forceTotalAtPoint = forceTotalAtPoint.add(forceGenerators[f].getForce(seg.point));
            }
            
            // Handle Velocity
            let dPosV = props.velocity.multiply(dTime);
            
            // Handle Acceleration
            let dPosA = props.acceleration.multiply(dTime * dTime);

            seg.point = seg.point.add(dPosV).add(dPosA);
            
            props.velocity = props.velocity.add(props.acceleration.multiply(dTime)).multiply(.97);
            props.acceleration = forceTotalAtPoint.add(props.base.subtract(seg.point).multiply(9));
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

/*
 * Basically a Uniform Directional Force
 */
class ForceGenerator {
    constructor(forceVector, timeApplyFor) {
        this.forceVector = forceVector;
        this.timeApplyFor = timeApplyFor;
        this.timeElapsed = 0;
    }
    
    getForce(point) {
        if(this.doesEffect(point)) {
            return this.forceVector;
        } else {
            return new Point(0, 0);
        }
    }

    doesEffect(point) {
        return true;
    }
    
    update(dTime) {
        this.timeElapsed += dTime;
    }
    
    isValid() {
        return this.timeApplyFor > this.timeElapsed;
    }
}

class MovingDirectionalForce extends ForceGenerator {
    
    constructor(forceOrigin, forceVector, speed, gap, timeApplyFor) {
        super(forceVector, timeApplyFor)
        this.forceDir = forceVector.normalize();
        this.forceOrigin = forceOrigin;
        this.speed = speed;
        this.gap = gap;
        this.leadingDist = 0;

        this.leadingVec = new Point(0, 0);
        this.trailingVec = new Point(0, 0);
    }

    doesEffect(point) {
        // Vectors from the normal point to the point in evaluating
        let dirToLeading = point.subtract(this.leadingVec);
        let dirToTrailing = point.subtract(this.trailingVec);
        
        // Dot Product > 0 => facing same direction 
        let beforeLeading = Utils.dot(this.forceDir, dirToLeading) < 0;
        let afterTrailing = Utils.dot(this.forceDir, dirToTrailing) > 0;
        
        return beforeLeading && afterTrailing;
    }

    update(dTime) {
        super.update(dTime);
        this.leadingDist += dTime * this.speed;   
        this.updateLeadingTrailing();     
    }

    updateLeadingTrailing() {
        // Vectors normal to the leading and trailing lines
        this.leadingVec = this.forceOrigin.add(this.forceDir.multiply(this.leadingDist + this.gap));
        this.trailingVec = this.forceOrigin.add(this.forceDir.multiply(this.leadingDist));
    }
}

class MovingBoxForce extends MovingDirectionalForce {
    
    constructor(forceOrigin, forceVector, speed, height, width, timeApplyFor) {
        super(forceOrigin, forceVector, speed, height, timeApplyFor);
        this.height = height/2;
        this.halfWidth = width/2;
    }

    doesEffect(point) {
        let dirToTrailing = point.subtract(this.trailingVec);
        return dirToTrailing.x > -this.halfWidth && dirToTrailing.x < this.halfWidth &&
               dirToTrailing.y > 0 && dirToTrailing.y < this.height;    
    }
}

class UniformCircularForce extends ForceGenerator {
    
    constructor(forceOrigin, forceMagnitude, timeApplyFor) {
        super(new Point(0, 0), timeApplyFor);
        this.forceMagnitude = forceMagnitude;
        this.forceOrigin = forceOrigin;
    }
    
    getForce(point) {
        if (this.doesEffect(point)) {
            return point.subtract(this.forceOrigin).multiply(this.forceMagnitude);
        } else { 
            return new Point(0, 0);
        }
    }
}

class MovingCircularForce extends UniformCircularForce {

    constructor(forceOrigin, forceMagnitude, speed, gap, timeValidFor) {
        super(forceOrigin, forceMagnitude, timeValidFor);
        this.speed = speed;
        this.gap = gap;
        this.leadingDist = 0;
    }

    update(dTime) {
        super.update(dTime);
        this.leadingDist += dTime * this.speed;
        
    }

    doesEffect(point) {
        point = point.subtract(this.forceOrigin);
        let dist =  point.x * point.x + point.y * point.y
        let leadingContains = dist < Math.pow(this.leadingDist, 2);
        let trailingContains = dist < Math.pow(this.leadingDist - this.gap, 2);
        return leadingContains && !trailingContains;
    }

}
