Vue.component('training', {
    template: '#training',
    data() {
        return {
            STORE,
            display: false,
            map: null
        }
    },
    methods: {
        create() {
            getServers((err, servers) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.$http.post("/v1/matchmaking/create", {
                    servers: servers.join("|"),
                    map: this.map,
                    gameTime: this.time,
                    warmupTime: -1
                }).then((game) => {
                    this.$http.post("/v1/matchmaking/join", {
                        game: game.body.id
                    }).then().catch();
                }).catch();
            });
        }
    },
    computed: {
        maps() {
            return this.STORE.maps.filter((map) => {
                return map.type != "ranked";
            });
        }
    }
});