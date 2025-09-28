import { v4 } from "uuid";
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
    #privateRoom=true
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

function joinRandomHandler(RANDOM_QUEUE=[],playerDet,playerId,onlineUsers,socket,ALL_ROOMS,io){
    let player=new Player(playerId)
    player.setName(playerDet.playerName)
    // onlineUsers.set(socket.id, player);
    const firstKey = onlineUsers.keys().next().value;
    if (firstKey) {
        let player1=onlineUsers.get(firstKey)
        const id = v4();
        ALL_ROOMS[id]=new Room(id,player1.playerId)
        ALL_ROOMS[id].setName(player1.playerId,player1.getName())
        ALL_ROOMS[id].joinPlayerTwo(player.playerId)
        ALL_ROOMS[id].setName(player.playerId,player.getName())
        const targetSocket = io.sockets.sockets.get(player1.playerId);
        if (targetSocket) {
            targetSocket.join(id); 
            socket.join(id)
            socket.to(player.playerId).emit('random_joined',{roomId:id,oppositename:player1.getName(),youFirst:false})
            socket.to(player1.playerId).emit('random_joined',{roomId:id,oppositename:player.getName(),youFirst:true})
            console.log("target joined ------------");
            
        }else{
            console.error("no target exist -----------------");
            
        }
        socket.join(id)

        socket.join(firstKey)
    }else{
        onlineUsers.set(socket.id, player);
    }

}

export default Room
export {joinRandomHandler}