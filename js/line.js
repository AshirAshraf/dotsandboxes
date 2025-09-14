export class Line {
    SVG_NS = "http://www.w3.org/2000/svg";
    /**
     * coordinates
     *[60, 60], [70,70]
     */
    arrCoordinates = [];
    /**
     * line element ref
     */
    objLine
    /**
     * dotted or straight
     */
    blnDotted = true;
    /**
     * stroke color
     */
    strStroke = "white";

    constructor([x1, y1], [x2, y2], blnDotted = true, strStroke = "white"){
        this.blnDotted = blnDotted;
        this.strStroke = strStroke;
        this.objLine = this.makeLine([x1, y1], [x2, y2], blnDotted, strStroke)
    }

    makeLine([x1, y1], [x2, y2], blnDotted, strStroke) {
        let line = document.createElementNS(this.SVG_NS, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        if (strStroke) line.setAttribute("stroke", strStroke);
        if (blnDotted) line.classList.add('dotted');
        return line;
    }

    getLine(){
        return this.objLine;
    }
}