class Room {
    #roomId
    #player1
    #player2
    #currentPlayer
    constructor(id,p1Id) {
        this.#roomId=id
        this.#player1=p1Id
        this.#currentPlayer=this.#player1
    }

    joinPlayerTwo(p2Id){
        this.#player2=p2Id
    }
    rotateMove(id){
        if (id==this.#player1) {
            this.#currentPlayer=this.#player2
        }else{
            this.#currentPlayer=this.#player1
        }
    }
    checkCorrectMove(id){
        if (id!=this.#currentPlayer) {
            return false
        }else{
            return true
        }
    }

}

export default Room