$(document).ready(function () {
  module('rdfQuery', {
    
  });

  /*
   * Simple literal
   */
  test('simple literal', function () {
    var l = $.rdf.literal(42);
    console.log(String(l));
  });
  test('simple literal', function () {
    var l = $.rdf.literal('42');
    console.log(String(l));
  });
  test('simple literal', function () {
    var l = $.rdf.literal('"simple literal"');
    console.log(String(l));
  });

  test('simple literal newline', function () {
    var l = $.rdf.literal('"simple \n literal"');
    console.log(String(l));
  });

  test('simple literal backslash', function () {
    var l = $.rdf.literal('"simple \\ literal"');
    console.log(String(l));
  });

  test('simple literal single quote', function () {
    var l = $.rdf.literal('"simple \' literal"');
    console.log(String(l));
  });

  test('simple literal double quote', function () {
    var l = $.rdf.literal('"simple \\\" literal"');
    console.log(String(l));
  });

  test('simple literal double quote, backslash', function () {
    var l = $.rdf.literal('"simple \\\" \\ literal"');
    console.log(String(l));
  });

  test('simple literal double quote, backslash newline', function () {
    var l = $.rdf.literal('"simple \\\" \\ \n literal"');
    console.log(String(l));
  });

  /*
   * Simple literal w/ datatype
   */
  test('simple literal datatype', function () {
    var l = $.rdf.literal('"simple literal"^^<http://www.w3.org/2001/XMLSchema#string>');
    console.log(String(l));
  });

  test('simple literal  double quote, backslash newlinedatatype', function () {
    var l = $.rdf.literal('"""simple  \\\" \\  literal"""^^<http://www.w3.org/2001/XMLSchema#string>');
    console.log(String(l));
  });

  /*
   * Simple literal w/ lang
   */
  test('simple literal lang', function () {
    var l = $.rdf.literal('"simple literal"@en');
    console.log(String(l));
  });

  /*
   * Long literal
   */
  test('long literal', function () {
    var l = $.rdf.literal('"""long literal"""');
    console.log(String(l));
  });

  test('long literal newline', function () {
    var l = $.rdf.literal('"""long \n literal"""');
    console.log(String(l));
  });

  test('long literal backslash', function () {
    var l = $.rdf.literal('"""long \\ literal"""');
    console.log(String(l));
  });

  test('long literal single quote', function () {
    var l = $.rdf.literal('"""long \' literal"""');
    console.log(String(l));
  });

  test('long literal double quote', function () {
    var l = $.rdf.literal('"""long \\\" literal"""');
    console.log(String(l));
  });

  /*
   * Literals, datatype via options
   */
  /* TODO: does not work
   * test('literal, datatype in option newline', function () {
   *   var l = $.rdf.literal('simple \n literal', {datatype: 'http://www.w3.org/2001/XMLSchema#string'});
   *   console.log(String(l));
   * });
   */

  test('literal, datatype in option backslash', function () {
    var l = $.rdf.literal('simple \\ literal', {datatype: 'http://www.w3.org/2001/XMLSchema#string'});
    console.log(String(l));
  });

  test('literal, datatype in option', function () {
    var l = $.rdf.literal('simple literal', {datatype: 'http://www.w3.org/2001/XMLSchema#string'});
    console.log(String(l));
  });

  test('literal, datatype in option', function () {
    var l = $.rdf.literal('simple literal', {datatype: 'http://www.w3.org/2001/XMLSchema#string'});
    console.log(String(l));
  });

  /*
   * Literals, language via options
   */
  test('literal, lang in option newline', function () {
    var l = $.rdf.literal('simple \n literal', {lang: 'en'});
    console.log(String(l));
  });

  test('literal, lang in option backslash', function () {
    var l = $.rdf.literal('simple \\ literal', {lang: 'en'});
    console.log(String(l));
  });

  test('literal, lang in option', function () {
    var l = $.rdf.literal('simple literal', {lang: 'en'});
    console.log(String(l));
  });

  test('literal, lang in option', function () {
    var l = $.rdf.literal('simple literal', {lang: 'en'});
    console.log(String(l));
  });

  /*
   * rdfQuery xsd:string regex does not alow newlines
   */
  test('literal regex', function () {
    var regex = /^.*$/;
    var str = 'ttt \n t';
    console.log(regex.test(str));
    ok(!regex.test(str));
  });

  /*
   * regex which allows newlines
   */
  test('literal newline regex', function () {
    var regex = /^[\s\S]*$/;
    var str = 'ttt \n t';
    console.log(regex.test(str));
    ok(regex.test(str));
  });

});
