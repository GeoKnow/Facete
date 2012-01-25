/**
 * additions/prefixes
 */
(function(rdf) {
  rdf.prefixes.addAll({
    owl: "http://www.w3.org/2002/07/owl#",
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    rdfa: "http://www.w3.org/ns/rdfa#",
    xhv: "http://www.w3.org/1999/xhtml/vocab#",
    xml: "http://www.w3.org/XML/1998/namespace",
    xsd: "http://www.w3.org/2001/XMLSchema#",
    grddl: "http://www.w3.org/2003/g/data-view#",
    powder: "http://www.w3.org/2007/05/powder#",
    powders: "http://www.w3.org/2007/05/powder-s#",
    rif: "http://www.w3.org/2007/rif#",
    atom: "http://www.w3.org/2005/Atom/",
    xhtml: "http://www.w3.org/1999/xhtml#",
    formats: "http://www.w3.org/ns/formats/",
    xforms: "http://www.w3.org/2002/xforms/",
    xhtmlvocab: "http://www.w3.org/1999/xhtml/vocab/",
    xpathfn: "http://www.w3.org/2005/xpath-functions#",
    http: "http://www.w3.org/2006/http#",
    link: "http://www.w3.org/2006/link#",
    time: "http://www.w3.org/2006/time#",
    acl: "http://www.w3.org/ns/auth/acl#",
    cert: "http://www.w3.org/ns/auth/cert#",
    rsa: "http://www.w3.org/ns/auth/rsa#",
    crypto: "http://www.w3.org/2000/10/swap/crypto#",
    list: "http://www.w3.org/2000/10/swap/list#",
    log: "http://www.w3.org/2000/10/swap/log#",
    math: "http://www.w3.org/2000/10/swap/math#",
    os: "http://www.w3.org/2000/10/swap/os#",
    string: "http://www.w3.org/2000/10/swap/string#",
    doc: "http://www.w3.org/2000/10/swap/pim/doc#",
    contact: "http://www.w3.org/2000/10/swap/pim/contact#",
    p3p: "http://www.w3.org/2002/01/p3prdfv1#",
    swrl: "http://www.w3.org/2003/11/swrl#",
    swrlb: "http://www.w3.org/2003/11/swrlb#",
    exif: "http://www.w3.org/2003/12/exif/ns#",
    earl: "http://www.w3.org/ns/earl#",
    ma: "http://www.w3.org/ns/ma-ont#",
    sawsdl: "http://www.w3.org/ns/sawsdl#",
    sd: "http://www.w3.org/ns/sparql-service-description#",
    skos: "http://www.w3.org/2004/02/skos/core#",
    fresnel: "http://www.w3.org/2004/09/fresnel#",
    gen: "http://www.w3.org/2006/gen/ont#",
    timezone: "http://www.w3.org/2006/timezone#",
    skosxl: "http://www.w3.org/2008/05/skos-xl#",
    org: "http://www.w3.org/ns/org#",
    ical: "http://www.w3.org/2002/12/cal/ical#",
    wgs84: "http://www.w3.org/2003/01/geo/wgs84_pos#",
    vcard: "http://www.w3.org/2006/vcard/ns#",
    turtle: "http://www.w3.org/2008/turtle#",
    pointers: "http://www.w3.org/2009/pointers#",
    dcat: "http://www.w3.org/ns/dcat#",
    imreg: "http://www.w3.org/2004/02/image-regions#",
    rdfg: "http://www.w3.org/2004/03/trix/rdfg-1/",
    swp: "http://www.w3.org/2004/03/trix/swp-2/",
    rei: "http://www.w3.org/2004/06/rei#",
    wairole: "http://www.w3.org/2005/01/wai-rdf/GUIRoleTaxonomy#",
    states: "http://www.w3.org/2005/07/aaa#",
    wn20schema: "http://www.w3.org/2006/03/wn/wn20/schema/",
    httph: "http://www.w3.org/2007/ont/httph#",
    act: "http://www.w3.org/2007/rif-builtin-action#",
    common: "http://www.w3.org/2007/uwa/context/common.owl#",
    dcn: "http://www.w3.org/2007/uwa/context/deliverycontext.owl#",
    hard: "http://www.w3.org/2007/uwa/context/hardware.owl#",
    java: "http://www.w3.org/2007/uwa/context/java.owl#",
    loc: "http://www.w3.org/2007/uwa/context/location.owl#",
    net: "http://www.w3.org/2007/uwa/context/network.owl#",
    push: "http://www.w3.org/2007/uwa/context/push.owl#",
    soft: "http://www.w3.org/2007/uwa/context/software.owl#",
    web: "http://www.w3.org/2007/uwa/context/web.owl#",
    content: "http://www.w3.org/2008/content#",
    vs: "http://www.w3.org/2003/06/sw-vocab-status/ns#",
    air: "http://dig.csail.mit.edu/TAMI/2007/amord/air#",
    ex: "http://example.org/",
    
    dc: "http://purl.org/dc/terms/",
    dc11: "http://purl.org/dc/elements/1.1/",
    dctype: "http://purl.org/dc/dcmitype/",
    foaf: "http://xmlns.com/foaf/0.1/",
    cc: "http://creativecommons.org/ns#",
    opensearch: "http://a9.com/-/spec/opensearch/1.1/",
    'void': "http://rdfs.org/ns/void#",
    sioc: "http://rdfs.org/sioc/ns#",
    sioca: "http://rdfs.org/sioc/actions#",
    sioct: "http://rdfs.org/sioc/types#",
    lgd: "http://linkedgeodata.org/vocabulary#",
    moat: "http://moat-project.org/ns#",
    days: "http://ontologi.es/days#",
    giving: "http://ontologi.es/giving#",
    lang: "http://ontologi.es/lang/core#",
    like: "http://ontologi.es/like#",
    status: "http://ontologi.es/status#",
    og: "http://opengraphprotocol.org/schema/",
    protege: "http://protege.stanford.edu/system#",
    dady: "http://purl.org/NET/dady#",
    uri: "http://purl.org/NET/uri#",
    audio: "http://purl.org/media/audio#",
    video: "http://purl.org/media/video#",
    gridworks: "http://purl.org/net/opmv/types/gridworks#",
    hcterms: "http://purl.org/uF/hCard/terms/",
    bio: "http://purl.org/vocab/bio/0.1/",
    cs: "http://purl.org/vocab/changeset/schema#",
    geographis: "http://telegraphis.net/ontology/geography/geography#",
    doap: "http://usefulinc.com/ns/doap#",
    daml: "http://www.daml.org/2001/03/daml+oil#",
    geonames: "http://www.geonames.org/ontology#",
    sesame: "http://www.openrdf.org/schema/sesame#",
    cv: "http://rdfs.org/resume-rdf/",
    wot: "http://xmlns.com/wot/0.1/",
    media: "http://purl.org/microformat/hmedia/",
    ctag: "http://commontag.org/ns#"
  });
})(rdf);
