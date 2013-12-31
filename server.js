var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');

var mimeTypes = {
    '.js': 'text/javascipt',
    '.html': 'text/html',
    '.css': 'text/css'
};

http.createServer(function (request, response) {
    var u = url.parse(decodeURI(request.url), true);
    var pathname = u.pathname;
    var query = u.query;
    console.log(pathname);
    console.log(query);
    var f = 'contents' + (pathname === '/' ? '/index.html' : pathname);
    console.log(f);
    fs.exists(f, function (exists) {
        if (exists) {
            fs.readFile(f, function (err, data) {
                // ファイルの読み込みに失敗した場合
                if (err) {
                    response.writeHead(500);
                    response.end('Internal Server Error');
                    return;
                }
                // 拡張子に応じてHeaderを記述
                var headers = {'Content-Type': mimeTypes[path.extname(f)]};
                console.log(headers);
                response.writeHead(200, headers);
                response.end(data);
            });
        } else {
            response.writeHead(404);
            response.end('ページが見つかりません！');
        }
        return;
    });
}).listen(3080);
