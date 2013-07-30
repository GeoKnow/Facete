    {
        service: { 
            serviceIri: 'http://fp7-pp.publicdata.eu/sparql',
            defaultGraphIris: ['http://fp7-pp.publicdata.eu/']
        },
        sourceConcept: {
            elementStr: '?s a <http://fp7-pp.publicdata.eu/ontology/Project>',
            varName: 's'
        },
        targetConcept: {
            elementStr: '?s <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?x ; <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?y',
            varName: 's'
        }
    }
