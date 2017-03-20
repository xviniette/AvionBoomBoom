Vue.component('matchmaking', {
    template: '#matchmaking',
    data() {
        return {
            STORE,
            nbInQueue: 0,
            timestampInQueue: null,
        }
    },
    methods: {
        matchmaking() {
            getServers((err, servers) => {
                if (err) {
                    console.log(err);
                    return;
                }
                this.$http.post("/v1/matchmaking/add_queue", {
                        servers: servers.join("|")
                    })
                    .then((res) => {
                        this.$set(this.STORE, "inQueue", true);
                        this.timestampInQueue = Date.now();
                        this.getNbInQueue();
                    });
            });
        },
        unmatchmaking() {
            this.$http.post("/v1/matchmaking/remove_queue")
                .then((res) => {
                    this.$delete(this.STORE, "inQueue");
                });
        },
        inQueue() {
            this.$http.get("/v1/matchmaking/in_queue")
                .then((inQueue) => {
                    var inQueue = inQueue.body.inQueue;
                    this.$set(this.STORE, "inQueue", inQueue);
                    this.timestampInQueue = Date.now() - inQueue.timestamp;
                });
        },
        getNbInQueue() {
            this.$http.get("/v1/matchmaking/players_in_queue").then((nb) => {
                this.nbInQueue = nb.body.inQueue;
            });
        }
    },
    computed:{
        deltaTime(){
            var dt = Math.floor((this.STORE.timestamp - this.timestampInQueue)/1000);
            if(dt < 0){
                dt = 0;
            }
            var minutes = Math.floor(dt/60);
            var secondes = (dt - minutes*60);
            if(minutes < 10){
                minutes = "0"+minutes;
            }
            return `${minutes}:${("0" + secondes).slice(-2)}`;
        }
    },
    mounted() {
        this.inQueue();
        this.getNbInQueue();
        setInterval(() => {
            if (this.STORE.inQueue) {
                this.getNbInQueue();
            }
        }, 5 * 1000);
    }
});