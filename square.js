

export class Square {
    SVG_NS = "http://www.w3.org/2000/svg";
    /**
     * coordinates in the svg viewbox
     * [60, 60], [70,70], [80,80], [90,90]
     */
    arrCoordinates = [];

    /**
     * number of sides drawn\
     * should start at 0, end at 4
     */
    intSideDrawn = 0;

    /**
     * color of square
     * @param {*} param0 
     * @param {*} strFill 
     * may need to add avatar as well
     */
    strFill = "transparent";

    /**
     * element ref of the square polygon
     */
    objSquare

    constructor([[x1, y1], [x2, y2], [x3, y3], [x4, y4]], strFill = this.strFill){
        this.arrCoordinates = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]];
        this.strFill = strFill;
        this.objSquare = this.makeSquare([[x1, y1], [x2, y2], [x3, y3], [x4, y4]], strFill);

    }

    /**
      * 
      * @param {*} param0 box coordinates
      * @param {*} objPoly triangle element ref
      */
    makeSquare([[x1, y1], [x2, y2], [x3, y3], [x4, y4]], strFill) {
        const polygon = document.createElementNS(this.SVG_NS, "polygon");
        polygon.setAttribute("points", `${x1+10},${y1+10} ${x2-10},${y2+10} ${x3-10},${y3-10} ${x4+10},${y4-10}`);
        polygon.setAttribute("fill", strFill);
        return polygon;

    }

    /**
     * change color to indicate completion
     */
    changeSquareColor(strFill){
        this.strFill = strFill;
        this.objSquare.setAttribute("fill", strFill);
    }

    lineDrawn(strFill, strPlayerName){
        this.intSideDrawn++;
        if(this.intSideDrawn == 4){
            this.changeSquareColor(strFill);
            const text = document.createElementNS(this.SVG_NS, "text");
            const intCenterDist = (this.arrCoordinates[1][0] - this.arrCoordinates[0][0])/2;
            console.log(intCenterDist)
            // <text x="32" y="50" text-anchor="middle" fill="white" font-size="30">X</text>
            text.setAttribute("x", this.arrCoordinates[0][0]+intCenterDist);
            text.setAttribute("y", this.arrCoordinates[0][1]+intCenterDist+5);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", "white");
            text.setAttribute("font-size", 10);
            text.textContent = strPlayerName;
            this.objSquare.parentNode.append(text)
            return true
        }
        return false;
        
    }

}