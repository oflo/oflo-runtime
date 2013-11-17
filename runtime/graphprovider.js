var noflo = require('noflo');

var _runtime =null;

var _isLocal = true;

function _handlelocal(options,callback,error){
	if(typeof options.path !=='string'){
		throw new Error('Options must contain a property "path"')
	}
	if(typeof options.baseDir !=='string'){
		throw new Error('Options must contain a property "baseDir"')
	}
	$.ajax({
  		dataType: "json",
  		url: options.path,  		
  		success: function(data,status,xhr){
			noflo.graph.loadJSON(data, function (graph) {
        		graph.baseDir = options.baseDir;
        		var network = noflo.createNetwork(graph);
        		if(typeof callback === 'function'){
        			callback(graph,network);	
        		}        		
        	});
  		},
  		error: function(xhr,textMessage,errorThrown){
  			if(typeof error !== 'function') return;

  			if(xhr.status ===404){//File Not Found
  				error({
  					status:404,
  					type: 'http',
  					text: "File '"+options.path+"' not found"
  				});
  				return;
  			}
  			error({
  				status:xhr.status,
  				type: 'http',
  				text: textMessage
  			})

  		}
	});
}

function _handleremote(options,callback,error){
	_isLocal=false;
	var calledBack =false;
	_runtime.addEventListener(function(protocol,topic,payload,context){
		console.log("received an event:("+protocol+":"+topic+")");
		if(!calledBack && _runtime.graph.graph!==null && _runtime.network.network !== null){
			calledBack=true;
			callback(_runtime.graph.graph,_runtime.network.network);
		}
	})
}

/**
* This method is used by noflo - runtimes to register themself to the graph provider

*/
exports.registerEnvironment = function(runtime){
	console.log("Register environment");
	_runtime = runtime;
	
}

exports.isLocal = _isLocal;


/**
 * Initializes a noflo graph and network. Based on the options the graph is either provided locally (from the server) or remotely 
 * from a controlling environment like the noflo-ui.
 * @param {object} options - Options for initializing the noflo-execution. If no valid options are provided an exception is thrown.
 * @param {function} callback - The callback to be called with the graph and the network for further handling
 * @parem {function} error - The error callback to be called when 
 */
exports.initializeOrionFlo = function(options,callback,error){
	if(typeof options !== 'object' || options ===null){
		throw new Error('Options must be provided');
	}
	if( options.type !== 'local' && options.type !== 'remote'){
		throw new Error('Options must contain a property "type" with values ["local"|"remote"]');
	}
	if(options.type==='local'){
		_handlelocal(options,callback,error);
	}
	if(options.type==='remote'){
		_handleremote(options,callback,error);
	}
}