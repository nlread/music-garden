class Utils {
    
    static importSVG(svgID) {
        return project.importSVG(svgID, {'insert': false});
    }
    
    static importSVG2(path, success, failure) {
        project.importSVG(path, {
            'insert' : false, 
            onLoad : success, 
            onError : failure
        });    
    }
    
    static importSVGToPhysicsPlant(path, success, error) {
        this.importSVG2(
            path, 
            function(importedData) {
                let paths = Utils.getPathsFromImportedData(importedData);
                let physicsPlant = new PhysicsPlant(importedData, paths, []);
                success(physicsPlant);
            }, 
            function(err) {
                error(err);
        });
    }
    
    static getPathsFromImportedData(importedData) {
        let paths = [];
        let groups = [];
        groups.push(importedData);
        
        while(groups.length > 0) {
            let group = groups.pop();
            for(let i=0; i<group.children.length; i++) {
                let obj = group.children[i]; 
                console.log(typeof(obj));
                if (obj instanceof Path) {
                    paths.push(obj);
                } else if(obj instanceof Group || obj instanceof Group) {
                    groups.push(obj);
                }
            }
        }
        
        return paths;
    }
    
    
    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
}   