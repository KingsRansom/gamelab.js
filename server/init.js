#!/usr/bin/node
// Init.js v2
// Init script for GameLib servers. Written by Seandon Mooy.
// in 'dev' mode, watches a directory and compiles coffeescript, then restarting the server core process
// in 'prod' mode, starts server core and TODO alarms an email / system if process dies.
(function() {
  var environmentMode = 'dev', fs = require('fs'), system = require('sys'), child_process = require('child_process'), spawn = child_process.spawn, compiler = require('iced-coffee-script'), watch = require('watch'), rjs = require('requirejs'), http = require('http'), coreFile = 'core.js', settingsFile = 'settings.js', directoryToWatch = '../.', red = '\033[31m', blue = '\033[34m', green = '\033[32m', cyan = '\033[36m', reset = '\033[0m',
  output, startDaemon, stopDaemon, restart, coffee2js, p, httpUpdate, settings, uri;
  // Format STDOUT
  output = function(msg) {
      if (msg.length > 0) {
        msg = msg.toString('utf8');
        if (msg.length > 0) return console.log(msg.replace("\n", ''));
      }
  };
  // Spawn and bind process
  startDaemon = function() {
    p = spawn("node", [coreFile]);
    p.on('close', function(code, signal) {
      var processRunning;
      return processRunning = false;
    });
    p.stdout.on('data', function(something) {
      return output(something);
    });
    p.stderr.on('data', function(something) {
      return output(something);
    });
  };
  stopDaemon = function() {
      p.kill();
  };
  restart = function() {
      date = new Date();
      console.log(date.toString().substr(0, 24), cyan+'restart()'+reset+' called by init.js');
      stopDaemon();
      startDaemon();
  };
  // Takes a .coffee and a callback, compiles the .coffee to .js and returns cb(filename, jsCode)
  coffee2js = function(f, callback, silence) {
    date = new Date();
    dateString = date.toString().substr(0, 24);
    if(typeof(silence) == "undefined"){ 
      process.stdout.write(dateString+' '+green+'compiling'+reset+' '+f);
    }
    coffeeCode = fs.readFileSync(f, 'ascii');
    js = false;
    try {
      js = compiler.compile(coffeeCode);
    } catch(error){
      console.log(dateString, red+'COMPILE ERROR'+reset+' on line', '#'+(error.location.first_line+1)+':', blue+error.message+reset, 'excerpt:');
      codeBreakout = coffeeCode.split("\n");
      errorStart = error.location.first_line;
      if(codeBreakout[errorStart-2] != null)
        console.log('#'+(errorStart-1)+':', codeBreakout[errorStart-2])
      if(codeBreakout[errorStart-1] != null)
        console.log('#'+(errorStart)+':', codeBreakout[errorStart-1])
      if(codeBreakout[errorStart] != null)
        console.log(blue+'#'+(errorStart+1)+':'+reset, codeBreakout[errorStart])
      if(codeBreakout[errorStart+1] != null)
        console.log('#'+(errorStart+2)+':', codeBreakout[errorStart+1])
      if(codeBreakout[errorStart+2] != null)
        console.log('#'+(errorStart+3)+':', codeBreakout[errorStart+2])
      codeBreakout = coffeeCode = null
    } finally {
      if (js){
        jsfile = f.replace('.coffee', '.js');
        //fs.unlink(jsfile, function() {
        fs.writeFile(jsfile, js, function() {
          if(typeof(silence) == "undefined"){ 
            finish = new Date();
            console.log(green+' done'+reset, 'took', (finish-date)/1000, 'seconds');
          }
          callback();
          js = null;
        });
        //});
      }
    }
    //}
    //});
  };
  httpUpdate = function(msg, callback){
    var options = {
      host: "127.0.0.1", // TODO: why doesnt localhost work here?
      port: settings.www.port,
      path: '/fileUpdate/'+msg
    };
    http.get(options, function(response){
      response.on('data', function(chunk){
        var reply = chunk.toString();
        if(reply != "OK"){
          console.log('httpUpdate: webserver said', reply);
          if(callback !== null){
            callback();
          }
        }
      });
    }).on("error", function(err){
      console.log("httpUpdate error:", err)
    });
  };
  coffee2js(settingsFile.replace('.js', '.coffee'), function(){ // Compile the settings file
    rjs([ settingsFile ], function(settingsKlass){ // read settings
      settings = new settingsKlass();
      if (environmentMode == 'prod') {
        startDaemon(); // in 'prod' mode, don't watch the directory.
      } else {
        date = new Date();
        console.log(date.toString().substr(0, 24), cyan+'Gamelab.js is READY'+reset, '> port', settings.www.port)
        watch.watchTree(directoryToWatch, function(f, curr, prev) { // Watch for changes in this dir
          var js, jsfile;
          if (typeof f === 'object' && prev === null && curr === null) { // initial scan, run once
            startDaemon();
          } else if (prev === null) {} else if (curr.nlink === 0) {} else {
            if (f.indexOf('.coffee') !== -1) {
              if (f.indexOf('node_modules') !== -1) { // skip node_modules
                //console.log('node module changed, not restarting');
              } else if (f.indexOf('gamelabClient') !== -1){ // Ignore paths in client's symlinks
                //console.log('in symlink');
              } else if (f.indexOf('gamelabShared') !== -1){
                //console.log('in symlink');
              } else if (f.indexOf('/client/') !== -1){
                coffee2js(f, function(){
                  //restart();
                  httpUpdate(f);
                });
              } else {
                // Fallback compile and restart
                try {
                  coffee2js(f, function(){
                    restart();
                  });
                } catch (e) {
                  console.log(red+'Compile error:'+reset, e);
                }
              }
            } else if ((f.indexOf('.png') !== -1) || f.indexOf('.jpg') !== -1) {
              // image changed - tell the server about it!
              //console.log('an image changed, etc - TODO: send server update');
              httpUpdate(f);
            } else {
              //console.log('unhandled file', "'"+f+"'", 'changed');
              // Do something with unhandled files

            }
          }
        });
      }
    });
  }, true);
}).call(this);