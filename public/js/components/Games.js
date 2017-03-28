Vue.component('games', {
    template: "#games",
    data() {
        return {
            STORE,
            ranked: true,
            team: null,
            autocompleteUsers: [],
            user: "",
            userId: null
        }
    },
    methods: {
        getPlayingGames() {
            this.$http.get(`/v1/users/${this.STORE.me.id}/matchs?status=0,1&range=0-100`).then((matchs) => {
                this.$set(this.STORE, "playingGame", matchs.body);
            });
        },
        getOverGames() {
            this.$http.get(`/v1/users/${this.STORE.me.id}/matchs?status=2`).then((matchs) => {
                this.$set(this.STORE, "overGame", matchs.body);
            });
        },
        getFromMatchmakings() {
            this.$http.get("/v1/matchmaking/from").then((mms) => {
                this.$set(this.STORE, "fromMatchmakings", mms.body);
            });
        },
        getToMatchmakings() {
            this.$http.get("/v1/matchmaking/to").then((mms) => {
                this.$set(this.STORE, "toMatchmakings", mms.body);
            });
        },
        deleteMatchmaking(id) {
            this.$http.delete(`/v1/matchmaking/${id}`).then(() => {
                this.getFromMatchmakings();
                this.getToMatchmakings();
                this.getPlayingGames();
            });
        },
        matchmaking(ranked, team, userId) {
            console.log(ranked, team, userId);
            var planes = [];
            for (var t of this.STORE.teams) {
                if (t.id == team) {
                    for (var plane of t.userplanes) {
                        planes.push(plane.id);
                    }
                    break;
                }
            }

            this.$http.post("/v1/matchmaking", {
                to: userId,
                ranked: ranked,
                planes: planes.join("|")
            }).then(() => {
                this.getFromMatchmakings();
                this.getToMatchmakings();
                this.getPlayingGames();
            });
        },
        selectGame(id){
            this.$set(this.STORE, "gameId", id);
        }
    },
    watch: {
        user(value) {
            this.$http.get(`/v1/users?username=${value}%`).then((users) => {
                this.autocompleteUsers = users.body;
                for (var user of this.autocompleteUsers) {
                    if (user.username.toLowerCase() == value.toLowerCase()) {
                        this.userId = user.id;
                        return;
                    }
                }
            });
        }
    },
    computed: {
        gamesToPlay() {
            var matchs = [];
            if (!this.STORE.playingGame) {
                return matchs;
            }
            for (var match of this.STORE.playingGame) {
                if (match.usermatch.hasPlayed == false) {
                    matchs.push(match);
                }
            }
            return matchs;
        },
        gamesWaiting() {
            var matchs = [];
            if (!this.STORE.playingGame) {
                return matchs;
            }
            for (var match of this.STORE.playingGame) {
                if (match.usermatch.hasPlayed) {
                    matchs.push(match);
                }
            }
            return matchs;
        }
    },
    mounted() {
        this.getFromMatchmakings();
        this.getToMatchmakings();
        this.getPlayingGames();
        this.getOverGames();
    }
});