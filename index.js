/**
 * Main entry of the steemit blog autobot
 * @author  MarcoXZh3
 * @version 0.0.1
 */
module.exports.name = '';
module.exports.version = '0.0.1';

const CronJob = require('cron').CronJob;
const encryption = require('./libencryption');
const fs = require('fs');
const steem = require('steem');

var Blogger1 = require('./jobs/Blogger1');


var options = JSON.parse(fs.readFileSync('options.json', 'utf8').toString());
var password = fs.readFileSync('pw.log', 'utf8').toString().trim();
options.author = JSON.parse(encryption.importFileSync('key', password));

// Config steem to avoid unhandled error WebSocket not open
steem.api.setOptions({ url:'https://api.steemit.com' });
console.log(new Date().toISOString(), 'Steemit Blogger started');

// The blogger 1 -- run everyday at 1:05:00AM
var cronBlogger1 = '00 05 01 * * *';
console.log(new Date().toISOString(),
            'Blogger1', 'process scheduled:', cronBlogger1);
new CronJob(cronBlogger1, function() {
        console.log(new Date().toISOString(), 'Blogger1', 'process started');
    Blogger1(options, function(blog) {
        console.log(new Date().toISOString(), 'Blogger1', 'process executed');
    }); // Blogger1(options, function(blog) { ... });
}, null, true, 'UTC'); // new CronJob( ... );
