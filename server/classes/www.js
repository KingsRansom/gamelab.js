(function() {
  var _this = this,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };



  define(function() {
    var www;
    return www = (function() {
      function www(glabServer, settings, clientSettings) {
        var debug, fs, http, path,
          _this = this;
        this.glabServer = glabServer;
        this.settings = settings;
        this.clientSettings = clientSettings;
        _this.process = __bind(_this.process, this);
        _this.init = __bind(_this.init, this);
        fs = require('fs');
        http = require('http');
        path = require('path');
        debug = this.settings.debug;
        this.server = http.createServer(function(request, response) {
          var extension, file, ip, mime, parts, special, urlArgs;
          special = false;
          if (request.url === '/') {
            file = _this.settings.docRoot + '/client/index.html';
            special = true;
          } else if (request.url.substr(0, 12) === '/fileUpdate/') {
            special = true;
            ip = request.connection.remoteAddress;
            file = request.url.substr(12);
            if (ip === '127.0.0.1') {
              _this.glabServer.sockServer.fileUpdate(file);
              response.writeHead(200);
              response.end('OK');
            } else {
              console.log('/fileUpdate/ refused from', ip);
              response.writeHead(500);
              response.end();
            }
          }
          if (!special) {
            request.url = request.url.replace('..', '');
            urlArgs = request.url.split('?');
            if (urlArgs.length > 1) {
              request.url = urlArgs[0];
            }
            if (request.url.substr(0, 8) === '/shared/') {
              parts = request.url.split('/');
              parts.shift();
              parts.shift();
              file = _this.settings.docRoot + '/shared/' + parts.join('/');
            } else {
              file = _this.settings.docRoot + '/client/' + request.url;
            }
            extension = path.extname(file);
            if (_this.settings.mimes[extension] != null) {
              mime = _this.settings.mimes[extension];
            } else {
              file = '404.htm';
              mime = _this.settings.mimes['.htm'];
            }
          }
          return fs.exists(file, function(ok) {
            if (ok) {
              if (debug > 3) {
                console.log('200 OK', file);
              }
              return fs.readFile(file, function(error, data) {
                if (error) {
                  if (debug > 1) {
                    console.log('500: ', '"' + file + '"', error);
                  }
                  response.writeHead(500);
                  return response.end();
                } else {
                  response.writeHead(200, {
                    'Content-Type': mime
                  });
                  return response.end(_this.process(file, data), _this.settings.encoding);
                }
              });
            } else {
              if (debug > 1) {
                console.log('404 Not Found', file);
              }
              response.writeHead(404, {
                'Content-Type': 'text/html'
              });
              return response.end('404', 'utf-8');
            }
          });
        });
      }

      www.prototype.init = function(callback) {
        this.server.listen(this.settings.port);
        return callback();
      };

      www.prototype.process = function(fileName, fileData) {
        if (fileName.substr(-10) === 'index.html') {
          fileData = String(fileData).replace('{{SETTINGS}}', this.clientSettings);
        }
        return fileData;
      };

      return www;

    })();
  });

}).call(this);
