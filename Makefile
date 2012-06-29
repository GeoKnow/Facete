wd = $(shell pwd)
wdDirname = $(shell dirname $(wd))
wdBasename = $(shell basename $(wd))
tarGzFile = /tmp/SemMap.tar.gz


clean-deps:
	rm -rf lib/twitter-bootstrap/current
	rm -rf lib/agility/current
	rm -rf lib/RDFauthor/current
	rm -rf lib/Font-Awesome/current

zip:
	cd $(wdDirname); \
	tar --exclude ".git*" --exclude "*.tar.gz" -zcvf $(tarGzFile) $(wdBasename)/*
	mv $(tarGzFile) $(wd)

deploy: clean-deps
	git clone git://github.com/twitter/bootstrap.git lib/twitter-bootstrap/current
	git clone git://github.com/arturadib/agility.git lib/agility/current
	git clone git://github.com/FortAwesome/Font-Awesome.git lib/Font-Awesome/current
	git clone git://github.com/AKSW/RDFauthor.git lib/RDFauthor/current


# Reset the configuration files
reset:
	cp config.js.dist config.js

