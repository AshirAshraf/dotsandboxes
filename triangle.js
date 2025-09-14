import { Line } from "./line.js";
export class Triangle {
    SVG_NS = "http://www.w3.org/2000/svg";
    /**
     * traingle event handler weakMap
     */
    objEventHandler = new WeakMap();
    /**
     * coordinates in the svg viewbox
     * [60, 60], [70,70], [80,80]
     */
    arrCoordinates = [];
    /**
     * coordinates og the box the triangle is in
     */
    arrBoxCoordinates = [];
    /**
     * indices of the box triangle is in
     */
    arrBoxIndices = [];

    /**
     * triangle element ref
     */
    objTriangle
    /**
     * square container
     */
    objSquareContainer
    /**
     * line associated
     */
    objLine
    /**
     * user info
     */
    objUser
    constructor(
        [x1, y1],
        [x2, y2],
        [x3, y3],
        arrBoxCoordinates,
        // arrBoxIndices,
        objSquare, // square class instance of the container square
        objUser
        // objLine // line associated with triangle
    ) {
        this.objTriangle = this.makeAndSetTriangle([x1, y1], [x2, y2], [x3, y3]);
        this.arrCoordinates = [[x1, y1], [x2, y2], [x3, y3]];
        this.arrBoxCoordinates = arrBoxCoordinates;
        // this.arrBoxIndices = arrBoxIndices;
        this.objSquareContainer = objSquare;
        // this.objLine = objLine;
        this.objUser = objUser;
    }
    /**
     * 0.....1
     * .     .
     * .     .
     * 3.....2
     * 0,1 - 1,2 - 2,3 - 3,0
     * x3 y3 is the middle of the box xoordinates
     */
    makeAndSetTriangle([x1, y1], [x2, y2], [x3, y3]) {
        const polygon = document.createElementNS(this.SVG_NS, "polygon");
        polygon.setAttribute("points", `${x1},${y1} ${x2},${y2} ${x3},${y3}`);
        polygon.classList.add("triangle");
        polygon.classList.add("untouched");
        // polygon.addEventListener("click",)
        return polygon;
    }

    getTriangle() {
        return this.objTriangle;
    }

    getStraightLineElement(strStroke = "white", objTriangle = this.objTriangle) {
        objLine = new Line(this.arrCoordinates[0], this.arrCoordinates[1], false, strStroke).objLine;
        objTriangle.parentElement.append(objLine);
        return objLine;
    }

    eventListenerWrapper(objTriangle = this.objTriangle) {
        function triEventListener(){
            this.getStraightLineElement();
        }
    }

    sideFilled(strColor, strPlayerName){
        return this.objSquareContainer.lineDrawn(strColor, strPlayerName)
    }


}