Vue.component('profile', {
    props: ['user'],
    template: "#profile",
    data() {
        return {
            STORE,
            profile: {},
            ranking: 0,
            matchs: []
        }
    },
    methods: {
        load() {
            if (this.user == "" || this.user == null) {
                return;
            }
            this.$http.get(`/v1/users/${this.user}`)
                .then((user) => {
                    this.profile = user.body;
                }).catch((err) => {});

            this.$http.get(`/v1/users/${this.user}/ranking`)
                .then((ranking) => {
                    this.ranking = ranking.body.ranking;
                }).catch((err) => {});

            this.$http.get(`/v1/users/${this.user}/matchs?sort=id&desc=id`)
                .then((matchs) => {
                    this.matchs = matchs.body;
                }).catch((err) => {});
        },
        close() {
            this.profile = {};
            this.$delete(this.STORE, "profile");
        }
    },
    watch: {
        user() {
            this.load();
        }
    },
    computed: {
        total() {
            if (this.profile.win == undefined || this.profile.lose == undefined || this.profile.draw == undefined) {
                return 0;
            }
            return this.profile.win + this.profile.lose + this.profile.draw;
        },
        winRatio() {
            if (this.total == 0) {
                return 0;
            }
            return parseInt(this.profile.win / this.total * 100);
        },
        loseRatio() {
            if (this.total == 0) {
                return 0;
            }
            return parseInt(this.profile.lose / this.total * 100);
        },
        drawRatio() {
            if (this.total == 0) {
                return 0;
            }
            return parseInt(this.profile.draw / this.total * 100);
        },
        connected() {
            if (this.profile.lastAction == undefined) {
                return false;
            }
            if (moment().diff(this.profile.lastAction, 'minutes') < 5) {
                return true;
            }
        },
        cleanMatchs() {
            var ms = [];
            for (var match of this.matchs) {
                match.type = "lose";
                if (match.score1 == match.score2) {
                    match.type = "draw";
                }
                for (var user of match.users) {
                    if (user.id == this.profile.id) {
                        if (user.usermatch.team == 1) {
                            if (match.score1 > match.score2) {
                                match.type = "win";
                            }
                        } else if (user.usermatch.team == 2) {
                            if (match.score1 < match.score2) {
                                match.type = "win";
                            }
                        }
                        break;
                    }
                }
                match.deltatime = moment(match.createdAt).fromNow();
                ms.push(match);
            }
            return ms;
        }
    },
    mounted() {
        this.load();
    },
    watch:{
        user(){
            this.load();
        }
    }
});