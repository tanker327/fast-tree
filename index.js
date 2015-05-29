'use strict';
module.exports = function (str) {
  console.log(str || 'Rainbow');
  console.log("Create dev branch");
};


var Q = require('q');
var fs = require('fs');
var path = require('path');
var log = console.log;
// Q.delay(2000).then(function(){
//  console.log("Hello");
// });
// {
//  fileName:"",
//  absolutPath:"",
//  isDirectory:true,
//  files:[
//     {
//      fileName:"fileA.aa",
//      absolutPath:"",
//    isDirectory:true,
//    files:[],
//    // parentDirectory:xx
//     }
//  ]
// }}
// console.log(path.parse('/Users/ericwu/Development/temp/q/test1'));
// getFileDetail('/Users/ericwu/Development/temp/q/test1').then(function(detail){
//  log(detail);
// })
var start = new Date().getTime();

function getFileDetail(filePath) {
    var detail = path.parse(filePath);
    return pfIsDirectory(filePath).then(function(isDirectory) {
        var detail = path.parse(filePath);
        detail.isDirectory = isDirectory;
        return detail;
    }, errorHandler);
}

function pfIsDirectory(filePath) {
    return Q.nfcall(fs.stat, filePath).then(function(stats) {
        return stats.isDirectory();
    }, errorHandler);
}

function pfGetFiles(filePath) {
    return Q.nfcall(fs.readdir, filePath);
}

function errorHandler(error) {
    console.log(error);
    var end = new Date().getTime();
    console.log("time: " + (end - start));
}
var filesQ = [];

function getTree(root) {
    // log('get tree -- > ', root);
    return getFileDetail(root).then(function(detail) {
        if (detail.isDirectory) {
            return pfGetFiles(root).then(function(files) {
                files = files.map(function(file) {
                    return root + '/' + file;
                });
                detail.files = files;
                // log(detail);
                // filesQ = filesQ.concat(files);
                // console.log(files);
                files.forEach(function(file) {
                    // log('push file  -- > ', file, ' -- ', filesQ.length);
                    filesQ.push(file);
                });
                return true;
            }, errorHandler);
        } else {
            return false;
        }
    }, errorHandler)
}

function qHandler() {
        if (filesQ.length < 1) return;
        var qq = [],
            i;
        while (i = filesQ.pop()) {
            // log("qHander -- >  ", i);
            qq.push(getTree(i));
        }
        Q.all(qq).then(function() {
            log('all done --------------------------', filesQ.length);
            var end = new Date().getTime();
            console.log("time: " + (end - start));
            if (filesQ.length > 0) qHandler();
        }, errorHandler);
    }
    // getTree("/Users/ericwu/Development/temp")
getTree("/Users/ericwu/Development/temp/q").then(function(i) {
    qHandler();
    var end = new Date().getTime();
    console.log("time: " + (end - start));
}, errorHandler);
process.on('uncaughtException', function(err) {
    console.log(err);
    var end = new Date().getTime();
    console.log("time: " + (end - start));
})
