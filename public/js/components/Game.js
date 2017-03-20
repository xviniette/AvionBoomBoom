var Game;
var ws;

var initWS = function(){
    ws = new WebSocket('ws://'+STORE.usergame.server.ACCESS);

    ws.onopen = function(){
        ws.send(JSON.stringify({
			type: "join",
			room: STORE.usergame.id,
			user: STORE.usergame.user,
			password: STORE.usergame.password
		}));
    }
}

Vue.component('game', {
    template:"#game",
    data() {
        return {
            STORE
        }
    },
    watch:{
        'STORE.usergame': function(game, oldgame){
            if(JSON.stringify(game) == JSON.stringify(oldgame)){
                return;
            }
            initWS();
        }
    }
});