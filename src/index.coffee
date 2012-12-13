"use strict"

sio = require 'socket.io'
fn = ->

exports.init = ->
  io = sio.listen app

  railway.controller.Controller.prototype.socket = (id) ->
    io.sockets.in id or @req.sessionID

  map = []

  railway.routeMapper.socket = (msg, handle) ->
    map.push
      event: msg
      controller: handle.split('#')[0]
      action: handle.split('#')[1]

  app.stack.forEach (m) ->
    switch m.handle.name
      when 'cookieParser' then cookieParser = m.handle
      when 'session'then session = m.handle

  io.set 'authorization', (req, accept) ->
    # check if there's a cookie header
    if (!req.headers.cookie)
      # if there isn't, turn down the connection with a message
      # and leave the function.
      accept 'No cookie transmitted.', false

    req.on = fn
    req.removeListener = ->
      delete req.on

    cookieParser req, null, (err) ->
      if (err)
        accept 'Error in cookie parser', false
      session req, on: fn, end: fn, (err) ->
        accept null, true

  io.sockets.on 'connection', (socket) ->
    console.log socket.handshake.sessionID
    hs = socket.handshake
    console.log 'A socket with userId %s connected!', hs.sessionID

    # clear the socket interval to stop refreshing the session
    socket.on 'disconnect', ->
      console.log 'A socket with sessionID %s disconnected!', hs.sessionID

    socket.join hs.sessionID

    bridge = new railway.ControllerBridge app.root
    map.forEach (r) ->
      socket.on r.event, (data) ->
        ctl = bridge.loadController r.controller
        ctl.perform r.action,
          session: hs.session
          sessionID: hs.sessionID
          params: data, {}, fn