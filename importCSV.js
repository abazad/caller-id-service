var fs = require('fs');
var csv = require('csv');

// configure mongoose
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_HOST);

// include CallerId controller
var CallerIdController = require('./app/controllers/callerIdController');

// configuration options

// if CSV env not set default to callerid-data.csv
var csv_file = process.env.CSV || 'callerid-data.csv';

// set default batch size to 1000 if not defined by client
var batch = process.env.BATCH || 1000;

// display import progress to the console
var progressAnimInt = 0,
    progressAnimChar = '',
    progress = 0,
    progressInterval = setInterval(function () {
        // switch statement to animate indicator at beginning message
        switch (progressAnimInt) {
            case 0:
            case 4:
                progressAnimChar = '|';
                break;
            case 1:
            case 5:
                progressAnimChar = '/';
                break;
            case 2:
            case 6:
                progressAnimChar = '-';
                break;
            case 3:
            case 7:
                progressAnimChar = '\\';
                break;
        }

        // display import progress with animation to console
        process.stdout.write(progressAnimChar + '  Import progress: ' + progress + '%  ' + progressAnimChar + '       \r');

        // reset animation int when animation finishes
        if (progressAnimInt == 7) {
            progressAnimInt = 0;
        }
        else {
            progressAnimInt++;
        }
    }, 150);

// start parsing csv records
var parser = csv.parse({delimiter: ','}, function (err, output) {
    var recordsCountTotal = output.length,
        recordsCount = 0,
        batchCount = 0,
        data = [],
        batchData;

    // set batch to a hundredth the size of total number of records if that number is greater than 1000
    if ((recordsCountTotal / 50) > 1000) {
        batch = process.env.BATCH || (recordsCountTotal / 50);
    }

    // traverse through rows of CSV file batched by number set by client or to the proportion of rows in file
    csv.transform(output, function (record, callback) {
        setTimeout(function () {
            recordsCount++;

            if (recordsCount >= recordsCountTotal) {
                batchCount = batch;
            }
            else {
                batchCount++;
            }

            data.push({
                name: record[2],
                number: record[0],
                context: record[1]
            });

            // submit batch once the current batch count or total number of records is reached
            if (batchCount == batch) {
                batchCount = 0;
                batchData = data;
                data = [];

                // create a new caller id batch
                CallerIdController.createCallerIdBatch(batchData, function () {
                    // set progress of upload once response is sent
                    progress = Math.round(recordsCount / recordsCountTotal * 100);

                    // close if all records have been added
                    if (recordsCount >= recordsCountTotal) {
                        // stop progress interval from updating the console
                        clearInterval(progressInterval);

                        process.stdout.write('|  Import progress: 100%  |\r');

                        process.stdout.write('\n\n' + csv_file + ' successfully imported.\n');

                        process.exit();
                    }
                    else {
                        callback(null);
                    }
                });
            }
            else {
                callback(null);
            }
        }, 50);
    }, {parallel: batch});
});

var input = fs.createReadStream('./csv/' + csv_file).on('error', function () {
    console.log('Invalid File\ncsv/' + csv_file + ' does not exist.');
    process.exit();
}).pipe(parser);