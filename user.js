export class Player {
    /**
     * player id
     */
    intPlayerId = 0;
    /**
     * player color
     */
    strPlayerColor;
    /**
     * all player id
     */
    arrPlayerIds = [];
    /**
     * squares filled i.e. points
     */
    intPoints = 0;
    /**
     * player name
     */
    strPlayerName;

    constructor(id, strColor, strPlayerName){
        this.intPlayerId = id;
        this.strPlayerColor = strColor;
        this.strPlayerName = strPlayerName;
    }

    setPlayerColor(strColor){
        this.strPlayerColor = strColor;
    }

    setPlayerId(id){
        this.intPlayerId = id;
    }

    setAllIds(arrIds){
        this.arrPlayerIds = arrIds;
    }
}