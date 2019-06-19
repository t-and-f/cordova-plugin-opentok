#!/usr/bin/env node
var fs = require('fs');

function listFiles(directoryPath) {
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            console.log(file); 
        });
    });
}

module.exports = function (context) {
    var IosSDKVersion = "OpenTok-iOS-2.14.0";
    var downloadFile = require('./downloadFile.js'),
        exec = require('./exec/exec.js'),
        Q = context.requireCordovaModule('q'),
        deferral = new Q.defer();
    console.log('Downloading OpenTok iOS SDK');
    downloadFile('https://s3.amazonaws.com/artifact.tokbox.com/rel/ios-sdk/' + IosSDKVersion + '.tar.bz2',
        './' + IosSDKVersion + '.tar.bz2', function (err) {
            if (!err) {
                console.log('downloaded');
                exec('tar -zxvf ./' + IosSDKVersion + '.tar.bz2', function (err, out, code) {
                    console.log('expanded');
                    var downloadDir = `./${IosSDKVersion}/OpenTok.framework`;
                    var frameworkDir = context.opts.plugin.dir + '/src/ios/';
                    console.log(`downloadDir`, downloadDir);
                    console.log(`frameworkDir`, frameworkDir);
                    exec(`mkdir -p ${frameworkDir}`, function() {
                        console.log(`created the OpenTok.framework directory: ${frameworkDir}`);
                        exec(`cp -R ${downloadDir} ${frameworkDir}`, function (err, out, code) {
                            console.log(`copied the SDK to the framework directory`);
                            listFiles(frameworkDir);
                            listFiles(`${frameworkDir}OpenTok.framework`);
                            exec(`rm -r ${downloadDir}`, function() {
                                console.log(`removed the download directory: ${downloadDir}`);
                                exec('rm -r ./' + IosSDKVersion, function (err, out, code) {
                                    console.log('Removed extracted dir');
                                    exec('rm ./' + IosSDKVersion + '.tar.bz2', function (err, out, code) {
                                        console.log('Removed downloaded SDK');
                                        deferral.resolve();
                                    });
                                });
                            });
                        });
                    });
                });
            }
        });
    return deferral.promise;
};
