/* global expect: true */

'use strict';


var markdownGist = require('../lib/markdownGist');

describe('Markdown to Gist Tests', function () {
    it('Should get right file extensions', function () {
        // Known file extensions
        expect(markdownGist.getExtension('css')).to.equal('.css');
        expect(markdownGist.getExtension('html')).to.equal('.html');
        expect(markdownGist.getExtension('javascript')).to.equal('.js');
        expect(markdownGist.getExtension('json')).to.equal('.json');
        expect(markdownGist.getExtension('markdown')).to.equal('.md');
        expect(markdownGist.getExtension('shell')).to.equal('.sh');
        expect(markdownGist.getExtension('text')).to.equal('.txt');

        // Unknown file extensions
        expect(markdownGist.getExtension('unknown')).to.equal('.txt');
    });

    it('Should mount right gist file to be sent to github', function () {
        // jscs:disable
        var blocks = [ '```javascript\n(function () {\n    console.log(\'Every thing alright\');\n })();\n```',
            '```html\n<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset="UTF-8">\n        <title>Title of the document</title>\n    </head>\n\n    <body>\n        Content of the document......\n    </body>\n</html>\n```\n'],
            fileName = 'specs-file',
            gistFiles = {
                'specs-file-0.js': {
                    type: false,
                    language: 'javascript',
                    content: '(function () {\n    console.log(\'Every thing alright\');\n })();'
                },
                'specs-file-1.html': {
                    type: 'text/html',
                    language: 'html',
                    content: '<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset="UTF-8">\n        <title>Title of the document</title>\n    </head>\n\n    <body>\n        Content of the document......\n    </body>\n</html>\n'
                }
            };

        expect(markdownGist.makeGistFiles(fileName, blocks)).to.deep.equal(gistFiles);
        // jscs:enable
    });

    it('Should mount wordpress post', function () {
        var partialResponse = {
                'id': 'd18fe87190ed4b7fcce6',
                'files': {
                    'test-0.js': {
                        'filename': 'test-0.js',
                        'language': 'JavaScript',
                        'content': '    (function () {\n        console.log(\'Everything alright\');\n    })();\n'
                    },
                    'test-1.html': {
                        'filename': 'test-1.html',
                        'language': 'HTML',
                        'content': '<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset=\"UTF-8\">\n        <title>Title of the document</title>\n    </head>\n\n    <body>\n        Content of the document......\n    </body>\n</html>\n'
                    }
                },
                'owner': {
                    'login': 'username'
                }
            },
            fileContent = '# Lets See\n'
                + '\n'
                + '```javascript\n'
                + '    (function () {\n'
                + '        console.log(\'Everything alright\');\n'
                + '    })();\n'
                + '```\n'
                + '\n'
                + '## Other html\n'
                + '\n'
                + '```html\n'
                + '<!DOCTYPE html>\n'
                + '<html>\n'
                + '    <head>\n'
                + '        <meta charset="UTF-8">\n'
                + '        <title>Title of the document</title>\n'
                + '    </head>\n'
                + '\n'
                + '    <body>\n'
                + '        Content of the document......\n'
                + '    </body>\n'
                + '</html>\n'
                + '```\n',
            post = '# Lets See\n'
                + '\n'
                + 'https://gist.github.com/username/d18fe87190ed4b7fcce6#file-test-0-js\n'
                + '\n'
                + '## Other html\n'
                + '\n'
                + 'https://gist.github.com/username/d18fe87190ed4b7fcce6#file-test-1-html\n';

        expect(markdownGist.mountWordpressPost(partialResponse, fileContent)).to.equal(post);
    });

    it('Should mount wordpress post with a string partial response', function () {
        var partialResponse = '234 some trash text' + JSON.stringify({
                    'id': 'd18fe87190ed4b7fcce6',
                    'files': {
                        'test-0.js': {
                            'filename': 'specs-0.js',
                            'language': 'JavaScript',
                            'content': '    (function () {\n        console.log(\'Everything alright\');\n    })();\n'
                        },
                        'test-1.html': {
                            'filename': 'specs-1.html',
                            'language': 'HTML',
                            'content': '<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset=\"UTF-8\">\n        <title>Title of the document</title>\n    </head>\n\n    <body>\n        Content of the document......\n    </body>\n</html>\n'
                        }
                    },
                    'owner': {
                        'login': 'username'
                    }
                }),
            fileContent = '# Lets See\n'
                + '\n'
                + '```javascript\n'
                + '    (function () {\n'
                + '        console.log(\'Everything alright\');\n'
                + '    })();\n'
                + '```\n'
                + '\n'
                + '## Other html\n'
                + '\n'
                + '```html\n'
                + '<!DOCTYPE html>\n'
                + '<html>\n'
                + '    <head>\n'
                + '        <meta charset="UTF-8">\n'
                + '        <title>Title of the document</title>\n'
                + '    </head>\n'
                + '\n'
                + '    <body>\n'
                + '        Content of the document......\n'
                + '    </body>\n'
                + '</html>\n'
                + '```\n',
            post = '# Lets See\n'
                + '\n'
                + 'https://gist.github.com/username/d18fe87190ed4b7fcce6#file-specs-0-js\n'
                + '\n'
                + '## Other html\n'
                + '\n'
                + 'https://gist.github.com/username/d18fe87190ed4b7fcce6#file-specs-1-html\n';

        expect(markdownGist.mountWordpressPost(partialResponse, fileContent)).to.equal(post);
    });

    it('Should return one error message when there are no code blocks with GitHub markdown syntax', function () {
        var errorMessage = 'Error: There are no blocks make with GitHub Markdown systax.';

        expect(markdownGist.parseGitHubMarkdownFile('./specs/helpers/testMarkdown.md')).to.be.equal(errorMessage);
    });
});
