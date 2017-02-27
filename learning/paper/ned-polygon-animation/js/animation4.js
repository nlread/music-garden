paper.install(window);

let forceGenerators = [];
let movingPlants = [];

function setup() {
    console.log('setting up');
    paper.setup('paperCanvas');
    
    leafGroup = project.importSVG(document.getElementById('leafModel'), {'insert': false});
    leafPath = leafGroup.children[1]; 
    leafPath.setPosition(100, 100);
    leafPath.strokeColor = 'green';
    movingPlants.push(new PhysicsPlant(leafPath, [0]));
    
    polyPath = Path.RegularPolygon(new Point(0, 0), 7, 100);
    polyPath.strokeColor = 'black';
    polyPath.fillColor = 'steelblue';
    polyPath.setPosition(400, 400);
    movingPlants.push(new PhysicsPlant(polyPath, [2, 3]));
        
    project.activeLayer.addChild(leafPath);
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
    let forceVector = event.point.subtract(downPoint).multiply(10);
    applyForce(event.point, 3);
}


function applyForce(startPoint, magnitude) {
    let forceGen = new UniformCircularForce(startPoint, magnitude, .7);
    forceGenerators.push(forceGen);
    console.log('creating force');
}