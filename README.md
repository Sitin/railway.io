## About

Binds Socket.IO to Railway.JS actions.
This project is currently a fork of the Anatoliy Chackaev's 1602/rw.io.

## Installataion

    npm install socket.io rw.io
    echo "require('rw.io');" >> npmfile.js

## API

### routes

    map.socket('some-event', 'controller#action');

When client emit event `some-event`, then `action` action of controller
`controller` will gain control. Data passed to event will be available as
`params` variable.

### controller

    action('some-action', function () {
        socket().emit('event', {some: 'data'}); // send 'event' to current client
        socket(anotherSessionID).emit('hello'); // send 'hello' to another user
                                                // identifyed by anotherSessionID
    });

Any controller action (both socket and non-socket) can emit some event with
connected client (current session client). If you want to communicate with
another user need to specify session id as param of `socket` method.

Other socket.io API will be available later: join, broadcast, etc..

## License

   MIT
