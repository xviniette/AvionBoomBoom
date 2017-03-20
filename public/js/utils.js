Vue.http.interceptors.push((request, next) => {
    if (request.url.indexOf("https://") == -1 && request.url.indexOf("http://") == -1) {
        request.url = "http://localhost:3000" + request.url;
    }

    var token = localStorage.getItem("token");
    if (token) {
        var token = JSON.parse(token);
        request.headers.set("Authorization", `${token.token_type} ${token.access_token}`);
    }
    next();
});

var getServers = function (callback) {
    Vue.http.get("/v1/servers")
        .then((servers) => {
            var servers = servers.body;
            var serverKeys = Object.keys(servers);
            if (serverKeys.length == 0) {
                callback("no servers");
                return;
            }

            var servs = [];
            for (var i in servers) {
                servs.push(servers[i].ACCESS);
            }
            callback(false, servs);
        }).catch((err) => {
            callback(err);
        });
}