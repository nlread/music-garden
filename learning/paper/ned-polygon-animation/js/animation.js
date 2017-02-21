paper.install(window);

let leafGroup;
let leafPath;

let leafBasePositions;
let leafAccelerations;
let leafVelocities;
let leafStatics;

let forces = [];

let tool;

function setup() {
    paper.setup('paperCanvas');
    
    leafGroup = project.importSVG(document.getElementById('leafModel'), {'insert': false});
    leafPath = leafGroup.children[1]; 
    leafPath = Path.RegularPolygon(new paper.Point(0, 0), 7, 100);
    leafPath.strokeColor = 'black';
    leafPath.fillColor = 'steelblue';
    leafPath.setPosition(400, 400);
    
    leafBasePositions = [];
    leafAccelerations = [];
    leafVelocities = [];
    for(let i=0; i<leafPath.segments.length; i++) {
        let segment = leafPath.segments[i];
        leafBasePositions.push(new Point(segment.point.x, segment.point.y));
        leafAccelerations.push(new Point(0, 0));
        leafVelocities.push(new Point(0, 0));
    }
    
    leafStatics = [2, 3];
    
    project.activeLayer.addChild(leafPath);
    
    tool = new Tool();
    tool.onMouseDown = onMouseDown;
    tool.onMouseUp = onMouseUp;
    
    paper.view.onFrame = onFrame;
    
}

function manipulatePath() {
    for(let i=0; i<leafPath.segments.length; i++) {
        let segment = leafPath.segments[i];
        segment.point.x += 10;
    }
}

function onFrame(frameEvent) {
    let dTime = frameEvent.delta;
    
    changeForce(dTime);
    for(let i=0; i<leafPath.segments.length; i++) {
        if(leafStatics.includes(i)) {
            continue;
        }
        let segment = leafPath.segments[i];
        
        segment.point.x += leafVelocities[i].x * dTime + leafAccelerations[i].x * dTime * dTime;
        segment.point.y += leafVelocities[i].y * dTime + leafAccelerations[i].y * dTime * dTime;

        leafVelocities[i].x += leafAccelerations[i].x * dTime;
        leafVelocities[i].y += leafAccelerations[i].y * dTime;

        leafVelocities[i].x *= .94;
        leafVelocities[i].y *= .94;
        
        let base = leafBasePositions[i];
        leafAccelerations[i].x = (base.x - segment.point.x) * 5;
        leafAccelerations[i].y = (base.y - segment.point.y) * 5;
    
        for(let forceIndex=0; forceIndex<forces.length; forceIndex++) {
            let force = forces[forceIndex];
            leafAccelerations[i].x += force.x;
            leafAccelerations[i].y += force.y;
        }
                
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
    let forceVector = event.point.subtract(downPoint).multiply(5);
    applyForce(forceVector.x, forceVector.y);
}


function applyForce(xForce, yForce) {
    let force = {}
    force.timeElapsed = 0;
    force.timeApplyFor = .7;
    force.x = xForce;
    force.y = yForce;
    forces.push(force);
}