#!/bin/sh
cd ..
./copy-dist-files.sh
mvn clean install


cd facete-debian-tomcat7
mvn -e clean install war:war deb:package
