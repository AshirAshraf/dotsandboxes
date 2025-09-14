export class Vertice {
    SVG_NS = "http://www.w3.org/2000/svg";
    /**
     * coordinates in the svg viewbox
     * [60, 60], [70,70]
     */
    arrCoordinates = [];
    /**
     * indices
     * [0,0], [0,1]
     */
    arrIndices = [];
    /**
     * circle element ref
     */
    objCircle

    createAndSetCircle(x,y){
        let circle = document.createElementNS(this.SVG_NS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        return circle
    }

    constructor(
        [x,y], // svg viewbox coordinates
        [i,j] // indices
    ){

        console.log(this.SVG_NS)
        this.objCircle = this.createAndSetCircle(x,y);
        this.arrCoordinates = [x,y];
        this.arrIndices = [i,j];
    }

    getCircle(){
        return this.objCircle;
    }
}