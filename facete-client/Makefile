wd = $(shell pwd)
wdDirname = $(shell dirname $(wd))
wdBasename = $(shell basename $(wd))
tarGzFile = /tmp/semmap.tar.gz

dpkgDir = "debian/"
debFile = "debian/semmap_all.deb"

odpGit = ~/Documents/OpenDataPortal/git


nothing:
	

all: clean-deps deploy-sparql-proxy
	
links:
	ln -s ../../../pom.xml src/main/webapp/facete-pom.xml
	ln -s facete-index.php src/main/webapp/index.php

clean-links:
	rm src/main/webapp/facete-pom.xml
	rm src/main/webapp/index.php

clean-deps:
	rm -rf lib/twitter-bootstrap/current
	rm -rf lib/agility/current
	rm -rf lib/RDFauthor/current
	rm -rf lib/Font-Awesome/current
	rm -rf lib/SparqlProxyPHP/current
	rm -rf lib/underscore.string/current
	rm -rf lib/jQuery-ajaxTransport-XDomainRequest/current

zip:
	cd $(wdDirname); \
	tar --exclude "config.js" --exclude ".git*" --exclude "*.tar.gz" --exclude "src/main/webapp/js/org/aksw/qa-dashboard" --exclude trash --exclude deleteme --exclude test -zcvf $(tarGzFile) $(wdBasename)/*
	mv $(tarGzFile) $(wd)

deploy: clean-deps
	git clone git://github.com/twitter/bootstrap.git lib/twitter-bootstrap/current
	git clone git://github.com/arturadib/agility.git lib/agility/current
	git clone git://github.com/FortAwesome/Font-Awesome.git lib/Font-Awesome/current
	git clone git://github.com/AKSW/RDFauthor.git lib/RDFauthor/current
	git clone git://github.com/epeli/underscore.string.git lib/underscore.string/current
	git clone git://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest.git lib/jQuery-ajaxTransport-XDomainRequest/current
	# Switch RDFauthor to develop
	#git checkout develop

# Additionally deploys a SPARQL proxy. For security this is disabled by default
deploy-sparql-proxy: deploy
	git clone https://github.com/AKSW/SparqlProxyPHP lib/SparqlProxyPHP/current

# Reset the configuration files
reset:
	cp config.js.dist config.js

# Create a zip and move it to the ODP git - this target is just for my local machine ~ Claus
odpgit: zip
	cp semmap.tar.gz $(odpGit)/sources/redhat-deployment/semmap/semmap.tar.gz
	
	
	

#debuild:
#	cd $(dpkgDir); \
#        debuild

# Build and install on system
#debinst: debuild
#       The '-' in front of the command causes make to ignore any errors (i.e. its exit code)
#        -sudo apt-get -y remove semmap
#        sudo dpkg -i "$(debFile)"


