'use strict';

(function () {
    var markdownGist = require('./lib/markdownGist'),
        filename = process.argv[2];

    markdownGist.parseGitHubMarkdownFile(filename);
})();


