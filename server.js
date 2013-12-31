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
var cacheAndDeliver = function(file, callback){
    fs.stat(file, function(err, stats) {
        var ctime = Date.parse(stats.ctime);
        var isUpdated = cache[file] && (ctime > cache[file].timestamp);
        if (cache[file] && !isUpdated) { // キャッシュから読み込み
            console.log("read from cache:" + file);
            callback(null, cache[file].contents);
            return;
        } else { // FileからRead
            fs.readFile(file, function(err, data) {
                if (!err) {
                    cache[file] = {
                        contents: data,
                        timestamp: Date.now()
                    };
                }
                callback(err, data);
            });
        }
    });
};

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
            cacheAndDeliver(file, function (err, data) {
                // ファイルの読み込みに失敗した場合
                if (err) {
                    response.writeHead(500);
                    response.end('Internal Server Error');
                    return;
                }
                // 拡張子に応じてHeaderを記述
                var headers = {'Content-Type': mimeTypes[path.extname(file)]};
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
