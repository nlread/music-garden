let objects;
let modelPaths;
let modelScope;

console.log(paper);

class Object {
    
    constructor(paperPath) {
        this.paperPath = paperPath;
        this.baseCurves = $.extend(true, [], paperPath.curves);        
        this.baseSegments = []

        for(let i=0; i<paperPath.segments.length; i++) {
            this.baseSegments.push(paperPath.segments[i].clone());
        }
        
        this._baseCurvesDirty = false;
        
        // Setup Class Variables
//        this._position = new paper.Point(0, 0);
//        this._scaleFactor = new paper.Point(1, 1);
//        this._orientation = 0.0;
//        this._currentPosition = new paper.Point(0, 0);
//        this._currentScaleFactor = new paper.Point(1, 1);
//        this._currentOrientation = 0.0;
        
        this._position = paperPath.getPosition().clone();
        this._orientation = paperPath.getRotation();
        this._scaleFactor = paperPath.getScaling().clone();
        this._currentPosition = paperPath.getPosition().clone();
        this._currentOrientation = paperPath.getRotation();
        this._currentScaleFactor = paperPath.getScaling().clone();
        
        paperPath.position;
    }
    
    resetCurves() {
//        let paperCurves = this.paperPath.curves;
//        for(let i=0; i<paperCurves.length; i++) {
//            paperCurves[i].x = this.baseCurves[i].x;
//            paperCurves[i].y = this.baseCurves[i].y;
//        }
        
        let paperSegments = this.paperPath.segments;
        for(let i=0; i<paperSegments.length; i++) {
            paperSegments[i].handleIn.x = this.baseSegments[i].handleIn.x;
            paperSegments[i].handleIn.y = this.baseSegments[i].handleIn.y;
            paperSegments[i].handleOut.x = this.baseSegments[i].handleOut.x;
            paperSegments[i].handleOut.y = this.baseSegments[i].handleOut.y;
        }
    }
    
    applyTransformations() {
        if(this._baseCurvesDirty) {
            this.resetCurves();
            
            this.paperPath.translate(this._position);
            this.paperPath.scale(this._scaleFactor);
            this.paperPath.rotate(this._orientation);
            this._baseCurvesDirty = false;
        } else {
            let deltaPos = this._position.subtract(this._currentPosition);

            let deltaScale;
            if(this._currentScaleFactor.x == 0 || this._currentScaleFactor)
                deltaScale = new paper.Point(1, 1);
            else
                deltaScale = this._scaleFactor.multiply(this._currentScaleFactor);

            let deltaOrientation = this._orientation - this._currentOrientation;

            this.paperPath.translate(deltaPos);
            this.paperPath.scale(deltaScale);
            this.paperPath.rotate(deltaOrientation);
        }
    
        this._currentPosition.x = this._position.x;
        this._currentPosition.y = this._position.y;
        this._currentScaleFactor.x = this._scaleFactor.x;
        this._currentScaleFactor.y = this._scaleFactor.y;
        this._currentOrientation = this._orientation;   
    }

    getModel(paperScope) {
        let temp = paper;
        paper = paperScope;
        let modelPath = new paperScope.Path();
        for(let i=0; i<this.baseCurves.length; i++) {
            modelPath.curves.push(this.baseCurves[i]);
        }
        
        for(let i=0; i<this.baseSegments.length; i++) {
            modelPath.segments.push(this.baseSegments[i]);
        }
        paper = temp;
        return modelPath;
    }
    
    setPosition(x, y) {
        this._position.x = x;
        this._position.y = y;
    }
    
    translate(x, y) {
        console.log('setting pos of object');
        this._position.x += x;
        this._position.y += y;
    }
    
    setScaleFactor(scaleFactorX, scaleFactorY) {
        this._scaleFactor.x = scaleFactorX;
        this._scaleFactor.y = scaleFactorY;
    }
    
    scale(scaleFactorX, scaleFactorY) {
        this._scaleFactor.x *= scaleFactorX;
        this._scaleFactor.y *= scaleFactorY; 
    }
    
    setOrientation(angle) {
        this._orientation = angle;
    }
    
    rotate(angle) {
        this._orientation += angle;
    }
}

class Transformation {
    
    constructor() {
        
    }
    
    
}

function setup() {
    var canvas = $("#paperCanvas");
    paper.setup("paperCanvas");
    objects = [];
    paper.view.onFrame = onFrame;
    
    modelScope = new paper.PaperScope();
    modelScope.setup("modelCanvas");  
    modelPaths = [];
}

var modelPath;
function createObjects() {
    console.log("create objects");
    
    let path = paper.Path.RegularPolygon(new paper.Point(0, 0), 7, 100);
    path.fillColor = "aqua";
    let object = new Object(path);
    objects.push(object);
    
    modelPath = object.getModel(modelScope);
    modelPath.fillColor = "red";
    modelPath.strokeColor = "red"
    console.log(modelPath);
    modelPaths.push(modelPath);
    
}

function onFrame() {
    for(let i=0; i<objects.length; i++) {
        objects[i].rotate(3);
        objects[i].applyTransformations();
    }
}

function modBase() {
    for(let i=0; i<objects.length; i++) {
        let o = objects[i];
        o.baseSegments[0].handleIn.x = 400;
        o._baseCurvesDirty = true;
    }
}

function prepChanges() {
    console.log("prepping objects");
    
    for(let i=0; i<objects.length; i++) {
        let object = objects[i];
        object.rotate(60);
        object.translate(50, 160)
    }
}

function applyTransform() {
    console.log("applying transformations");
    
    for(let i=0; i<objects.length; i++) {
        let object = objects[i];
        object.applyTransformations();
    }
}

function displayPolygon() {
    leafPolygon = paper.Path.RegularPolygon(new paper.Point(300, 300), 6, 50);
    leafPolygon.fillColor = '#e9e9ff';
    beginPoint = leafPolygon.segments[1].point;
    //leafPolygon.selected = true;
    leafPolygon.onFrame = onFrameLeafPoly;
}

function drawPath(x1, y1, x2, y2) {
    console.log("path: (" + x1 + "," + y1 + ") -> (" + x2 + "," + y2 + ")");
    var path = new paper.Path();
    path.strokeWidth = 10;
    path.strokeColor = 'red';
    path.opacity = 0.5;
    path.blendMode = 'multiply';
    
    var start = new paper.Point(x1, y1);
    var end = new paper.Point(x2, y2);
    path.moveTo(start);
    path.lineTo(end);
    paths.push(path);
//    paper.view.draw();
}

var prevScale = 1;
function onFrameLeafPoly(event) {
//    var pointToMove = leafPolygon.segments[1].point;
//    pointToMove.x = Math.sin(event.time) * 4 + beginPoint.x;
//    pointToMove.y = Math.cos(event.time) * 4 + beginPoint.y;
//    leafPolygon.segments[1].point = pointToMove;
//    leafPolygon.size(1);
//    leafPolygon.scale(1 / prevScale);
    
    var newScale = Math.sin(event.time) + 1.1;
    var scaleBy = newScale * (1/prevScale);
    leafPolygon.scale(scaleBy);
    console.log(scaleBy);
    prevScale = newScale;
    
    
    
}

function onClipLeafPoly(event) {
    console.log("Clicked");
}

function performTiming(nElements, nCopy) {
    let before = performance.now();
    deepCopyTest(nElements, nCopy);
    console.log("Deep copy: " + (performance.now() - before));
    
    before = performance.now();
    transferTest(nElements, nCopy);
    console.log("Transfer: " + (performance.now() - before));

}

function deepCopyTest(nElements, nCopy) {
    let base = [];
    for(let i=0; i<nElements; i++) {
        base.push(new paper.Point(i, 2*i));
    }
    
    for(let i=0; i<nCopy; i++) {
        let copy = $.extend(true, [], base);
    }
}

function transferTest(nElements, nTransfer) {
    let base = [];
    let other = [];
    for(let i=0; i<nElements; i++) {
        base.push(new paper.Point(i, 2*i));
        other.push(new paper.Point(0, 0));
    }
    
    for(let i=0; i<nTransfer; i++) {
        for(let p=0; p<nElements; p++) {
            other[p].x = base[p].x;
            other[p].y = base[p].y;
        }
    }
}
 