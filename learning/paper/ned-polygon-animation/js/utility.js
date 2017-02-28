class Utils {
    
    static importSVG(svgID) {
        return project.importSVG(svgID, {'insert': false});
    }
    
    static loadPathsFromSVG(svgID) {
        let importedData = this.importSVG(svgID);
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
                } else if(obj instanceof Group) {
                    groups.push(obj);
                }
            }
        }
        
        return paths;
    }
}   