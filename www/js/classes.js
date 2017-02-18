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