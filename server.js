var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');

// MimeTypeのマッピングを定義
var mimeTypes = {
    '.js': 'text/javascipt',
    '.html': 'text/html',
    '.css': 'text/css'
};

// コンテンツキャッシュ
var cache = {};

http.createServer(function (request, response) {
    var u = url.parse(decodeURI(request.url), true);
    var pathname = u.pathname;
    var query = u.query;
    console.log(pathname);
    console.log(query);
    var file = 'contents' + (pathname === '/' ? '/index.html' : pathname);
    console.log(file);
    fs.exists(file, function (exists) {
        if (exists) {
            fs.stat(file, function(err, stats) {
                var ctime = Date.parse(stats.ctime);
                var isUpdated = (cache[file]) && (ctime > cache[file].timestamp);
            
                var headers = {'Content-Type': mimeTypes[path.extname(file)]};
                console.log(headers);
                if (cache[file] && !isUpdated) {
                    console.log('Read from cache : ' + file);
                    response.writeHead(200, headers);
                    response.end(cache[file].content);
                    return;
                }
    
                // ストリーミングでファイルを配信する
                var s = fs.createReadStream(file).once('open', function (){
                    response.writeHead(200, headers);
                    this.pipe(response);
                }).once('error', function (e){
                    console.log(e);
                    response.writeHead(500);
                    response.end('Internal Server Error');
                });
                
                // readStreamの内容をキャッシュにも書き込む
                var bufferOffset = 0;
                cache[file] = {
                    content: new Buffer(stats.size),
                    timestamp: Date.now()
                };
                s.on('data', function (data) {
                    data.copy(cache[file].content, bufferOffset);
                    bufferOffset += data.length;
                });
            });
        } else {
            response.writeHead(404);
            response.end('ページが見つかりません！');
        }
        return;
    });
}).listen(3080);
