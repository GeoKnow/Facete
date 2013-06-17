default:
	@echo "make install or make uninstall the cache directory in your default owcli enabled ontowiki instance"

uninstall:
	owcli -m http://localhost/OntoWiki/Cache -e model:drop

install:
	owcli -m http://localhost/OntoWiki/Cache -e model:create
	rdf get rdf: | owcli -m http://localhost/OntoWiki/Cache -e model:add -i -
	rdf get rdfs: | owcli -m http://localhost/OntoWiki/Cache -e model:add -i -
	rdf get owl: | owcli -m http://localhost/OntoWiki/Cache -e model:add -i -
	rdf get skos: | owcli -m http://localhost/OntoWiki/Cache -e model:add -i -

