# shared game lab core
# by Seandon Mooy

# Keep in mind, -everything here- needs to be interpretable by both Node
# and EVERY MODERN BROWSER. One does not simply 'add code' to shared core.

# expected global: requireJS
define () ->
	requireJS = require 'requirejs'
	return class sharedGlabCore
		# System wide globals.
		constructor: () ->
			@modules = {}
			@events  = {}
		# Logger functionality
		log: () =>
			Function.apply.call console.log, console, arguments
		# Provided a list of modules, loads and calls back
		# { Name: filePath }
		loadModules: (moduleList, callback) =>
			# Load modules and callback when complete
			fileList = []
			for moduleName, modulePath of moduleList
				fileList.push modulePath
			try
				requireJS fileList, () =>
					for klass in arguments
						@modules[klass.name] = klass
					callback()
			catch error
				@.log "loadModules error"
				throw error
		# Adds an event to @events
		addRoute: (route, callback) =>
			# Complex route
			if route.substr(0, 1) == '/'
				parts = route.split '/'
				parts.shift()
				eventName = parts.shift()
				if parts.length > 0
					@events[eventName] = { map: parts, callback: callback }
				else
					@events[eventName] = { callback: callback }
			# Simple route
			else
				@events[route] = { callback: callback }
		# Finds existing events based on provided route and runs them
		findRoute: (route, metadata) =>
			# Simple route
			if @events[route]?
				@.runRoute route, metadata
			else
				style = route.substr(0, 1)
				# Complex route
				if style == '/'
					parts = route.split '/'
					parts.shift()
					metadata = {} if !metadata?
					metadata.route = parts
					@.runRoute parts.shift(), metadata
				# JSON, blob of routes
				# Recursivly run routes till the bottom of the stack
				else if style == '{'
					try
						if typeof route == "Object"
							json = route
						else
							json = JSON.parse route
					catch error
						@.log 'JSON parse error'
						throw error
					finally
						for route, metadata of json
							@.findRoute route, metadata
				else
					@.log 'Unknown route style', style