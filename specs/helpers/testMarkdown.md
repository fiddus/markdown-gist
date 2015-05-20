# Lets See

    var fs = require('fs');
    var path = require('path');

    var filePath = path.join(__dirname, 'start.html');

    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (!err){
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.end();
        }else{
            console.log(err);
        }
    });

## Other html

    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <title>Title of the document</title>
        </head>

        <body>
            Content of the document......
        </body>
    </html>

End of File

