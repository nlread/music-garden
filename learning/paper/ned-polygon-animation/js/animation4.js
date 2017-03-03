paper.install(window);

let forceGenerators = [];
let movingPlants = [];
let pathsFromComplexMode;
let isActive = true;
function setup() {

    window.onfocus = function () { 
        console.log('focuing');
        
    isActive = true; 
    }; 

    window.onblur = function () { 
        console.log('bluring');
        
    isActive = false; 
    }; 


    console.log('setting up');
    paper.setup('paperCanvas');
    
//        leafGroup = project.importSVG(document.getElementById('leafModel'), {'insert': false});
//        leafPath = leafGroup.children[1]; 
//    for(let i=0; i<6; i++) {
//        let oneLeaf = leafPath.clone();
//        oneLeaf.setPosition(100 + 120 * i, 150);
//        oneLeaf.strokeColor = 'green';
//        movingPlants.push(new PhysicsPlant(oneLeaf, [0]));
//        project.activeLayer.addChild(oneLeaf);
//    }
    
    loadComplexSVG('img/greenflower.svg', new Point(300, 500));
    loadComplexSVG('img/redflower.svg', new Point(800, 300));
//    loadComplexSVG('img/jadeflower.svg', new Point(700, 800));
    loadComplexSVG('img/succulentflower.svg', new Point(900, 700));
    
//    polyPath = Path.RegularPolygon(new Point(0, 0), 7, 100);
//    polyPath.strokeColor = 'black';
//    polyPath.fillColor = 'steelblue';
//    polyPath.setPosition(400, 400);
//    movingPlants.push(new PhysicsPlant(polyPath, [2, 3]));
//    project.activeLayer.addChild(polyPath);
            
    tool = new Tool();
    tool.onMouseDown = onMouseDown;
    tool.onMouseUp = onMouseUp;
    
    paper.view.onFrame = onFrame;
}

function loadComplexSVG(path, position) {
    pathsFromComplexMode = Utils.loadPathsFromSVG2(path, 
        function(paths) {
            importPaths(paths, position);   
        }, 
        function(err) {
            console.log(err);
        });
}

function importPaths(pathsFromComplexNode, position) {
  for(let i=0; i<pathsFromComplexNode.length; i++) {
        let onePath = pathsFromComplexNode[i];
        onePath.setPosition(position.x, position.y); //onePath.getPosition().add(position)
        onePath.scale(1.8, 1.8);
        onePath.srokeColor = 'blue';
        movingPlants.push(new PhysicsPlant(onePath, []));
        project.activeLayer.addChild(onePath);
    }
}


function onFrame(event) {
    if(!isActive) {
        return;
    }
    let dTime = event.delta;
    
    updateForces(dTime)
        
    for(let i=0; i<movingPlants.length; i++) {
        movingPlants[i].applyForces(dTime, forceGenerators);
    }
    
    removeInvalidForces();

    makeWind(4);
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
    applyForce2(event.point, $('#strengthAmount')[0].value);
    
}

function makeWind(randFactor) {
    if (Math.floor(Math.random() * 100) < randFactor) {
        console.log('adding wind - ' + forceGenerators.length);
        
        let forceVector = new Point(30, 0);
        let startPoint = new Point(0, Math.floor(Math.random() * 800));
        if (Math.random() > .5) {
            forceVector.x *= -1;
            startPoint.x = 1200;
        }
        applyForce(startPoint, forceVector);
    }
}

function applyForce(startPoint, forceVector) {
    // let forceGen = new MovingCircularForce(startPoint, magnitude, 500, 100, 6);
    // let forceGen = new MovingDirectionalForce(startPoint, forceVector, 300, 200, 3);
     let forceGen = new MovingBoxForce(startPoint, forceVector, 300, 200, 400, 5);

    forceGenerators.push(forceGen);
}

function applyForce2(startPoint, mag) {
    let forceGen = new MovingCircularForce(startPoint, mag, 250, 100 , 1.8);
    forceGenerators.push(forceGen);
}