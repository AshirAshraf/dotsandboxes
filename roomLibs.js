class Player {
    playerId
    #name
    #score
    constructor(id){
        this.playerId=id
    }
    setName(name){
        this.#name=name
    }
    getName(){
        return this.#name
    }
}

class Room {
    #roomId
    #player1score
    #player2score
    #player1
    #player2
    #currentPlayer
    #playerIdMapper={}
    constructor(id,p1Id) {
        this.#roomId=id
        this.#player1=new Player(p1Id)
        this.#playerIdMapper[p1Id]=this.#player1
        this.#currentPlayer=this.#player1
    }

    joinPlayerTwo(p2Id){
        this.#player2=new Player(p2Id)
        this.#playerIdMapper[p2Id]=this.#player2
        return {oppName:this.#player1.getName(),oppsiteId:this.#player1.playerId}
    }
    rotateMove(id){
        if (id==this.#player1.playerId) {
            this.#currentPlayer=this.#player2
        }else{
            this.#currentPlayer=this.#player1
        }
    }
    checkCorrectMove(id){
        if (id!=this.#currentPlayer.playerId) {
            return false
        }else{
            return true
        }
    }
    setName(playerId,name){
    this.#playerIdMapper[playerId].setName(name)
    }

}

export default Room