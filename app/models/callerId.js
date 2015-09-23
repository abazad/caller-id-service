// models/callerId.js
'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CallerIdSchema = new Schema({
    name: String,
    number: String,
    context: String
}).index({number: 1, context: 1}, {unique: true});

module.exports = mongoose.model('CallerId', CallerIdSchema);