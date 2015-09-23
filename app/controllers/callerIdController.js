// controllers/callerIdController.js
'use strict';

var CallerId = require('../models/callerId');

module.exports = {
    // converts a phone number to E.164 specs or returns false if an invalid number
    convertE164: function (number) {
        // E.164 regex according to specifications given at https://en.wikipedia.org/wiki/E.164
        var e164 = new RegExp('^\\+?[1-9]\\d{1,14}$'),
            phoneNumber;

        // if number starts with ( remove all non digit values and assume U.S.A. calling code
        if (number.substring(0, 1) == '(') {
            phoneNumber = '+1' + number.replace(/\D/g, '');
        }
        else {
            phoneNumber = '+' + number.replace(/\D/g, '');
        }

        // return phone number if E.164 compliant
        if (e164.test(phoneNumber)) {
            return phoneNumber;
        }
        else {
            return false;
        }
    },

    // creates a single caller id used by the /number API endpoint
    createCallerId: function (data, callback) {
        // check for errors
        if (!data.name || !data.number || !data.context) {
            callback({error: 'Please enter a value for name, number, and context.', statusCode: 422});
        }

        // convert number to E.164
        var phoneNumber = this.convertE164(data.number);

        // verify number is E.164 compliant
        if (phoneNumber) {

            // create a new instance of the CallerId model
            var newCallerId = new CallerId();
            newCallerId.name = data.name;
            newCallerId.number = phoneNumber;
            newCallerId.context = data.context;

            // save the caller id and check for errors
            newCallerId.save(function (err) {
                if (err) {
                    // duplicate key error
                    if (err.code == 11000) {
                        callback({
                            error: 'The number ' + phoneNumber + ' already has a context of ' + data.context,
                            statusCode: 422
                        });
                    }
                    // an unknown error occurred
                    else {
                        callback({error: 'Failed to save caller id.', statusCode: 500});
                    }
                }

                callback({success: true, message: 'Caller id successfully saved.', statusCode: 200});
            });
        }
        else {
            callback({error: 'The number ' + data.number + ' should be in E.164 format.', statusCode: 422});
        }
    },

    // used to import batch data from CSV files to the service
    createCallerIdBatch: function (data, callback) {
        var callerIdBatch = [];

        // check batch for errors
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var obj = data[key];

                // prevent invalid objects from being included in batch
                if (!obj.name || !obj.number || !obj.context) {
                    continue;
                }

                // convert number to E.164
                var phoneNumber = this.convertE164(obj.number);

                // include object in batch if the phone number is valid
                if (phoneNumber) {
                    // add new object using converted E.164 phone number
                    callerIdBatch.push({
                        name: obj.name,
                        number: phoneNumber,
                        context: obj.context
                    });
                }
            }
        }

        // insert batch to MongoDB
        CallerId.collection.insert(callerIdBatch, {ordered: false}, function (err, docs) {
            // return callback when batch upload has finished
            callback({success: true, message: 'Caller id batch successfully saved.', docsSaved: docs.length, statusCode: 200});
        });
    },

    // retrieve caller id information from the /query API endpoint
    getCallerIdByNumber: function (data, callback) {
        // check for errors
        if (!data.number) {
            callback({error: 'Please enter a number.', statusCode: 422});
        }

        // convert number to E.164
        var phoneNumber = this.convertE164(data.number);

        // verify number is E.164 compliant
        if (phoneNumber) {
            // Using query builder, get all caller ids with given number
            CallerId.
                find({'number': phoneNumber}).
                where('number').equals(phoneNumber).
                limit(10).
                select('name number context').
                exec(function (err, callerId) {
                    if (err) {
                        callback({error: 'Failed to save new caller id.', statusCode: 500});
                    }

                    // check to see if caller id has been created
                    if (callerId.length) {
                        callback({data: callerId, statusCode: 200});
                    }
                    else {
                        callback({data: [], statusCode: 200});
                    }
                });
        }
        else {
            callback({error: 'The number ' + data.number + ' should be in E.164 format.', statusCode: 422});
        }
    }
};