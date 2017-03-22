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
            }
        },
        mounted() {
            this.me();
        }
    });
}