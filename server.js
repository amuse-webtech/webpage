var http = require('http');
//var path = require('path');
var url = require('url');

var pages = [
    {route: "/", output: "TopPage"},
    {route: "/about", output: "About"},
    {route: "/function", output: function(){
            return "This is " + this.route;
        }
    }
];

http.createServer(function (request, response) {
    var u = url.parse(decodeURI(request.url), true);
    var pathname = u.pathname;
    var query = u.query;
    console.log(pathname);
    console.log(query);
    pages.forEach(function(page) {
        if (page.route === pathname) {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(typeof page.output === 'function' ? 
                page.output() : page.output);
        }
    });
    if (!response.finished) {
        response.writeHead(404);
        response.end('ページが見つかりません！');
    }
}).listen(3080);
