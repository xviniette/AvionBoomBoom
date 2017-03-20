Vue.component('home', {
    template: "#home",
    data() {
        return {
            STORE,
        }
    },
    computed: {
        me() {
            return this.STORE.me;
        },
        rank() {
            return this.STORE.rank;
        }
    },
    methods: {
        getRank() {
            if (this.me) {
                this.$http.get(`/v1/users/${this.me.id}/ranking`)
                    .then((res) => {
                        this.$set(this.STORE, "rank", res.body.ranking);
                    });
            }
        },
        myProfile(){
            if(this.me){
                this.$set(this.STORE, "profile", this.me.id);
            }
        },
        ranking(){
            this.$set(this.STORE, "ranking", true);
        },
        disconnect(){
            localStorage.removeItem("token");
            this.$delete(this.STORE, "me");
        }
    },
    mounted() {
        this.getRank();
        setInterval(() => {
            this.getRank();
        }, 60 * 1000);
    }
});