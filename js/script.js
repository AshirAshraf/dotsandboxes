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
    objOtherPlayer; // since its just 2 player for now
    /**
     * local or online
     */
    blnSameDevice = false;

    dummyNames = ["#1", "#2", "johnny", "adil"];

    intCurrentUser;
    /**
     * all event listeners added initially
     */
    blnEventListenerAdded = false;

    /**
     * move is made by other player
     */
    blnIncomingFromOtherPlayer = false;

    /**
     * game started or not
     * if online, false till both parties are in the same room
     * if offline, something ui wise, have=  to figuire it out
     */
    blnGameStarted = false;
    /**
     * random player name
     */
    strRandomName
    constructor(intColumns, intRows, intFullWidth = 600, intNoOfPlayers = 2) {
        this.intFullWidth = intFullWidth;
        this.intPadding = this.intFullWidth / 10;
        this.intVerticeDist = 4 * this.intFullWidth / (intColumns * 5);
        // now we are assuming no of columns and rows are equal
        this.intCenterDist = this.intVerticeDist / 2;

        this.setPlayers(intNoOfPlayers);
        // this.setThisPlayer(0);
        // this.setCurrentPlayer(0);

        this.makeGrid(intColumns, intRows)

        this.setRoomButtonTriggers();
        this.objUser = new Player();

    }

    toggleWaitingLoader(blnShowLoader) {
        if (blnShowLoader)
            document.querySelector('#loader-wrapper').classList.remove('d-none');
        else document.querySelector('#loader-wrapper').classList.add('d-none');
    }

    setRoomButtonTriggers() {
        // , onclick="document.querySelector('.create-room').showModal();"
        document.querySelector('#create-room-trigger').addEventListener('click', () => {
            this.createRoom();
            // modal showing done in roomCreated function
        })
        document.querySelector('#join-room-trigger').addEventListener('click', () => {
            document.querySelector('.join-room').showModal();
        })

        document.querySelector('#copy-close').addEventListener('click', (elem) => {
            navigator.clipboard.writeText(this.roomId);
            this.objThisPlayer.strPlayerName = document.querySelector('#enter-player1-name').value || '#1';
            this.setNameInRoom()
            document.querySelector('.create-room').close();
            console.log(1)
            this.toggleWaitingLoader(true);
            // if(this.objThisPlayer.strPlayerName)
            //     elem.classList.add('waiting-for-player-button-loader')
            // else document.querySelector('#enter-player1-name').classList.add('is-error');
        })

        document.querySelector('#join-room').addEventListener('click', () => {

            this.joinRoom(document.querySelector('#enter-room-id').value)
            document.querySelector('.join-room').close();
            this.toggleWaitingLoader(true);
        })

        document.querySelector('#close-join-room').addEventListener('click', () => {
            document.querySelector('.join-room').close();
        })

        document.querySelector('#random-room-trigger').addEventListener('click', () => {
            document.querySelector('.random-room').showModal();
        })

        document.querySelector('#join-random-room').addEventListener('click', () => {
            this.strRandomName = document.querySelector('#enter-random-name').value || '#2';
            document.querySelector('.random-room').close();
            this.joinRandom(document.querySelector('#enter-random-name').value);
        })

        document.querySelector('#close-join-random-room').addEventListener('click', () => {
            document.querySelector('.random-room').close();
        })
    }
    youPlayFirstNotification() {
        document.querySelector("div#play-first").classList.toggle('show');
        setTimeout(() => {
            document.querySelector("div#play-first").classList.toggle('show');
        }, 3000);
    }
    youPlaySecondNotification() {
        document.querySelector("div#play-second").classList.toggle('show');
        setTimeout(() => {
            document.querySelector("div#play-second").classList.toggle('show');
        }, 3000);
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
                const objCircle = new Vertice(arrColumns, [rowIndex, colIndex]);
                this.arrAllVertices.push(objCircle);
                this.svg.append(objCircle.objCircle);
            })
        })


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
                this.svg.append(line1.objLine);
                this.svg.append(triangle1.objTriangle);
                this.svg.append(line2.objLine);
                this.svg.append(triangle2.objTriangle);
                this.svg.append(line3.objLine);
                this.svg.append(triangle3.objTriangle);
                this.svg.append(line4.objLine);
                this.svg.append(triangle4.objTriangle);

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
        return [x, y]
    }

    EACH_HANDLER = {}

    addTriangleEventListener(arrTriangle) {
        arrTriangle.forEach((objPoly, index) => {
            const handler = this.triangleOnClickWrapper(objPoly, index);
            this.triangleHandlers.set(objPoly.objTriangle, handler);
            this.EACH_HANDLER[index] = handler
            objPoly.objTriangle.addEventListener('click', handler)
        })
        this.blnEventListenerAdded = true;
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
        return [intFirst, intFirst - 1]


    }
    blnDontHavetoSend = false
    triangleOnClickWrapper(objPoly, index) {
        const objTriangleElement = objPoly.objTriangle;

        function triangleOnClick(elem) {

            if (!this.blnGameStarted) return;

            if (!this.objThisPlayer && this.blnSameDevice) {
                if (Boolean(elem)) {
                    this.objThisPlayer = this.arrUsers[0];
                    this.objOtherPlayer = this.arrUsers[1];
                }
                else {
                    this.blnIncomingFromOtherPlayer = true;
                    this.objThisPlayer = this.arrUsers[1];
                    this.objOtherPlayer = this.arrUsers[0];
                }
            }

            // check if this player click event or not since elem only if clicked
            if (this.blnIncomingFromOtherPlayer && Boolean(elem)) return;



            const arrFirstPoint = arrPoints[0].split(",");
            const arrSecondPoint = arrPoints[1].split(",");
            objTriangleElement.classList.remove('untouched');
            const filledLine = new Line(arrFirstPoint, arrSecondPoint, false, this.objCurrentPlayer.strPlayerColor)

            this.svg.append(filledLine.objLine);
            let blnChangePlayer = true;
            // sidefilled function returns true if all 4 sides are drawn
            if (objPoly.sideFilled(this.objCurrentPlayer.strPlayerColor, this.objCurrentPlayer.strPlayerName)) {
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
            const sisterTriangle = this.arrAllTriangle.find((objTriangle) => arrPoints[0] == String(objTriangle.arrCoordinates[1]) && arrPoints[1] == String(objTriangle.arrCoordinates[0]))


            if (!!sisterTriangle) {
                if (sisterTriangle.sideFilled(this.objCurrentPlayer.strPlayerColor, this.objCurrentPlayer.strPlayerName))
                    this.objCurrentPlayer.intPoints++;

                const handler = this.triangleHandlers.get(sisterTriangle.objTriangle);
                if (handler) {
                    sisterTriangle.objTriangle.classList.remove('untouched');
                    sisterTriangle.objTriangle.removeEventListener('click', handler);
                }
            }

            // send index to other devices so that line is drawn on theirs
            if (!this.blnIncomingFromOtherPlayer && !this.blnSameDevice) {
                // this.blnIncomingFromOtherPlayer = true;
                if (!blnChangePlayer) {
                    this.sendToOherPlayer(index, true);
                } else {
                    this.sendToOherPlayer(index, false);
                }
            }


            // change to next player if no square filled
            if (blnChangePlayer)
                this.changePlayer();

            // if one device, current player and same player be same
            // if(this.blnSameDevice)
            // this.objThisPlayer = this.objCurrentPlayer;

        }

        const arrPoints = objTriangleElement.attributes['points'].value.split(" ");

        const triangleOnClickBinded = triangleOnClick.bind(this);
        return triangleOnClickBinded
    }

    /**
     * send triangle class object's arrCoordinates prop
     * @param {*} arrCoordinates 
     */
    sideFilledDynamic(arrCoordinates) {
        const strCoordinates = String(`${arrCoordinates[0]} ${arrCoordinates[1]}`)
        // 180,180 180,300 120,240
        const objTriangle = this.arrAllTriangle.find(({ arrCoordinates }) => String(`${arrCoordinates[0]} ${arrCoordinates[1]}`) == strCoordinates);

        this.triangleOnClickWrapper(objTriangle)();
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
    setPlayers(intNo) {
        for (let i = 0; i < intNo; i++) {
            // set custom id for players here
            const player = new Player(i, this.arrUserColors[i]);
            if (this.blnSameDevice)
                player.strPlayerName = this.dummyNames[i]
            this.arrUsers.push(player)
        }
    }
    /**
     * set current player
     */
    setCurrentPlayer(playerId) {
        this.objCurrentPlayer = this.arrUsers.find((objPlayer) => objPlayer.intPlayerId == playerId);
    }
    /**
 * set current player
 */
    setThisPlayer(playerId) {
        this.objThisPlayer = this.arrUsers.find((objPlayer) => objPlayer.intPlayerId == playerId);
    }
    /**
     * change player
     * for local multiplayer
     */
    changePlayer() {
        this.objCurrentPlayer = this.objCurrentPlayer.intPlayerId == this.objThisPlayer.intPlayerId ? this.objOtherPlayer : this.objThisPlayer;
        this.blnIncomingFromOtherPlayer = !this.blnIncomingFromOtherPlayer;
    }
    sendToOherPlayer(index, blnPoint) {
        this.socketClient.emit('make_move', { index, blnPoint, roomId: this.roomId })
    }

    setNameInRoom() {
        this.socketClient.emit('set_name_in_room', {
            roomId: this.roomId,
            playerName: this.objThisPlayer.strPlayerName
        })
    }

    makeMovefromOpponent(index) {
        const blnFunction = this.triangleHandlers.has(this.arrAllTriangle?.[index]?.objTriangle)
        if (blnFunction) {
            const drawFunction = this.triangleOnClickWrapper(this.arrAllTriangle?.[index], index);
            drawFunction(null)
        }
        // this.triangleOnClickWrapper(this.arrAllTriangle?.[index], index, true)();
        // this.blnDontHavetoSend=true
        // if (this.EACH_HANDLER[index]) {
        //     this.EACH_HANDLER[index]()
        // }
    }
    socketClient = undefined
    roomId = undefined
    createRoom() {
        this.connectSocketServer()
        this.socketClient.emit("create_room", null)
    }
    roomCreated(roomId) {
        this.roomId = roomId
        this.objThisPlayer = this.arrUsers[0];

        this.objOtherPlayer = this.arrUsers[1];
        this.objCurrentPlayer = this.objThisPlayer;
        this.blnIncomingFromOtherPlayer = false; // since youre the first player

        document.querySelector('.create-room p#room-id').textContent = roomId;
        document.querySelector('.create-room').showModal();
        console.log("ROOM ID --- >>", roomId);
    }
    joinRoom(roomId) {
        if (!this.socketClient) {
            this.connectSocketServer()
        }
        this.roomId = roomId;
        this.objThisPlayer = this.arrUsers[1];
        this.objOtherPlayer = this.arrUsers[0];
        this.objThisPlayer.strPlayerName = document.querySelector('#enter-player2-name').value;

        this.objCurrentPlayer = this.objOtherPlayer;
        this.blnIncomingFromOtherPlayer = true; // since youre the second player
        this.socketClient.emit('join_room', { roomId, playerName: this.objThisPlayer.strPlayerName })
    }

    joinRandom(name) {
        console.log("-----------------------JOIN RANDOM");
        this.toggleWaitingLoader(true);
        this.connectSocketServer()
        this.socketClient.emit('join_random', { playerName: name })
    }
    ś
    startWaitingForOtherPlayer() {

    }
    connectSocketServer() {
        const socket = io('http://localhost:3000');
        this.socketClient = socket
        function sendMessage() {
            const input = document.getElementById('message');
            const msg = input.value;
            socket.emit('chat message', msg);
            input.value = '';
        }
        socket.on("room_created", (roomId) => {
            this.roomCreated(roomId)
        })
        socket.on("error_message", (message) => {
            console.log(message);

        })
        socket.on("next_Move", (values) => {
            console.log("************** ", values);
            this.makeMovefromOpponent(values.message.index)
        })
        socket.on("random_joined", (values) => {
            console.log("************** random_joined ", values);

            this.toggleWaitingLoader(false);
            if (values.youFirst) {
                this.objThisPlayer = this.arrUsers[0];
                this.objOtherPlayer = this.arrUsers[1];
                this.objCurrentPlayer = this.objThisPlayer;
                this.blnIncomingFromOtherPlayer = false;
                this.youPlayFirstNotification();
            } else {
                this.objThisPlayer = this.arrUsers[1];
                this.objOtherPlayer = this.arrUsers[0];
                this.objCurrentPlayer = this.objOtherPlayer
                this.blnIncomingFromOtherPlayer = true;
                this.youPlaySecondNotification();
            }
            this.objOtherPlayer.strPlayerName = values.oppositename;
            this.objThisPlayer.strPlayerName = this.strRandomName;

            this.blnGameStarted = true;
            this.roomId = values.roomId;



        })
        socket.on("room_joined", (values) => {
            this.objOtherPlayer.strPlayerName = values.oppPlayerName;
            this.blnGameStarted = true;
            console.log(2)
            this.toggleWaitingLoader(false);
        })

        socket.on('chat message', function (msg) {
            const item = document.createElement('li');
            item.textContent = msg;
            document.getElementById('messages').appendChild(item);
        });
    }


}
try {

    let DAB = new DotsAndBoxes(4, 4)
    // DAB.connectSocketServer();
} catch (error) {
    console.error(error)
}
