/**
 * Blogger 1: dig information from a web page
 * @author:  MarcoXZh3
 * @version: 0.0.1
 */
const cheerio = require('cheerio')
const fs = require('fs');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const steem = require('steem');

/**
 * The main process
 * @param {json}        parentOptions   the options from caller
 * @param {function}    callback        the callback function
 */
module.exports = function(parentOptions, callback) {
    fs.readFile(__filename.replace(/\.js$/g, '.json'),
                { encoding:'utf8', flag:'r'}, function(err, data) {
        if (err) {
            throw err;
        } // if (err)
        var options = JSON.parse(data.toString());
        for (k in parentOptions) {
            options[k] = parentOptions[k];
        } // for (k in parentOptions)
        options.db = new sqlite3.Database(options.sqlite3, function(err) {
            if (err) {
                throw err;
            } // if (err)
            options.db.run(
                `CREATE TABLE IF NOT EXISTS blogs (
                    created     INTEGER,
                    author      TEXT,
                    title       TEXT,
                    permlink    TEXT,
                    tags        TEXT,
                    body        TEXT
                );`
            ); // options.db.run( ... );

            // Run the job
            runJob(options, callback);
        }); // options.db = new sqlite3.Database(options.sqlite3, function(err) );
    }); // fs.readFile( ... );
}; // module.exports = function(parentOptions, callback) { ... };


/**
 * Run the job of blogger1
 * @param {json}        options     settings for the job
 * @param {function}    callback    (optional) the callback function
 */
var runJob = function(options, callback) {
    https.get(options.url, function(res) {
        res.on('error', function(err) {
            throw err;
        }); // res.on('error', function(err) { ... });
        var html = '';
        res.on('data', function(data) {
            html += data;
        }); // res.on('data', function(data) { ... });
        res.on('end', function() {
            const $ = cheerio.load(html);
            console.log(new Date().toISOString(), 'Blogger1', 'DOM retrieved');

            // Grab target information from DOM
            retrieve(options, $, callback);
        }); // res.on('end', function() { ... });
    }); // https.get(options.url, function(res) { ... });
}; // var runJob = function(options, callback) { ... };


/**
 * Retrieve target information from the DOM
 * @param {json}        options     settings for the job
 * @param {object}      $           the DOM tree
 * @param {function}    callback    (optional) the callback function
 */
var retrieve = function(options, $, callback) {
    var data = {};
    data.title = $('title').text();
    // TODO: 1 retrieve target data from DOM




    console.log(new Date().toISOString(), 'Blogger1', 'data analyzed');

    // Prepare the blog text using the data
    prepareBlog(options, data, callback);
}; // var retrieve = function(options, $, callback) { ... };


/**
 * Prepare the blog text
 * @param {json}        options     settings for the job
 * @param {json}        data        the data for the blog
 * @param {function}    callback    (optional) the callback function
 */
var prepareBlog = function(options, data, callback) {
    fs.readFile(__filename.replace(/\.js$/g, '.md'),
                { encoding:'utf8', flag:'r'}, function(err, txt) {
        if (err) {
            throw err;
        } // if (err)
        var blog = {
            author:         options.author.name,
            title:          options.title,
            json_metadata:  options.json_metadata
        }; // var blog = { ... };
        // TODO: 2 prepre the blog
        blog.body = txt.toString().replace('$TITLE', data.title);





        console.log(new Date().toISOString(), 'Blogger1', 'blog ready');

        // Vote and save the blog
        publishAndSave(options, blog, callback);
    }); // fs.readFile( ... );
}; // var prepareBlog = function(options, data, callback) { ... };


/**
 * 
 * @param {json}        options     settings for the job
 * @param {json}        blog        the blog to be published
 * @param {function}    callback    (optional) the callback function
 */
var publishAndSave = function(options, blog, callback) {
    // Publish
    var permlink = options.author.name + '-cn-the-title-' +
                   new Date().toISOString().split('T')[0];

    setTimeout(function() {
    // steem.broadcast.comment(options.author.posting_key, '', 'cn', blog.author,
    //                         permlink, blog.title, blog.body, blog.json_metadata,
    //                         function(err, re) {
    //     if (err) {
    //         throw err;
    //     } // if (err)
    console.log(new Date().toISOString(), 'Blogger1', 'blog published');

        // Published, now save it to database
        options.db.all(`SELECT permlink FROM blogs WHERE permlink=?`, [permlink],
                       function(err, rows) {
            if (err) {
              throw err;
            } // if (err)

            // Determine whether insert new or update old
            var sql = (rows.length === 0) ?
                `INSERT INTO blogs(created, author, title, permlink, tags, body)
                             VALUES(?, ?, ?, ?, ?, ?)` :
                `UPDATE blogs SET created=?, author=?, title=?, permlink=?,
                                  tags=?, body=? WHERE permlink=?`
            var values = [
                new Date().getTime(),
                blog.author,
                blog.title,
                permlink,
                JSON.stringify(blog.json_metadata.tags),
                blog.body
            ]; // values = [ ... ];
            if (rows.length > 0) {
                values.push(permlink);
                console.warn(new Date().toISOString(), 'Blogger1',
                            'blog already published; now updated');
            } // if (rows.length > 0)

            // Run the SQL
            options.db.run(sql, values, function(err) {
                if (err) {
                    throw err;
                } // if (err)
                options.db.close();
                console.log(new Date().toISOString(), 'Blogger1', 'blog saved');

                // All done, return
                if (callback) {
                    callback(blog);
                } // if (callback)

            }); // options.db.run(sql, values, function(err) { ... });
        }); // options.db.all( ... });
    // }); // steem.broadcast.comment( ... );
    }, 1000);
}; // var publishAndSave = function(options, blog, callback) { ... };
