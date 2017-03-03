paper.install(window);


let forces = [];
let movingPlants = [];
function setup() {
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
    movingPlants.push(new PhysicsPlant(polyPath, [2, 4, 3 ]));
        
    project.activeLayer.addChild(leafPath);
    project.activeLayer.addChild(polyPath);
    
    tool = new Tool();
    tool.onMouseDown = onMouseDown;
    tool.onMouseUp = onMouseUp;
    
    paper.view.onFrame = onFrame;
}
function onFrame(event) {
    let dTime = event.delta;
    
    changeForce(dTime)
    let forceTotal = new Point(0, 0);
    for(let i=0; i<forces.length; i++) {
        forceTotal.x += forces[i].x;
        forceTotal.y += forces[i].y;
    }
    
    for(let i=0; i<movingPlants.length; i++) {
        movingPlants[i].applyForce(dTime, forceTotal);
    }
}

let timeElapsed = 0;
let timeApplyFor = .7;
function changeForce(dTime) {
    let forEnd = forces.length;
    for(let i=0; i<forEnd; i++) {
        let force = forces[i];
        force.timeElapsed += dTime;
        if (force.timeElapsed > force.timeApplyFor) {
            forces.splice(i, 1);
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
    let forceVector = event.point.subtract(downPoint).multiply(30);
    applyForce(forceVector.x, forceVector.y);
}


function applyForce(xForce, yForce) {
    let force = new Point(xForce, yForce);
    force.timeElapsed = 0;
    force.timeApplyFor = .1;
    forces.push(force);
}