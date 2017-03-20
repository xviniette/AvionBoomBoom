module.exports = function (app) {
    var async = require("async");
    var jwt = require("jsonwebtoken");
    var config = app.get("config");

    var jwtConfirm = function (req, res, next) {
        var token = req.body.token || req.query.token || req.headers['authorization'];
        if (token) {
            jwt.verify(token.replace(config.jwt.type + " ", ""), config.jwt.accessKey, (err, decoded) => {
                if (err) {
                    res.status(401).json({
                        error: "token_invalid",
                        error_description: "Access token is invalid"
                    });
                    return;
                }
                req.auth = decoded;
                app.get("database").User.update({
                    lastAction: app.get("database").sequelize.fn('NOW')
                }, {
                    where: {
                        id: req.auth.id
                    }
                });
                next();
            });
        } else {
            next();
        }
    }

    var isAuth = function (req, res, next) {
        if (req.auth) {
            next();
            return;
        }
        res.status(401).json({
            error: "no_credentials",
            error_description: "This resource is under permission, you must be authenticated"
        });
    }

    var getAuthUser = function (req, res, next) {
        if (req.auth) {
            app.get("database").User.findOne({
                where: {
                    id: req.auth.id
                }
            }).then((user) => {
                if (user != null) {
                    req.auth.user = user;
                    next();
                } else {
                    res.status(404).json({
                        error: "auth_user_not_found",
                        error_description: "The authenticated user is not found"
                    });
                }
            }).catch((err) => {
                res.status(500).json({
                    error: "server_error",
                    error_description: "Internal server error"
                });
            });
        } else {
            res.status(401).json({
                error: "no_credentials",
                error_description: "This resource is under permission, you must be authenticated"
            });
        }
    }

    var pagination = function (defaultOffset, defaultLimit, maxLimit, resource = "") {
        return function (req, res, next) {
            req.pagination = {};
            req.pagination.offset = defaultOffset;
            req.pagination.limit = defaultLimit;
            if (req.query.range != undefined) {
                var bounds = req.query.range.split("-");
                if (bounds.length == 2) {
                    var min = parseInt(bounds[0]);
                    var max = parseInt(bounds[1]);
                    if (Number.isInteger(min) && Number.isInteger(max)) {
                        if (max < min) {
                            res.status(400).json({
                                error: "bad_request",
                                error_description: `Range is negative`
                            });
                            return;
                        }
                        if (max - min > maxLimit) {
                            res.status(400).json({
                                error: "bad_request",
                                error_description: `Max interval is ${maxLimit}`
                            });
                            return;
                        }
                        req.pagination.offset = min;
                        req.pagination.limit = max - min;
                    } else {
                        res.status(400).json({
                            error: "bad_request",
                            error_description: `Range error`
                        });
                        return;
                    }
                } else {
                    res.status(400).json({
                        error: "bad_request",
                        error_description: `Range error`
                    });
                    return;
                }
            }
            req.pagination.range = `${req.pagination.offset}-${req.pagination.limit + req.pagination.offset}`;
            res.set("Content-Range", `${req.pagination.range}`);
            res.set("Accept-Range", `${resource} ${maxLimit}`);
            next();
        }
    }

    var fields = function (fields) {
        return function (req, res, next) {
            req.fields = [];
            if (req.query.fields) {
                var fds = req.query.fields.split(",");
                for (var fd of fds) {
                    if (fields.indexOf(fd) != -1) {
                        req.fields.push(fd);
                    } else {
                        res.status(400).json({
                            error: "bad_request",
                            error_description: `Field '${fd}' doesn't exist`
                        });
                        return;
                    }
                }
            }
            if (req.fields.length == 0) {
                req.fields = fields;
            }
            next();
        }
    }

    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.replace(search, replacement);
    };

    var filter = function (attributes) {
        return function (req, res, next) {
            var where = {};
            for (var field in req.query) {
                if (attributes.indexOf(field) != -1) {
                    var values = req.query[field].split(",");
                    where[field] = {
                        $or: []
                    };
                    for (var value of values) {
                        if (value.indexOf("%") != -1) {
                            where[field].$or.push({
                                $like: value
                            });
                        } else {
                            where[field].$or.push(value);
                        }
                    }
                } else if (["sort", "range", "desc", "fields"].indexOf(field) == -1) {
                    res.status(400).json({
                        error: "bad_request",
                        error_description: `Field '${field}' doesn't exist`
                    });
                    return;
                }
            }
            req.filter = where;
            next();
        }
    }

    var sort = function (fields) {
        return function (req, res, next) {
            var sort = [];
            var desc = [];
            if (req.query.desc) {
                desc = req.query.desc.split(",");
            }
            if (req.query.sort) {
                var fds = req.query.sort.split(",");
                for (var field of fds) {
                    if (fields.indexOf(field) == -1) {
                        res.status(400).json({
                            error: "bad_request",
                            error_description: `Field '${field}' doesn't exist`
                        });
                        return;
                    }

                    if (desc.indexOf(field) == -1) {
                        sort.push([field, "ASC"]);
                    } else {
                        sort.push([field, "DESC"]);
                    }
                }
            }
            req.sort = sort;
            next();
        }
    }

    var all = function (fds, defaultOffset, defaultLimit, maxLimit, resource = "", model) {
        return [
            fields(fds),
            filter(fds),
            sort(fds),
            pagination(defaultOffset, defaultLimit, maxLimit, resource, model)
        ];
    }

    var urlManager = function (req, res, next) {
        req.urlManager = {
            fullUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
            host: req.protocol + "://" + req.get("host")
        };
        next();
    }

    return {
        jwtConfirm: jwtConfirm,
        isAuth: isAuth,
        getAuthUser: getAuthUser,
        pagination: pagination,
        fields: fields,
        filter: filter,
        sort: sort,
        all: all,
        urlManager: urlManager,
    }
}