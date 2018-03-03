var GoogleSpreadsheet = require('google-spreadsheet');
var exports = module.exports = {};
var async = require("async");
var doc = new GoogleSpreadsheet('1W6B7jzu_Qt4x2r3d5EwXhM-sDFZipb4cybyd6RUfm4k');

//var creds = require('./client_secret.json');

// const faculty = 1;
// const group = 'ФІ-17';
// const day = 'Понеділок';

// Authenticate with the Google Spreadsheets API.
exports.getRozklad = function (faculty) {
    return new Promise(function (resolve, reject) {
        async.series([
            function setAuth(step) {
                // see notes below for authentication instructions!
                var creds = require('./client_secret.json');
                doc.useServiceAccountAuth(creds, step);
            },
            function getInfoAndWorksheets(step) {
                doc.getInfo(function (err, info) {
                    console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
                    sheet = info.worksheets[faculty];
                    console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount);
                    step();
                });
            },
            function workingWithCells(step) {
                sheet.getCells({
                    'min-row': 1,
                    'max-row': 52,
                    'return-empty': false
                }, function (err, cells) {
                    resolve(cells);
                    console.log("Resolve OK");
                    //reject(err);

                    step();
                });
            }
        ])
    });
};