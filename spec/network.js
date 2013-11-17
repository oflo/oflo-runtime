describe('Child window network runtime', function() {
  var origin, receive, send;
  origin = window.location.origin;
  send = function(protocol, command, payload) {
    return child.postMessage({
      protocol: protocol,
      command: command,
      payload: payload
    }, child.location.href);
  };
  receive = function(expects, done) {
    var listener;
    listener = function(message) {
      var expected;
      chai.expect(message).to.be.an('object');
      expected = expects.shift();
      chai.expect(message.data).to.eql(expected);
      if (expects.length === 0) {
        window.removeEventListener('message', listener, false);
        return done();
      }
    };
    return window.addEventListener('message', listener, false);
  };
  describe('Graph Protocol', function() {
    describe('receiving a graph and nodes', function() {
      return it('should provide the nodes back', function(done) {
        var expects;
        expects = [
          {
            protocol: 'graph',
            command: 'addnode',
            payload: {
              id: 'Foo',
              component: 'core/Repeat',
              metadata: {
                hello: 'World'
              }
            }
          }, {
            protocol: 'graph',
            command: 'addnode',
            payload: {
              id: 'Bar',
              component: 'core/Drop',
              metadata: {}
            }
          }
        ];
        receive(expects, done);
        send('graph', 'clear', {
          baseDir: '/oflo-runtime'
        });
        send('graph', 'addnode', expects[0].payload);
        return send('graph', 'addnode', expects[1].payload);
      });
    });
    describe('receiving an edge', function() {
      return it('should provide the edge back', function(done) {
        var expects;
        expects = [
          {
            protocol: 'graph',
            command: 'addedge',
            payload: {
              from: {
                node: 'Foo',
                port: 'out'
              },
              to: {
                node: 'Bar',
                port: 'in'
              },
              metadata: {
                route: 5
              }
            }
          }
        ];
        receive(expects, done);
        return send('graph', 'addedge', expects[0].payload);
      });
    });
    describe('receiving an IIP', function() {
      return it('should provide the IIP back', function(done) {
        var expects;
        expects = [
          {
            protocol: 'graph',
            command: 'addinitial',
            payload: {
              from: {
                data: 'Hello, world!'
              },
              to: {
                node: 'Foo',
                port: 'in'
              },
              metadata: {}
            }
          }
        ];
        receive(expects, done);
        return send('graph', 'addinitial', expects[0].payload);
      });
    });
    describe('removing a node', function() {
      return it('should remove the node and its associated edges', function(done) {
        var expects;
        expects = [
          {
            protocol: 'graph',
            command: 'removeedge',
            payload: {
              from: {
                node: 'Foo',
                port: 'out'
              },
              to: {
                node: 'Bar',
                port: 'in'
              },
              metadata: {
                route: 5
              }
            }
          }, {
            protocol: 'graph',
            command: 'removenode',
            payload: {
              id: 'Bar',
              component: 'core/Drop',
              metadata: {}
            }
          }
        ];
        receive(expects, done);
        return send('graph', 'removenode', {
          id: 'Bar'
        });
      });
    });
    describe('removing an IIP', function() {
      return it('should provide the IIP back', function(done) {
        var expects;
        expects = [
          {
            protocol: 'graph',
            command: 'removeinitial',
            payload: {
              from: {
                data: 'Hello, world!'
              },
              to: {
                node: 'Foo',
                port: 'in'
              },
              metadata: {}
            }
          }
        ];
        receive(expects, done);
        return send('graph', 'removeinitial', {
          to: {
            node: 'Foo',
            port: 'in'
          }
        });
      });
    });
    return describe('renaming a node', function() {
      return it('should send the renamenode event', function(done) {
        var expects;
        expects = [
          {
            protocol: 'graph',
            command: 'renamenode',
            payload: {
              from: 'Foo',
              to: 'Baz'
            }
          }
        ];
        receive(expects, done);
        return send('graph', 'renamenode', {
          from: 'Foo',
          to: 'Baz'
        });
      });
    });
  });
  describe('Network protocol', function() {
    beforeEach(function(done) {
      var listener, waitFor;
      waitFor = 4;
      listener = function(message) {
        waitFor--;
        if (waitFor) {
          return;
        }
        window.removeEventListener('message', listener, false);
        return done();
      };
      window.addEventListener('message', listener, false);
      send('graph', 'clear', {
        baseDir: '/oflo-runtime'
      });
      send('graph', 'addnode', {
        id: 'Hello',
        component: 'core/Repeat',
        metadata: {}
      });
      send('graph', 'addnode', {
        id: 'World',
        component: 'core/Drop',
        metadata: {}
      });
      send('graph', 'addedge', {
        from: {
          node: 'Hello',
          port: 'out'
        },
        to: {
          node: 'World',
          port: 'in'
        }
      });
      return send('graph', 'addinitial', {
        from: {
          data: 'Hello, world!'
        },
        to: {
          node: 'Hello',
          port: 'in'
        }
      });
    });
    return describe('on starting the network', function() {
      return it('should get started and stopped', function(done) {
        var listener, started;
        started = false;
        listener = function(message) {
          chai.expect(message).to.be.an('object');
          chai.expect(message.data.protocol).to.equal('network');
          if (message.data.command === 'started') {
            chai.expect(message.data.payload).to.be.a('date');
            started = true;
          }
          if (message.data.command === 'stopped') {
            chai.expect(started).to.equal(true);
            window.removeEventListener('message', listener, false);
            return done();
          }
        };
        window.addEventListener('message', listener, false);
        return send('network', 'start', {
          baseDir: '/oflo-runtime'
        });
      });
    });
  });
  return describe('Component protocol', function() {
    return describe('on requesting a component list', function() {
      return it('should receive some known components', function(done) {
        var listener;
        listener = function(message) {
          chai.expect(message).to.be.an('object');
          chai.expect(message.data.protocol).to.equal('component');
          chai.expect(message.data.payload).to.be.an('object');
          if (message.data.payload.name === 'core/Output') {
            chai.expect(message.data.payload.icon).to.equal('bug');
            chai.expect(message.data.payload.inPorts).to.eql([
              {
                id: 'in',
                type: 'all',
                array: true
              }, {
                id: 'options',
                type: 'object',
                array: false
              }
            ]);
            chai.expect(message.data.payload.outPorts).to.eql([
              {
                id: 'out',
                type: 'all',
                array: false
              }
            ]);
            window.removeEventListener('message', listener, false);
            return done();
          }
        };
        window.addEventListener('message', listener, false);
        return send('component', 'list', '/hanaflo-runtime');
      });
    });
  });
});
