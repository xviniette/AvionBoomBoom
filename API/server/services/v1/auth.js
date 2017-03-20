module.exports = function (app, router) {
    var jwt = require("jsonwebtoken");
    var async = require("async");
    var crypto = require("crypto");
    var uuid = require("uuid");
    var request = require("request");
    var db = app.get("database");
    var config = app.get("config");


    router.post("/login", (req, res) => {
        if (!req.body.username || !req.body.password || req.body.username.length == 0 || req.body.password.length == 0) {
            res.status(400).json({
                error: "invalid_request",
                error_description: `Username or password missing`
            });
            return;
        }

        db.User.findOne({
            where: {
                username: req.body.username
            }
        }).then(function (user) {
            if (user == null) {
                res.status(400).json({
                    error: "invalid_username",
                    error_description: `Username doesn't exist`
                });
                return;
            }
            if (crypto.pbkdf2Sync(req.body.password, user.salt, config.pbkdf2.iteration, config.pbkdf2.keylen, config.pbkdf2.digest).toString('hex').slice(0, 255) != user.password) {
                res.status(400).json({
                    error: "wrong_password",
                    error_description: `Bad password`
                });
                return;
            }

            var token_data = {
                "token_type": "Bearer",
                "access_token": jwt.sign({
                    id: user.id
                }, config.jwt.accessKey, {
                        expiresIn: config.jwt.access_expire
                    }),
                "expires_in": config.jwt.access_expire,
                "refresh_token": jwt.sign({
                    id: user.id
                }, config.jwt.refreshKey, {
                        expiresIn: config.jwt.refresh_expire
                    })
            };

            db.TokenBlacklist.create({
                token: token_data.refresh_token,
                valid: true,
                expire: Math.floor(Date.now() / 1000) + config.jwt.refresh_expire,
                userId: user.id
            }).then(() => {
                res.status(200).json(token_data);
            }).catch((err) => {
                res.status(500).json({
                    error: "server_error",
                    error_description: "Internal server error"
                });
            });
        });
    });

    router.post("/register", (req, res) => {
        if (!req.body.username || !req.body.password || req.body.username.length == 0 || req.body.password.length == 0) {
            res.status(400).json({
                error: "invalid_request",
                error_description: `Username or password missing`
            });
            return;
        }

        async.waterfall([
            function (callback) {
                db.User.findOne({
                    where: {
                        username: req.body.username
                    }
                }).then(function (user) {
                    if (user != null) {
                        res.status(400).json({
                            error: "invalid_request",
                            error_description: `Username '${req.body.username}' is already taken`
                        });
                        callback(true);
                        return;
                    }
                    callback(false, true);
                });
            },
            function (callback) {
                var salt = uuid();
                var password = crypto.pbkdf2Sync(req.body.password, salt, config.pbkdf2.iteration, config.pbkdf2.keylen, config.pbkdf2.digest).toString('hex');
                var user = db.User.create({
                    username: req.body.username,
                    password: password,
                    salt: salt
                }).then(function (user) {
                    res.status(200).json({
                        id: user.id,
                        username: user.username,
                        password: req.body.password
                    });
                }).catch(function (err) {
                    res.status(400).json({
                        error: "invalid_request",
                        error_description: `Username has to be alphanumeric`
                    });
                });
            }
        ]);
    });

    router.post("/network", (req, res) => {
        if (req.auth && req.auth.id) {
            res.status(401).json({
                error: "already_connected",
                error_description: `You are already connected`
            });
            return;
        }

        if (!req.body.network || !req.body.socialToken) {
            res.status(400).json({
                error: "invalid_request",
                error_description: `Informations are missing`
            });
            return;
        }

        var networks = {
            "facebook": {
                url: "https://graph.facebook.com/me"
            },
            "google": {
                url: "https://www.googleapis.com/plus/v1/people/me"
            },
            "github": {
                url: "https://api.github.com/user"
            }
        }

        if (!networks[req.body.network]) {
            res.status(400).json({
                error: "invalid_request",
                error_description: `${req.body.network} is not supported`
            });
        }

        async.waterfall([
            function (callback) {
                request({
                    url: networks[req.body.network].url,
                    qs: {
                        "access_token": req.body.socialToken
                    }
                }, function (err, response, body) {
                    if (err) {
                        res.status(500).json({
                            error: "server_error",
                            error_description: "Internal server error"
                        });
                        callback(true);
                        return;
                    }
                    if (response.statusCode != 200 && response.statusCode != 304) {
                        res.status(400).json({
                            error: "invalid_request",
                            error_description: `Bad access token`
                        });
                        callback(true);
                        return;
                    }

                    var userData = JSON.parse(body);
                    callback(false, userData);
                });
            },
            function (userData, callback) {
                db.NetworkAuth.findOne({
                    where: {
                        networkId: userData.id,
                        network: req.body.network
                    }
                })
                    .then(function (network) {
                        if (network == null) {
                            if (req.body.username) {
                                db.User.findOne({
                                    where: {
                                        username: req.body.username
                                    }
                                }).then((user) => {
                                    if (user != null) {
                                        res.status(400).json({
                                            error: "invalid_request",
                                            error_description: `Username '${req.body.username}' is already taken`
                                        });
                                        return;
                                    }

                                    var salt = uuid();
                                    db.User.create({
                                        username: req.body.username
                                    }).then(function (user) {
                                        db.NetworkAuth.create({
                                            network: req.body.network,
                                            networkId: userData.id
                                        }).then(function (usernetwork) {
                                            usernetwork.setUser(user);
                                        });

                                        var token_data = {
                                            "token_type": "Bearer",
                                            "access_token": jwt.sign({
                                                id: user.id
                                            }, config.jwt.accessKey, {
                                                    expiresIn: config.jwt.access_expire
                                                }),
                                            "expires_in": config.jwt.access_expire,
                                            "refresh_token": jwt.sign({
                                                id: user.id
                                            }, config.jwt.refreshKey, {
                                                    expiresIn: config.jwt.refresh_expire
                                                })
                                        };

                                        res.status(200).json(token_data);
                                    }).catch(function (err) {
                                        res.status(400).json({
                                            error: "invalid_request",
                                            error_description: `Username has to be alphanumeric`
                                        });
                                    });



                                }).catch((err) => {
                                    res.status(500).json({
                                        error: "server_error",
                                        error_description: "Internal server error"
                                    });
                                });
                            } else {
                                res.status(400).json({
                                    error: "username_needed",
                                    error_description: `You need to define an username`
                                });
                            }
                            return;
                        }

                        network.getUser().then(function (user) {
                            var token_data = {
                                "token_type": "Bearer",
                                "access_token": jwt.sign({
                                    id: user.id
                                }, config.jwt.accessKey, {
                                        expiresIn: config.jwt.access_expire
                                    }),
                                "expires_in": config.jwt.access_expire,
                                "refresh_token": jwt.sign({
                                    id: user.id
                                }, config.jwt.refreshKey, {
                                        expiresIn: config.jwt.refresh_expire
                                    })
                            };
                            res.status(200).json(token_data);
                        }).catch();

                    }).catch(function (err) {
                        res.status(500).json({
                            error: "server_error",
                            error_description: "Internal server error"
                        });
                        callback(true);
                        return;
                    });
            }
        ]);
    });

    router.post("/refresh", (req, res) => {
        if (!req.body.refresh_token) {
            res.status(400).json({
                error: "invalid_request",
                error_description: `Refresh token is missing`
            });
            return;
        }

        db.TokenBlacklist.findOne({
            where: {
                token: req.body.refresh_token,
                valid: 1
            }
        }).then((data) => {
            if (data == null) {
                res.status(401).json({
                    error: "token_invalid",
                    error_description: `Refresh token is invalid`
                });
                return;
            }
            var token_data = data.dataValues;
            jwt.verify(token_data.token, config.jwt.refreshKey, (err, decoded) => {
                if (err) {
                    res.status(401).json({
                        error: "token_invalid",
                        error_description: `Refresh token is invalid`
                    });
                    return;
                }
                var token = {
                    "token_type": "Bearer",
                    "access_token": jwt.sign({
                        id: token_data.userId
                    }, config.jwt.accessKey, {
                            expiresIn: config.jwt.access_expire
                        }),
                    "expires_in": config.jwt.access_expire,
                };
                res.status(200).json(token);
            });
        }).catch((err) => {
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });
}