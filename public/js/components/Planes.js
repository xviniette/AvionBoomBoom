Vue.component('planes', {
    template: '#planes',
    data() {
        return {
            STORE,
            teamName:"",
            selectedPlane:null
        }
    },
    methods: {
        getPlanes(){
            this.$http.get(`/v1/planes?sort=level&desc=level`).then((planes) => {
                this.$set(this.STORE, "planes", planes.body);
            });
        },
        getUserPlanes(){
            this.$http.get(`/v1/users/${STORE.me.id}/planes?sort=level&desc=level`).then((planes) => {
                this.$set(this.STORE, "userPlanes", planes.body);
            });
        },
        getUserTeams(){
            this.$http.get(`/v1/teams`).then((teams) => {
                this.$set(this.STORE, "teams", teams.body);
            });
        },
        createTeam(){
            this.$http.post(`/v1/teams`, {
                name:this.teamName
            }).then(() => {
                this.getUserTeams();
            });
        },
        deleteTeam(id){
            this.$http.delete(`/v1/teams/${id}`).then(() => {
                this.getUserTeams();
            });
        },
        addTeamPlane(id, plane){
            this.$http.post(`/v1/teams/${id}/plane/${plane}`).then(() => {
                this.getUserTeams();
            });
        },
        deleteTeamPlane(id, plane){
            this.$http.delete(`/v1/teams/${id}/plane/${plane}`).then(() => {
                this.getUserTeams();
            });
        }
    },
    computed:{
        getNotOwnedPlanes(){
            if(!this.STORE.planes || !this.STORE.userPlanes){
                return [];
            }

            return this.STORE.planes.filter((plane) => {
                for(var p of this.STORE.userPlanes){
                    if(p.id == plane.id){
                        return false;
                    }
                }
                return true;
            });
        }
    },
    mounted(){
        this.getPlanes();
        this.getUserPlanes();
        this.getUserTeams();
    }
});