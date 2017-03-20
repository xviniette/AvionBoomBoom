Vue.component('private', {
    template: '#private',
    data() {
        return {
            STORE,
            display: false,
            map: null,
            times: [1 * 60 * 1000, 2 * 60 * 1000, 3 * 60 * 1000, 5 * 60 * 1000, 10 * 60 * 1000, 30 * 60 * 1000, 60 * 60 * 1000],
            time: 5 * 60 * 1000,
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
                return map.type == "ranked";
            });
        },
        timers() {
            var ts = {};
            for (var time of this.times) {
                ts[time] = `${Math.floor(time/(60*1000))} min`;
            }
            return ts;
        }
    }
});