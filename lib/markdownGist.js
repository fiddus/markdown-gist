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
        });

    // Functions
    module.exports = {
        readFile: function (file, encode) {
            return fs.readFileSync(file, encode, function (err, data) {
                if (err) {
                    throw err;
                }

                return data;
            });
        },

        getExtension: function (extension) {
            extension = extension.toLowerCase();
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
                case 'css':

                    return '.css';
                default:

                    return '.txt';
            }
            // jscs:enable
        },

        makeGistFiles: function (fileName, blocks) {
            var filesArray = {},
                originalName = fileName;

            _.forEach(blocks, function (block) {
                var newFile = {},
                    blockHead = block.match(/^```(?:\w+)$/gm).shift(),
                    fileType = blockHead.replace(/```/, '');

                newFile.type = mime.lookup(fileType);
                newFile.language = fileType;
                newFile.content = block.substring(blockHead.length + 1, block.length - 4);

                fileName = originalName + '-' + String(count) + module.exports.getExtension(fileType);
                filesArray[fileName] = newFile;
                count++;
            });

            return filesArray;
        },

        mountWordpressPost: function (contents, originalFile) {
            var post = originalFile,
                content = contents;

            if (typeof contents !== 'object') {
                var bracketIndex = content.indexOf('{');
                content = contents.substring(bracketIndex);

                try {
                    content = JSON.parse(content);
                } catch (err) {
                    content = JSON.parse(JSON.stringify(content, null, 2));
                }
            }

            _.forEach(content.files, function (gistFile) {
                var replacer = '```'
                        + gistFile.language.toLowerCase()
                        + '\n' + gistFile.content
                        + '```',

                    gistUrl = 'https://gist.github.com/'
                        + content.owner.login + '/'
                        + content.id + '#file-'
                        + gistFile.filename.replace('.', '-');

                post = post.replace(replacer, gistUrl);
            });

            return post;
        },

        parseGitHubMarkdownFile: function (filePath) {
            sequence
                .then(function (next) {
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

                    gistFileName = filePath.split('.').shift();
                    fileContent = module.exports.readFile(filePath, encoding);
                    codeBlocks = fileContent.match(githubMarkdownRegex);
                    gistFiles = module.exports.makeGistFiles(gistFileName, codeBlocks);

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

                    fileContent = module.exports.mountWordpressPost(response, fileContent);

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
        }
    };
})();

