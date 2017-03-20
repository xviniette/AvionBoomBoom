Vue.component('sign', {
    template: "#sign",
    data() {
        return {
            STORE,
            signin: {
                username: "",
                password: ""
            },
            signup: {
                username: "",
                password: ""
            }
        };
    },
    methods: {
        signin() {
            this.$http.post("/v1/auth/login", {
                    username: this.signin.username,
                    password: this.signin.password
                })
                .then((res) => {
                    localStorage.setItem("token", JSON.stringify(res.body));
                    this.$http.get("/v1/users/me")
                        .then((user) => {
                            this.$set(this.STORE, "me", user.body);
                        })
                        .catch((err) => {

                        });
                })
                .catch((err) => {});
        },
        signup() {
            this.$http.post("/v1/auth/register", {
                    username: this.signup.username,
                    password: this.signup.password
                })
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {});
        },
        network(network) {
            hello(network).login();
        }
    },
    mounted() {
        hello.init({
            github: "07b8d514d1f2f4722f8a",
            twitter: "dHtTjMUecc3ryJK0IXstbPLtr"
        }, {
            redirect_uri: '	http://localhost:3000'
        });

        hello.on('auth.login', function (auth) {
            hello(auth.network).api('me').then(function (r) {
                console.log(r);
            });
        });

    }
});