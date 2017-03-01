paper.install(window);

let forceGenerators = [];
let movingPlants = [];
let pathsFromComplexMode;
function setup() {
    console.log('setting up');
    paper.setup('paperCanvas');
    
        leafGroup = project.importSVG(document.getElementById('leafModel'), {'insert': false});
        leafPath = leafGroup.children[1]; 
    for(let i=0; i<6; i++) {
        let oneLeaf = leafPath.clone();
        oneLeaf.setPosition(100 + 120 * i, 150);
        oneLeaf.strokeColor = 'green';
        movingPlants.push(new PhysicsPlant(oneLeaf, [0]));
        project.activeLayer.addChild(oneLeaf);
    }
    
    pathsFromComplexMode = Utils.loadPathsFromSVG('model');
    for(let i=0; i<pathsFromComplexMode.length; i++) {
        let onePath = pathsFromComplexMode[i];
        onePath.setPosition(onePath.getPosition().add(new Point(400, 400)));
        onePath.srokeColor = 'blue';
        movingPlants.push(new PhysicsPlant(onePath, []));
        project.activeLayer.addChild(onePath);
    }
    
    polyPath = Path.RegularPolygon(new Point(0, 0), 7, 100);
    polyPath.strokeColor = 'black';
    polyPath.fillColor = 'steelblue';
    polyPath.setPosition(400, 400);
    movingPlants.push(new PhysicsPlant(polyPath, [2, 3]));
    project.activeLayer.addChild(polyPath);
            
    tool = new Tool();
    tool.onMouseDown = onMouseDown;
    tool.onMouseUp = onMouseUp;
    
    paper.view.onFrame = onFrame;
}

function onFrame(event) {
    let dTime = event.delta;
    
    updateForces(dTime)
        
    for(let i=0; i<movingPlants.length; i++) {
        movingPlants[i].applyForces(dTime, forceGenerators);
    }
    
    removeInvalidForces();
}

let timeElapsed = 0;
let timeApplyFor = .7;

function updateForces(dTime) {
    for(let i=0; i<forceGenerators.length; i++) {
        forceGenerators[i].update(dTime);
    }
}

function removeInvalidForces() {
    let forEnd = forceGenerators.length;
    for(let i=0; i<forEnd; i++) {
        let forceGen = forceGenerators[i];
        if (!forceGen.isValid()) {
            forceGenerators.splice(i, 1);
            i--;
            forEnd--;
        }
    }
}


let downPoint = new Point(0, 0);;
function onMouseDown(event) {
    downPoint.x = event.point.x;
    downPoint.y = event.point.y;
}

function onMouseUp(event) {
    let forceVector = event.point.subtract(downPoint).multiply(.5);
    applyForce(event.point, forceVector);
}


function applyForce(startPoint, forceVector) {
    // let forceGen = new MovingCircularForce(startPoint, magnitude, 500, 100, 6);
    let forceGen = new MovingDirectionalForce(startPoint, forceVector, 300, 200, 3);
    forceGenerators.push(forceGen);
}