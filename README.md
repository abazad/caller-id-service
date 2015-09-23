# Caller Id Service

An API that allows the client to retrieve and submit caller id information with a tool to import data from CSV files.

## Installation

1. Install [Node.js](https://nodejs.org/)
2. Using the command line, enter the root of the application to install the npm dependencies.

> $ npm install

*Built using the Express 4 framework for Node.js*

## Usage

**All commands should be entered from the root of the application using the command line.**

To start the server:

> $ node server.js

The port of the server can be manually set at launch:

> $ PORT=1234 node server.js

### API Endpoints

#### /query

Get caller id information by number.

Required fields:

- **number:** Phone number in E.164 format.

> GET http://localhost:8080/query?number=%2B15556789090

#### /number

Create a new caller id.

Required fields:

- **name:** Contact name.
- **number:** Phone number in E.164 format.
- **context:** Context for the phone number. Ex. mobile, work, home.

> POST http://localhost:8080/number

### Importing CSV Data

This service allows CSV files to be imported from the **csv** directory of the application.

**Default import file name:** callerid-data.csv

**Line format:** phone number, context, contact name

Start the import:

> $ node importCSV.js

Import a specific file from the **csv** directory:

> $ CSV=example.csv node importCSV.js

Change the number of items in a batch: *default=1000 or 1/100th the total number of records*

> $ BATCH=1000 node importCSV.js

Chain multiple configuration options:

> $ CSV=example.csv BATCH=1000 node importCSV.js

## Additional Information

This application was created to demonstrate some of the basic capabilities of the Express 4 framework and Node.js

## License

Apache License 2.0