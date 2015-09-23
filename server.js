// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var app = express();
var env = require('node-env-file');
var bodyParser = require('body-parser');

// load env variables from .env file
env('./.env');

// sets port 8080 to default or unless otherwise specified in the environment
app.set('port', process.env.PORT || 8080);

// configure bodyParser to get data from POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// configure mongoose
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_HOST);

// set routes
var api = require('./routes/api');
app.use('/', api);

// START THE SERVER
// =============================================================================
app.listen(app.get('port'));

console.log('caller-id-api is now running on port ' + app.get('port'));