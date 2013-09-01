#!/bin/sh
mvn clean install
cd facete-server
mvn tomcat6:redeploy
