'use strict';


(function () {
    var
    // Packages
        fs = require('fs'),
        configs = JSON.parse(fs.readFileSync('.configs')),
        Sequence = require('sequence').Sequence,
        _ = require('lodash'),
        GitHubAPI = require('github'),
        mime = require('mime-types'),

    // Setups
        encoding = {encoding: 'utf8', flag: 'r'},
        githubMarkdownRegex = /^```(?:\w+)?\n([\s\S]*?)\n```\n/gm,
        sequence = Sequence.create(),

    // Variables
        gistFileName = '',
        fileContent = '',
        codeBlocks = [],
        gistFiles = {},
        count = 0,
        response = {},


    // Configurations
        github = new GitHubAPI({
            version: '3.0.0',
            debug: false,
            protocol: 'https',
            timeout: 5000,
            host: 'api.github.com',
            headers: {
                'user-agent': 'NodeJS HTTP Client'
            }
        }),

    // Functions
        readFile = function (file, encode) {
            return fs.readFileSync(file, encode, function (err, data) {
                if (err) {
                    throw err;
                }

                return data;
            });
        },

        getExtension = function (extension) {
            // jscs:disable
            switch (extension) {
                case 'javascript':

                    return '.js';
                case 'html':

                    return '.html';
                case 'markdown':

                    return '.md';
                case 'json':

                    return '.json';
                case 'shell':

                    return '.sh';
                default:

                    return '.txt';
            }
            // jscs:enable
        },

        makeGistFiles = function (fileName, blocks) {
            var filesArray = {},
                originalName = fileName;

            _.forEach(blocks, function (block) {
                var newFile = {},
                    blockHead = block.match(/^```(?:\w+)$/gm).shift(),
                    fileType = blockHead.replace(/```/, '');

                newFile.type = mime.lookup(fileType);
                newFile.language = fileType;
                newFile.content = block.substring(blockHead.length + 1, block.length - 4);

                fileName = originalName + '-' + String(count) + getExtension(fileType);
                filesArray[fileName] = newFile;
                count++;
            });

            return filesArray;
        },

        mountWordpressPost = function (contents, originalFile) {
            var content = contents.replace(/^(\w|\W)*(\"\})$/gm, ''),
                post = originalFile;

            try {
                content = JSON.parse(content);
            } catch (err) {
                content = JSON.parse(JSON.stringify(content, null, 2));
            }

            _.forEach(content.files, function (gistFile) {
                var replacer = '```'
                        + gistFile.language.toLowerCase()       // jshint ignore:line
                        + '\n' + gistFile.content               // jshint ignore:line
                        + '```',                                // jshint ignore:line

                    gistUrl = 'https://gist.github.com/'
                        + content.owner.login + '/'             // jshint ignore:line
                        + content.id + '#file-'                 // jshint ignore:line
                        + gistFile.filename.replace('.', '-');  // jshint ignore:line

                post = post.replace(replacer, gistUrl);
            });

            return post;
        },

        parseGitHubMarkdownFile = function (filePath) {
            sequence
                .then(function (next) {
                    gistFileName = filePath.split('.').shift();
                    fileContent = readFile(filePath, encoding);
                    codeBlocks = fileContent.match(githubMarkdownRegex);
                    gistFiles = makeGistFiles(gistFileName, codeBlocks);

                    next();
                })
                .then(function (next, err) {
                    if (err) {
                        next(err);
                    }

                    github.authenticate({
                        type: configs.github.type,
                        token: configs.github.token
                    });

                    next();
                })
                .then(function (next, err) {
                    if (err) {
                        next(err);
                    }

                    github.gists.create({
                        description: 'Gist Test from API',
                        public: true,
                        files: gistFiles
                    }, function (err, data) {
                        if (err) {
                            console.log('Error:', JSON.parse(err).message);

                            return false;
                        }

                        response = JSON.stringify(data, null, 2);
                        next();
                    });
                })
                .then(function (next, err) {
                    if (err) {
                        next(err);
                    }

                    fileContent = mountWordpressPost(response, fileContent);

                    next();
                })
                .then(function (next, err) {
                    if (err) {
                        next(err);
                    }

                    console.log('****************************************************************');
                    console.log('*** Your content has been generated.');
                    console.log('*** Copy the text between dashed lines');
                    console.log('****************************************************************');
                    console.log('----------------------------------------------------------------');
                    console.log(fileContent);
                    console.log('----------------------------------------------------------------');
                });
        };

    module.exports = parseGitHubMarkdownFile;
})();
