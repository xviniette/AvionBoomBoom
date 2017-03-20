

Vue.component('message', {
    template: `
    <div>
        <ul>    
            <li v-for="message in messages">{{message.message}}</li>
        </ul>
        <form @submit.prevent="sendMessage">
            <input type="text" v-model="messageToSend">
            <input type="submit" value="Envoyer">
        </form>
    </div>
    `,
    data() {
        return {
            STORE,
            messages:[],
            messageToSend:"",
            usernameToSend:"",
            users:{}
        }
    },
    methods:{
        getLongPollingMessage(){
            //this.http.get("/v1/messages/longpolling")
        },
        sendMessage(){
            if(this.messageToSend.length > 0){
                this.$http.get("/v1/users", {username:this.usernameToSend})
                .then((users) => {
                    if(users.body.length > 0){
                        for(var i in users.body){
                            this.$set("users", users.body[i].id, users.body[i]);
                        }

                    }
                }).catch();
            }
        }
    },
    mounted(){
        this.getLongPollingMessage();
    },
    watch: {

    }
});