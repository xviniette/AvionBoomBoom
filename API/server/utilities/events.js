module.exports = function (app) {
    var redis = app.get("redis");

    var addEvent = function (userId, event, callback) {
        redis.get("events:" + userId, (err, data) => {
            if (err) {
                if (callback) {
                    callback(err);
                }
                return;
            }

            var expiration = 10 * 60;

            if (data == null) {
                redis.setex("events:" + userId, expiration, JSON.stringify([event]), (err, data) => {
                    if (callback) {
                        callback(false, [event]);
                    }
                });
            } else {
                var d = JSON.parse(data);
                d.push(event);
                redis.setex("events:" + userId, expiration, JSON.stringify(d), (err, data) => {
                    if (callback) {
                        callback(false, d);
                    }
                });
            }
        });
    }

    return {
        addEvent: addEvent
    }
}