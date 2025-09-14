import { Vertice } from "./circle.js";
import { Line } from "./line.js";
import { Square } from "./square.js";
import { Triangle } from "./triangle.js";
import { Player } from "./user.js";

const SVG_NS = "http://www.w3.org/2000/svg";

class DotsAndBoxes {
    svg = document.querySelector('svg');
    /**
     * [
     *  [[x1,y1],[x2,y1],[x3,y1]],
     *  [[x1,y2],[x2,y2],[x3,y2]],
     *  [[x1,y3],[x2,y3],[x3,y3]],
     *  ...
     * ]
     */
    arrTotalMatrix = [];
    /**
     * [
     *  [[[x1,y1],[x2,y1],[x2,y2],[x1,y2]],   [[x2,y1],[x3,y1],[x3,y2],[x2,y2]],   [[x3,y1],[x4,y1],[x4,y2],[x3,y2]]],
     * [[[x1,y2],[x2,y2],[x2,y3],[x1,y3]],   [[x2,y2],[x3,y2],[x3,y3],[x2,y3]],   [[x3,y2],[x4,y2],[x4,y3],[x3,y3]]],
     * ...
     * ]
     */
    arrBoxByBoxMatrix = [];
    // same as above but instead of coordinates, xy numbers like 1,1
    arrBoxByBoxNumberedMatrix = [];

    /**
     * array of all circle class objects
     */
    arrAllVertices = [];
    /**
     * array of all square class objects
     */
    arrAllSquares = []
    /**
     * array of all triangle class objetcs
     */
    arrAllTriangle = []; // polygon element ref array

    intUser = 0; // first player 0 second player 1

    intCurrentUser = 0;

    /**
     * array of player ids
     */
    arrUserIds = [0, 1]
    /**
     * to contain user selected boxes like
     * if 1st player completes 1st box
     * [
     *  0: [[1,1],[1,2],[2,2],[2,1]]//box1, ...
     * ]
     */
    arrUserBoxes = [];

    arrUserColors = ['#00FF00', '#FF5722', '#2196F3', '#FFEB3B'];
    /**
     * same structure as this.arrBoxByBoxMatrix
     */
    arrFilledBoxes = []

    /**
     * x axis coordinates
     */
    arrXindex = []
    /**
     * y axis coordinates
     */
    arrYindex = []


    triangleHandlers = new WeakMap();
    intPadding;
    intVerticeDist;
    intCenterDist;

    intColumns;
    intRows;
    /**
     * array of player objects
     */
    arrUsers = [];

    arrColors = [];

    /**
     * player object containing current player id and color
     * since we're planning for multiplayer online setup
     */
    objCurrentPlayer;
    /**
     * player object containing this player id and color
     * since we're planning for multiplayer online setup
     * diff between this and objCurrentPlayer -
     * if this player is not the current player then
     * input to be disregarded since its not his chance
     */
    objThisPlayer;
    /**
     * local or online
     */
    blnSameDevice = true;

    dummyNames = ["zayd", "ahyan", "johnny", "adil"];

    intCurrentUser


    constructor(intColumns, intRows, intFullWidth = 600, intNoOfPlayers = 2) {
        this.intFullWidth = intFullWidth;
        this.intPadding = this.intFullWidth / 10;
        this.intVerticeDist = 4 * this.intFullWidth / (intColumns * 5);
        // now we are assuming no of columns and rows are equal
        this.intCenterDist = this.intVerticeDist / 2;

        this.setPlayers(intNoOfPlayers);
        this.setThisPlayer(0);
        this.setCurrentPlayer(0);

        this.makeGrid(intColumns, intRows)
        this.objUser = new Player()
    }
    /**
     * 
     * @param {*} intColumns no of columns 
     * @param {*} intRows no of rows
     */
    makeGrid(intColumns, intRows) {

        this.intColumns = intColumns;
        this.intRows = intRows;


        let x = 0; let y = 0;
        for (let i = 0; i < intRows + 1; i++) {
            this.arrTotalMatrix[i] = [];
            if (i < intRows)
                this.arrBoxByBoxMatrix[i] = [];
            y += (i ? this.intVerticeDist : this.intPadding);
            x = 0;
            for (let j = 0; j < intColumns + 2; j++) {
                x += (j ? this.intVerticeDist : this.intPadding)
                this.arrTotalMatrix[i].push([x, y])
                if (j < intColumns && this.arrBoxByBoxMatrix[i])
                    this.arrBoxByBoxMatrix[i].push([]);

                if (i == 0)
                    this.arrXindex.push(x);
            }
            this.arrYindex.push(y)
        }

        this.arrFilledBoxes = JSON.parse(JSON.stringify(this.arrBoxByBoxMatrix));
        console.log(this.arrFilledBoxes)
        this.arrBoxByBoxMatrix.forEach((arrRows, intColIndex) => {
            arrRows.forEach((arrEachBox, intRowIndex) => {
                const corner1 = this.arrTotalMatrix[intColIndex][intRowIndex];
                const corner2 = this.arrTotalMatrix[intColIndex][intRowIndex + 1];
                const corner3 = this.arrTotalMatrix[intColIndex + 1][intRowIndex + 1];
                const corner4 = this.arrTotalMatrix[intColIndex + 1][intRowIndex];
                arrEachBox.push(corner1, corner2, corner3, corner4)
            })
        })


        this.arrTotalMatrix.forEach((arrRows, rowIndex) => {
            arrRows.forEach((arrColumns, colIndex) => {
                const objCircle = new Vertice(arrColumns,[rowIndex, colIndex]);
                this.arrAllVertices.push(objCircle);
                this.svg.append(objCircle.objCircle);
            })
        })
        console.log(this.arrAllVertices)

        this.arrBoxByBoxMatrix.forEach((arrRows) => {
            arrRows.forEach((arrCorners) => {
                const arrCenter = this.findCenter(arrCorners[0]); // [x,y]

                const square = new Square(arrCorners);

                const triangle1 = new Triangle(arrCorners[0], arrCorners[1], arrCenter, arrCorners, square, this.objCurrentPlayer);
                const triangle2 = new Triangle(arrCorners[1], arrCorners[2], arrCenter, arrCorners, square, this.objCurrentPlayer);
                const triangle3 = new Triangle(arrCorners[2], arrCorners[3], arrCenter, arrCorners, square, this.objCurrentPlayer);
                const triangle4 = new Triangle(arrCorners[3], arrCorners[0], arrCenter, arrCorners, square, this.objCurrentPlayer);

                this.arrAllSquares.push(square);

                const line1 = new Line(arrCorners[0], arrCorners[1], true);
                const line2 = new Line(arrCorners[1], arrCorners[2], true);
                const line3 = new Line(arrCorners[2], arrCorners[3], true);
                const line4 = new Line(arrCorners[3], arrCorners[0], true);

                this.arrAllTriangle.push(triangle1, triangle2, triangle3, triangle4);

                this.svg.append(square.objSquare);
                this.svg.append(triangle1.objTriangle);
                this.svg.append(line1.objLine);
                this.svg.append(triangle2.objTriangle);
                this.svg.append(line2.objLine);
                this.svg.append(triangle3.objTriangle);
                this.svg.append(line3.objLine);
                this.svg.append(triangle4.objTriangle);
                this.svg.append(line4.objLine);

            })
        })

        this.addTriangleEventListener(this.arrAllTriangle);


    }

    /**
     * 
     */
    findCenter([x1, y1]) {
        const x = x1 + this.intCenterDist;
        const y = y1 + this.intCenterDist;
        return [x,y]
    }


    addTriangleEventListener(arrTriangle) {
        arrTriangle.forEach((objPoly) => {
            const handler = this.triangleOnClickWrapper(objPoly);
            this.triangleHandlers.set(objPoly.objTriangle, handler);
            objPoly.objTriangle.addEventListener('click', handler)
        })
    }

    /**
     * 
     * @param {*} intFirst x/y axis line's first coordinate index
     * @param {*} intSecond x/y axis line's second coordinate index
     * @param {*} intColumnsOrRow no of columns if x-axis / rows if y-axis
     * @returns i give you x/y axis coordinate index of which all boxes are affected
     * ex - if i make a line from 0,1 to 1,1
     * two boxes should be affected - 0,0 box and 0,1 box
     * this function returns x/y axis of those boxes
     * so for x axis this would return [0,1] i.e 2 x-axis coordinate indices
     * for y axis this would return [0] i.e. 1 coordinate index
     */
    findWhichColumnOrRow(intFirst, intSecond, intColumnsOrRow) {
        if (intFirst !== intSecond) return [Math.min(intFirst, intSecond)];
        if (intFirst == 0) return [intFirst];
        if (intFirst == intColumnsOrRow) return [intFirst - 1];
        return [intFirst, intFirst-1]


    }

    triangleOnClickWrapper(objPoly) {
        const objTriangleElement = objPoly.objTriangle;
        function triangleOnClick() {
            // check if current player
            if (this.objCurrentPlayer.intPlayerId !== this.objThisPlayer.intPlayerId) return;

            const arrFirstPoint = arrPoints[0].split(",");
            const arrSecondPoint = arrPoints[1].split(",");
            objTriangleElement.classList.remove('untouched');
            const filledLine = new Line(arrFirstPoint, arrSecondPoint, false, this.objCurrentPlayer.strPlayerColor)
            
            this.svg.append(filledLine.objLine);
            let blnChangePlayer = true;
            // sidefilled function returns true if all 4 sides are drawn
            if(objPoly.sideFilled(this.objCurrentPlayer.strPlayerColor, this.objCurrentPlayer.strPlayerName)){
                this.objCurrentPlayer.intPoints++;
                blnChangePlayer = false
            }

            const triangleHandler = this.triangleHandlers.get(objTriangleElement);

            objTriangleElement.removeEventListener('click', triangleHandler);


            /**
             * have to remove eventlistener from adjacent triangle that share the same line
             * 
             * this one's a bit too tricky to explain
             * let's take first boxes right side triangle
             * so the way that triangle is made with the maketriangle function
             * is by passing 1,2 2,2 centerdist as params and those represents
             * the points atrribute's value in the newly made triangle polygon icon
             * 
             * so when we remove eventlistener from the triangle, we need to remove
             * left triangle of second box as well since they both represent the same 
             * line i.e. 2,1 2,2.. so in order find that triangle element ref,
             * we need to consider how we make that triangle i.e what params we pass to
             * the make triangle function which are the points' attributes value of the 
             * 2nd box's left side triangle. so when we used 2,1 2,2 for 1st box's right 
             * triangle, we used 2,2 2,1 for 2nd box's right triangle i.e. switched the
             * position of the points. that's whats happening here
             */
            const sisterTriangle = this.arrAllTriangle.find((objTriangle)=> arrPoints[0] == String(objTriangle.arrCoordinates[1]) && arrPoints[1] == String(objTriangle.arrCoordinates[0]))


            if (!!sisterTriangle) {
                if(sisterTriangle.sideFilled(this.objCurrentPlayer.strPlayerColor, this.objCurrentPlayer.strPlayerName))
                    this.objCurrentPlayer.intPoints++;

                const handler = this.triangleHandlers.get(sisterTriangle.objTriangle);
                if (handler) {
                    sisterTriangle.objTriangle.classList.remove('untouched');
                    sisterTriangle.objTriangle.removeEventListener('click', handler);
                }
            }

            // change to next player if no square filled
            if(blnChangePlayer)
                this.changePlayer();

            // if one device, current player and same player be same
            if(this.blnSameDevice)
                this.objThisPlayer = this.objCurrentPlayer;
            
        }

        const arrPoints = objTriangleElement.attributes['points'].value.split(" ");

        const triangleOnClickBinded = triangleOnClick.bind(this);
        return triangleOnClickBinded
    }
    /**
     * 
     * @param {*} param0 box coordinates
     * @param {*} objPoly triangle element ref
     */
    makeSelectedSquare([[x1, y1], [x2, y2], [x3, y3], [x4, y4]]) {
        const polygon = document.createElementNS(SVG_NS, "polygon");
        polygon.setAttribute("points", `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`);
        polygon.setAttribute("fill", this.arrUserBoxes[this.intUser]);
        this.svg.append(polygon)

        // arrUserBoxes[this.intUser].push([[x1,y1], [x2,y2], [x3,y3], [x4,y4]])
    }
    /**
     * remove listener once clicked
     * @param {*} objTriangle 
     */
    removeClickListener(objTriangle) {
        document.querySelector('').removeEventListener()
    }

    /**
     * set player for online multiplayer only
     * @param {*} intId 
     */
    setPlayerId(intId) {
        this.intUser = intId;
    }

    /**
     * add player for online multiplayer only
     * @param {*} intId 
     */
    addPlayerIdToPool(intId) {
        this.arrUserIds.push(intId);
    }
    /**
     * set players
     * param int no of players
     */
    setPlayers(intNo){
        for(let i = 0; i < intNo; i++){
            // set custom id for players here
            const player = new Player(i, this.arrUserColors[i], this.dummyNames[i]);
            this.arrUsers.push(player)
        }
    }
    /**
     * set current player
     */
    setCurrentPlayer(playerId){
        this.objCurrentPlayer = this.arrUsers.find((objPlayer)=> objPlayer.intPlayerId == playerId);
    }
        /**
     * set current player
     */
    setThisPlayer(playerId){
        this.objThisPlayer = this.arrUsers.find((objPlayer)=> objPlayer.intPlayerId == playerId);
    }
    /**
     * change player
     * for local multiplayer
     */
    changePlayer(){
        let intCurrentPlayer = this.arrUsers.findIndex((objPlayer)=> objPlayer.intPlayerId == this.objCurrentPlayer.intPlayerId);
        if(intCurrentPlayer == this.arrUsers.length-1)
            this.objCurrentPlayer = this.arrUsers[0];
        else this.objCurrentPlayer = this.arrUsers[++intCurrentPlayer];
    }
}
try {
    
    this.objDotsAndBoxes = new DotsAndBoxes(4, 4)
} catch (error) {
    console.error(error)   
}
