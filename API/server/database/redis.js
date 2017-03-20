module.exports = function (app) {
    var redis = require("redis");
    var redisClient = redis.createClient();
    var config = app.get("config");
    redisClient.select(config.redis.db);
    redisClient.on("error", function (err) {
        console.log("Redis Error", err);
    });
    return redisClient;
}