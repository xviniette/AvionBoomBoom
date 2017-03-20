Vue.component('ranking', {
    template: "#ranking",
    data() {
        return {
            STORE,
            users: [],
            ranking: 0
        }
    },
    computed: {
        me() {
            return this.STORE.me;
        },
        myRank() {
            return this.STORE.rank;
        }
    },
    methods: {
        profile(id) {
            this.$set(this.STORE, "profile", id);
        },
        getRank() {
            if (this.me) {
                this.$http.get(`/v1/users/${this.me.id}/ranking`)
                    .then((res) => {
                        this.$set(this.STORE, "rank", res.body.ranking);
                    });
            }
        },
        getRanking() {
            this.$http.get(`/v1/users?sort=elo&desc=elo&range=0-100`)
                .then((users) => {
                    if (users.body.length > 0) {
                        this.$http.get(`/v1/users/${users.body[0].id}/ranking`)
                            .then((ranking) => {
                                this.users = users.body;
                                this.ranking = ranking.body.ranking;
                            });
                    }
                });
        },
        getMe() {
            this.$http.get("/v1/users/me")
                .then((user) => {
                    this.$set(this.STORE, "me", user.body);
                });
        },
        close() {
            this.$delete(this.STORE, "ranking");
        }
    },
    mounted() {
        this.getRanking(0);
        this.getMe();
        this.getRank();
    }
});