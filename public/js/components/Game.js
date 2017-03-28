Vue.component('game', {
    template: "#game",
    props:["gameId"],
    data() {
        return {
            STORE,
            game:null
        }
    },
    methods: {
        getGame(id){
            this.game = null;
            this.$http.get(`/v1/matchs/${id}`).then((game) => {
                this.game = game.body;
            });
        }
    },
    watch: {
        gameId(value){
            this.getGame(this.gameId);
        }
    },
    mounted() {
        this.getGame(this.gameId);
    }
});