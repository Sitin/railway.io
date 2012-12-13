(function() {
  "use strict";

  var fn, sio;

  sio = require('socket.io');

  fn = function() {};

  exports.init = function() {
    var io, map;
    io = sio.listen(app);
    railway.controller.Controller.prototype.socket = function(id) {
      return io.sockets["in"](id || this.req.sessionID);
    };
    map = [];
    railway.routeMapper.socket = function(msg, handle) {
      return map.push({
        event: msg,
        controller: handle.split('#')[0],
        action: handle.split('#')[1]
      });
    };
    app.stack.forEach(function(m) {
      var cookieParser, session;
      switch (m.handle.name) {
        case 'cookieParser':
          return cookieParser = m.handle;
        case 'session':
          return session = m.handle;
      }
    });
    io.set('authorization', function(req, accept) {
      if (!req.headers.cookie) {
        accept('No cookie transmitted.', false);
      }
      req.on = fn;
      req.removeListener = function() {
        return delete req.on;
      };
      return cookieParser(req, null, function(err) {
        if (err) {
          accept('Error in cookie parser', false);
        }
        return session(req, {
          on: fn,
          end: fn
        }, function(err) {
          return accept(null, true);
        });
      });
    });
    return io.sockets.on('connection', function(socket) {
      var bridge, hs;
      console.log(socket.handshake.sessionID);
      hs = socket.handshake;
      console.log('A socket with userId %s connected!', hs.sessionID);
      socket.on('disconnect', function() {
        return console.log('A socket with sessionID %s disconnected!', hs.sessionID);
      });
      socket.join(hs.sessionID);
      bridge = new railway.ControllerBridge(app.root);
      return map.forEach(function(r) {
        return socket.on(r.event, function(data) {
          var ctl;
          ctl = bridge.loadController(r.controller);
          return ctl.perform(r.action, {
            session: hs.session,
            sessionID: hs.sessionID,
            params: data
          }, {}, fn);
        });
      });
    });
  };

}).call(this);
