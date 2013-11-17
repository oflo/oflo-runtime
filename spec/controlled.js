

var provider;

provider = require('oflo-runtime/runtime/graphprovider.js');
describe('Graph Provider remotely controlled network',function(){
 describe('when called with type remote', function() {
    it("should call the callback",function(done){
      var options ={
        type:'remote'
      };      
      provider.initializeHanaFlo(options,function(graph,network){
      	console.log(graph);
      	done();
      },function(error){
      	throw new Error("should not enter the error block");
      });      
    });
  });
});