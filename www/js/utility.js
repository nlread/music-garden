var utils {
    importSVG: function(svgID) {
        return project.importSVG(svgID, {'insert': false});
    }, 
    loadPathsFromCSV: function(svgID) {
        let group = this.importSVG(svgID);
        let paths = [];
        for(let i=0; i<group.length; i++) {
            paths.push
        }
    }, 
}