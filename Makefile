wd = $(shell pwd)
wdDirname = $(shell dirname $(wd))
wdBasename = $(shell basename $(wd))
tarGzFile = /tmp/SemMap.tar.gz

dpkgDir = "debian/"
debFile = "debian/semmap_all.deb"


clean-deps:
	rm -rf lib/twitter-bootstrap/current
	rm -rf lib/agility/current
	rm -rf lib/RDFauthor/current
	rm -rf lib/Font-Awesome/current
	rm -rf lib/SparqlProxyPHP/current

zip:
	cd $(wdDirname); \
	tar --exclude ".git*" --exclude "*.tar.gz" -zcvf $(tarGzFile) $(wdBasename)/*
	mv $(tarGzFile) $(wd)

deploy: clean-deps
	git clone git://github.com/twitter/bootstrap.git lib/twitter-bootstrap/current
	git clone git://github.com/arturadib/agility.git lib/agility/current
	git clone git://github.com/FortAwesome/Font-Awesome.git lib/Font-Awesome/current
	git clone git://github.com/AKSW/RDFauthor.git lib/RDFauthor/current

# Additionally deploys a SPARQL proxy. For security this is disabled by default
deploy-sparql-proxy: deploy
	git clone https://github.com/AKSW/SparqlProxyPHP lib/SparqlProxyPHP/current

# Reset the configuration files
reset:
	cp config.js.dist config.js

#debuild:
#	cd $(dpkgDir); \
#        debuild

# Build and install on system
#debinst: debuild
#       The '-' in front of the command causes make to ignore any errors (i.e. its exit code)
#        -sudo apt-get -y remove semmap
#        sudo dpkg -i "$(debFile)"


