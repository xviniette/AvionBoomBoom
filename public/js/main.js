var STORE = {
    show: {}
};

window.onload = function () {
    var app = new Vue({
        el: "#app",
        data: {
            STORE,
        },
        methods: {
            me() {
                this.$http.get("/v1/users/me")
                    .then((user) => {
                        this.$set(this.STORE, "me", user.body);
                    });
            },
            inGame() {
                this.$http.get("/v1/matchmaking/in_game")
                    .then((game) => {
                        var game = game.body;
                        if (game.game) {
                            this.$set(this.STORE, "usergame", game.game);
                        }
                    });
            },
            maps() {
                this.$http.get("/v1/maps?playable=1")
                    .then((maps) => {
                        this.$set(this.STORE, "maps", maps.body);
                    }).catch();
            }
        },
        mounted() {
            this.me();
            this.inGame();
            this.maps();

            this.$set(this.STORE, "timestamp", Date.now());
            setInterval(() => {
                this.$set(this.STORE, "timestamp", Date.now());
            }, 1000);
        }
    });
}