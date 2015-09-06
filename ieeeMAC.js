var EventEmitter = require("events").EventEmitter;
var parse = require('csv-parse');
var fs = require('fs');
var wget = require('wget');

var src = 'https://services13.ieee.org/RST/standards-ra-web/rest/assignments/download/?registry=MA-L&text=';
var ieeeMAC_OUI_full_file = __dirname + '/ieeeMAC_OUI_full.csv';

var messenger = new EventEmitter();
exports.messenger = messenger;



messenger.on('message', function (message) {
    console.log(message);
});
messenger.on('download', function (message) {
    if (message == 'done') {
        read_MAC();
    } else {
        console.log(message);
    }
});



function init() {
    download_MAC();
}



function download_MAC() {
    try {
        fs.statSync(ieeeMAC_OUI_full_file);
        messenger.emit('message', " file " + ieeeMAC_OUI_full_file + " already exists. Skipping the download.");
        messenger.emit('download', 'done');
    } catch (err) {
        messenger.emit('message', " file " + ieeeMAC_OUI_full_file + " doesn't already exist. Downloading it.");
        messenger.emit('message', "downloading...");
        var download = wget.download(src, ieeeMAC_OUI_full_file);
        download.on('error', function (err) {
            messenger.emit('download', err);
            messenger.emit('download', 'done');
        });
        download.on('end', function (output) {
            messenger.emit('download', output);
            messenger.emit('download', 'done');
        });
        download.on('progress', function (progress) {
            // code to show progress bar
            console.log(progress);
        });
    }
}

function read_MAC() {

        var ieeeMAC_list = [];

        fs.readFile(ieeeMAC_OUI_full_file, 'utf8', function (err, data) {

            parse(data, {delimiter: ','}, function (err, data) {
                for (var company in data) {
                    ieeeMAC_list[data[company][1]] = data[company][2];
                }

                messenger.emit("done", ieeeMAC_list);
            });
        });
}


exports.init = init;
