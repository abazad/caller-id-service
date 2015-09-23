// ROUTES FOR API
// =============================================================================

module.exports = (function () {
    'use strict';

    // set express and api
    var express = require('express');
    var api = express.Router();

    // include CallerId controller
    var CallerIdController = require('../app/controllers/callerIdController');

    // /query Endpoint
    // ----------------------------------------------------
    api.route('/query')
        // get a caller id by their number (accessed at GET http://localhost:8080/query)
        .get(function (req, res) {
            // set data from request
            var data = {
                number: req.query.number
            };

            // get all caller ids by number
            CallerIdController.getCallerIdByNumber(data, function (response) {
                if (response.error) {
                    res.status(response.statusCode).json(response);
                }
                else {
                    res.status(response.statusCode).json(response);
                }
            });
        });

    // /number Endpoint
    // ----------------------------------------------------
    api.route('/number')

        // create a caller id (accessed at POST http://localhost:8080/number)
        .post(function (req, res) {
            // set data from request
            var data = {
                name: req.body.name,
                number: req.body.number,
                context: req.body.context
            };

            // create a new caller id
            CallerIdController.createCallerId(data, function (response) {
                if (response.error) {
                    res.status(response.statusCode).json(response);
                }
                else {
                    res.status(response.statusCode).json(response);
                }
            });
        });

    return api;
})();
