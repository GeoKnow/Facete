'use strict';

angular.module('jsgeoknow')
  .controller('MainCtrl', function ($scope, $q, $rootScope) {

  var prefixes = {
    'dbpedia-owl': 'http://dbpedia.org/ontology/',
    'dbpedia': 'http://.org/resource/',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'foaf': 'http://xmlns.com/foaf/0.1/',
    'o': 'http://example.org/ontology/',
    'r': 'http://example.org/resource/'
  };

  var rdf = Jassa.rdf;
  var sparql = Jassa.sparql;
  var sponate = Jassa.sponate;

  /*
   * Sponate
   */
  var service = sponate.ServiceUtils.createSparqlHttp('http://localhost:8890/sparql', ['http://js.geoknow.eu/']); 
  var store = new sponate.StoreFacade(service, prefixes);

  store.addMap({
    name: 'jslib',
    template: [{
      id: '?s',
      name: '?l',
      description: '?d',
      pkgName: '?p'
    }],
    from: '{ Select * { ?s a o:JsLibrary ; rdfs:label ?l ; rdfs:comment ?d ; o:npmPgkName ?p .} }'
  });

  var promise = store.jslib.find().asList();
  $scope.result = sponate.angular.bridgePromise(promise, $q.defer(), $rootScope);
  debugger;
  console.log($scope.result);

});