(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };



  define(function() {
    var Socket;
    return Socket = (function() {
      function Socket(gameLab) {
        var uri,
          _this = this;
        this.gameLab = gameLab;
        this.unload = __bind(this.unload, this);
        this.send = __bind(this.send, this);
        this.socketEnd = __bind(this.socketEnd, this);
        this.refresh = true;
        window.WEB_SOCKET_SWF_LOCATION = '/libs/WebSocketMain.swf';
        if (this.gameLab.settings.uri != null) {
          uri = 'ws://' + this.gameLab.settings.uri + ':' + this.gameLab.settings.game.port;
        } else {
          uri = 'ws://' + window.location.hostname + ':' + this.gameLab.settings.game.port;
        }
        if (this.gameLab.settings.debug > 2) {
          console.log('connecting to', uri);
        }
        this.socket = io.connect(uri);
        this.socket.on('connect', function() {
          _this.socket.on('message', function(message) {
            console.log(message);
            return _this.gameLab.findRoute(message);
          });
          return _this.socket.on('disconnect', function() {
            if (_this.refresh) {
              return _this.socketEnd();
            }
          });
        });
      }

      Socket.prototype.socketEnd = function() {
        var restart, timer, uri,
          _this = this;
        if (this.gameLab.settings.debug > 1) {
          console.log('Server down');
        }
        if (this.gameLab.settings.uri != null) {
          uri = 'http://' + this.gameLab.settings.uri + ':' + this.gameLab.settings.www.port;
        } else {
          uri = 'http://' + window.location.hostname + ':' + this.gameLab.settings.www.port;
        }
        timer = false;
        restart = function() {
          clearInterval(timer);
          return window.location = uri;
        };
        return timer = setInterval(restart, 100);
      };

      Socket.prototype.send = function(line) {
        if (this.gameLab.settings.debug > 2) {
          console.log('Sending ', line);
        }
        return this.socket.send(line);
      };

      Socket.prototype.unload = function(callback) {
        var uri;
        if (this.gameLab.settings.uri != null) {
          uri = 'http://' + this.gameLab.settings.uri + ':' + this.gameLab.settings.www.port;
        } else {
          uri = 'http://' + window.location.hostname + ':' + this.gameLab.settings.www.port;
        }
        return window.location = uri;
      };

      return Socket;

    })();
  });

}).call(this);
