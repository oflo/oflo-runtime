var provider;

provider = require('oflo-runtime/runtime/graphprovider.js');


describe('Provider Initialization', function() {
  describe('when instantiated', function() {
    it('should throw an error if options are not provided', function() {
      chai.expect(function(){
		    provider.initializeOrionFlo();
      }).to.throw(Error);
    });
    it('should throw an error if options are null', function() {
      chai.expect(function(){
		    provider.initializeOrionFlo(null);
      }).to.throw(Error);
    });
    it("should throw an error if options doesn't have a type string property", function() {
      chai.expect(function(){
      	var options = {
      	}
		    provider.initializeOrionFlo(options);
      }).to.throw(Error);
      chai.expect(function(){
      	var options = {
      		type:1
      	}
		    provider.initializeOrionFlo(options);
      }).to.throw(Error);
    });
  });
  describe('when called with type local', function() {
    it("should throw an exception when path is not provided",function(){
      var options ={
        type:'local'
      };
      chai.expect(function(){
        provider.initializeOrionFlo(options);
      }).to.throw(Error);       
    });
    it("should call error handler when path points to non existing file",function(done){      
      var options ={
        type:'local',
        path:'test1.json',
        baseDir:'/oflo-oflo-runtime'
      };
      provider.initializeOrionFlo(options,function(){},function(error){
        done();
      })
        
    });
  	it("should call the callback method",function(done){
  		var options ={
  			type:'local',
        path:'test.json',
        baseDir:'/oflo-runtime'
  		};
  		provider.initializeHanaFlo(options,function(){
			done();  			
  		})
  	});
  });
});