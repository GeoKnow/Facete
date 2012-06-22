clean-deps:
	rm -rf lib/twitter-bootstrap/current
	rm -rf lib/RDFauthor/current
	rm -rf lib/Font-Awesome/current

deploy: clean-deps
	git clone git://github.com/twitter/bootstrap.git lib/twitter-bootstrap/current
	git clone git://github.com/FortAwesome/Font-Awesome.git lib/Font-Awesome/current
	git clone git://github.com/AKSW/RDFauthor.git lib/RDFauthor/current

# Reset the configuration files
reset:
	cp config.js.dist config.js

