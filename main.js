'use strict';

(function () {
    var markdownGist = require('./lib/markdown-gist'),
        filename = process.argv[2];

    markdownGist.parseGitHubMarkdownFile(filename);
})();


