# Markdown WordPress Post With Gist Code Blocks

This project is intend to replace code blocks from markdown to github gist code blocks in a WordPress post.

To use this project you will need to have [NodeJS](https://nodejs.org/), a [GitHub token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/), a working [WordPress](https://wordpress.org/) account, and the [oEmbed Gist](https://wordpress.org/plugins/oembed-gist/) plugin

Right now it is working just for [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/) syntax.

## Usage

1. Clone this repo

        git clone git@github.com:fiddus/markdown-gist.git

1. Create a `.configs` file with the follow content

        {
            "github": {
                "type": "oauth",
                "token": "insert your token here"
            }
        }

1. Now execute the file with the markdown file with code blocks you want to display github blocks

        node main.js <file.md>

## Test if it worked

    node main.js spec/helpers/test.md

If every thing went well, you get some answer like this on your console

    ****************************************************************
    *** Your file has been generated.
    *** Copy the text between dashed lines
    ****************************************************************
    ----------------------------------------------------------------
    # Lets See

    https://gist.github.com/<user>/798316497939f203a323#file-test-0-js

    ## Other html

    https://gist.github.com/<user>/798316497939f203a323#file-test-1-html

    End of File
    ---

    ----------------------------------------------------------------
