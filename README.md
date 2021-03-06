Gamelab.js
========

A game engine based on node.js and three.js by Seandon Mooy

Key contributors list:
	Jeromy M.

Install node modules (as always, read the code itsself if you're curious!)

`./gamelab.js/server/install.sh`

To create a new project

`./gamelab.js/server/gamelab.sh myAwesomeProject`

Starting the server!

`cd myAwesomeProject/server/`

`./init.js`

`http://127.0.0.1:8080`

To get started quick, open client/scenes/example.coffee in your favorite editor and make a quick change to the code (try turning the material's wireframe flag on/off) and save the file. You'll see init.js:

- compile the coffeescript into javascript
- determines what needs to be reloaded
- refreshes the browser, server, or both, or none!
- show you the results of your code change in mere seconds!

The structure of gamelab.js and of your new project dir:

## gamelab.js/shared/core.coffee

all core files extend from this. contains the loadModules and route functions.

## gamelab.js/server/core.coffee

the server (both web and socket) code, which loads it own modules. Runs on node.js via init.sh (init.sh compiles code and notifies the server of changes, after that it just wraps server/core). You see that server/core loads **server/settings.coffee**, some of which are delivered to the client (see server/www)

## gamelab.js/client/core.coffee

the browser code! Runs in all modern browsers (hopefully!), and is offered up by server/classes/www on whatever port is configured (I use 8080 for web and 8082 for socket, see server/settings).

In your project directory, you'll see you have a mirrored layout to gamelab.js. project/server/core simply extends gamelab.js/server/core therefore it contains all code in gamelab.js/shared/core as well.

Shared modules and classes should be clear from how core works, but it's something I haven't buffed out as much as I'd like to. Ideally your server can access the same code your client can, and assuming things are split correctly, very complex issues like interpolation become trivial - a server/classes/dog runs as fast as a client/classes/dog because they're both extensions of shared/classes/dog.

Remember, init.js will stay open, running the web server, socket server, and compiling your coffeescript. Keep an eye on it for coffeescript compile errors, or server runtime errors!

Gamelab is not meant to be monolithic - in fact it's a small set of scripts hobbled together to create a boilerplate for creating all sorts of javascript applications. My typical use case is writing 99% of my application in a single scene - at some point your project will grow past needing gamelab as a bootstrap - at that point I recommend scrapping it and just stealing init.js :)

This is my first more or less major code release as a programmer - so I'd like to truly thank anyone who either reads this or actually uses the code. Thanks so much for your time, patience, and interest!

Good luck!