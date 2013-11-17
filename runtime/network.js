  var context = window;
  var noflo = context.require('noflo');
  var provider = require('./graphprovider.js');
  var Base = context.require('noflo-noflo-runtime-base');

  var WindowRuntime = function (options) {
    if (!options) {
      options = {};
    }

    if (options.catchExceptions) {
      var that = this;
      context.onerror = function (err) {
        that.send('network', 'error', {
          message: err.toString()
        }, {
          href: context.parent.location.href
        });
        return true;
      };
  
    }

    this.prototype.constructor.apply(this, arguments);
    this.receive = this.prototype.receive;
    this.listeners = [];
    provider.registerEnvironment(this);
  };
  WindowRuntime.prototype = Base;
  WindowRuntime.prototype.send = function (protocol, topic, payload, ctx) {
    if (payload instanceof Error) {
      payload = {
        message: payload.toString()
      };
    }
    for(var i=0;i<this.listeners.length;i++){
      this.listeners[i](protocol,topic,payload,ctx); 
    }
    context.opener.postMessage({
      protocol: protocol,
      command: topic,
      payload: payload
    }, '*');
  };

  WindowRuntime.prototype.getCurrentGraph =function(){
    return this.graph.graph;
  };

  WindowRuntime.prototype.addEventListener = function(listener){
    this.listeners.push(listener);
  }

  var runtime = new WindowRuntime({
    catchExceptions: true
  });

  context.addEventListener('message', function (message) {
/*
    Will hava to filter out other origins by a white list later on
    if (message.origin !== context.opener.location.origin) {
      return;
    }
*/    
    console.log("Received a Message-Level 1");
    if (!message.data.protocol) {
      return;
    }
    if (!message.data.command) {
      return;
    }
    runtime.receive(message.data.protocol, message.data.command, message.data.payload, {
      href: context.parent.location.href
    });
  });

  exports.runtime = runtime;

