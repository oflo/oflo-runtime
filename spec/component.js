describe('Window component runtime with core/Repeat', function() {
  describe('receiving a CONNECT', function() {
    return it('should CONNECT back', function(done) {
      var listener;
      listener = function(message) {
        chai.expect(message).to.be.an('object');
        chai.expect(message.data.port).to.equal('out');
        chai.expect(message.data.event).to.equal('connect');
        chai.expect(message.data.payload).to.be.a('null');
        window.removeEventListener('message', listener, false);
        return done();
      };
      window.addEventListener('message', listener, false);
      return child2.postMessage({
        port: 'in',
        event: 'connect'
      }, child2.location.href);
    });
  });
  return describe('receiving a DATA', function() {
    return it('should send DATA back', function(done) {
      var data, listener;
      data = [1, 2, 3];
      listener = function(message) {
        chai.expect(message).to.be.an('object');
        chai.expect(message.data.port).to.equal('out');
        chai.expect(message.data.event).to.equal('data');
        chai.expect(message.data.payload).to.eql(data);
        window.removeEventListener('message', listener, false);
        return done();
      };
      window.addEventListener('message', listener, false);
      return child2.postMessage({
        port: 'in',
        event: 'data',
        payload: data
      }, child2.location.href);
    });
  });
});
