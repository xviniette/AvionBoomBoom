Vue.component('games', {
    template:"#games",
    data() {
        return {
            STORE,
            ranked:true,
            team:null,
            autocompleteUsers:[],
            user:"",
            userId:null
        }
    },
    methods:{
        getPlayingGames(){
        },
        getFromMatchmakings(){
            this.$http.get("/v1/matchmaking/from").then((mms) => {
                this.$set(this.STORE, "fromMatchmakings", mms.body);
            });
        },
        getToMatchmakings(){
            this.$http.get("/v1/matchmaking/to").then((mms) => {
                this.$set(this.STORE, "toMatchmakings", mms.body);
            });
        },
        deleteMatchmaking(id){
            this.$http.delete(`/v1/matchmaking/${id}`).then(() => {
                this.getFromMatchmakings();
                this.getToMatchmakings();
                this.getPlayingGames();
            });
        },
        matchmaking(ranked, team, userId){
            var planes = [];
            for(var team of this.STORE.teams){
                if(team.id == team){
                    for(var plane of team.userplanes){
                        planes.push(plane.id);
                    }
                    break;
                }
            }

            this.$http.post("/v1/matchmaking", {
                to:userId,
                ranked:ranked,
                planes:planes.join("|")
            }).then(() => {
                this.getFromMatchmakings();
                this.getToMatchmakings();
                this.getPlayingGames();
            });
        }
    },
    watch:{
        user(value){
            this.$http.get(`/v1/users?username=${value}%`).then((users) => {
                this.autocompleteUsers = users.body;
                for(var user of this.autocompleteUsers){
                    if(user.username.toLowerCase() == value.toLowerCase()){
                        this.userId = user.id;
                        return;
                    }
                }
            });
        }
    },
    mounted(){
        this.getFromMatchmakings();
        this.getToMatchmakings();
    }
});