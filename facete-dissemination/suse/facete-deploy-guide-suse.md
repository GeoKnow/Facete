# Deployment Guide for Facete on SuSE Linux

## Introduction
This guide describes how to deploy Facete from a WAR file on a Tomcat running on SuSE linux.

Please verify that the archive contains the following essential files:

* `facete.war`: The war file to be deployed in the Tomcat application container.
* `facete.xml`: The configuration of the facete context in the application container.
* `facete-db-schema-postgres.sql`: The database schema which Facete uses.
* `postgresql-8.4-701.jdbc4.jar`: A Java PostgreSQL driver. Should work as well with newer versions.
* `facete-demo.nt`: An small RDF dataset on which Facete can be tested.

## Prerequisites
Facete requires the following components to be available on the system.

* Tomcat6 or Tomcat7 (Facete was not tested with other versions)
* PostgreSQL: Needed for storing perma links

Furthermore, you need:

* Sufficient privileges. Super-user / root privileges are recommended.
* HTTP access to a triple store

Quick installation guides for these components are located in the [Appendix](#sec_appendix) section of this document.


## Facete Deployment

In a nutshell, you need to perform the following tasks:

* Load the Facete database schema
* Adjust the database settings
* Deploy `facete.xml` and `facete.war` to Tomcat.

Note that order matters, as otherwise Tomcat will deploy the war before having configured its context.
In this case, you need to restart the context.


### Assumptions
In the following this guide makes the following assumptions:

* Tomcat is running on the default port 8080
* Tomcat's auto deploy feature is enabled (this make Tomcat deploy WAR files automatically when they are placed in the webapp folder)
* Tomcat explodes (i.e. unzips) the WAR file
* The Postgres server is running with the default port (5432) and
* accepts connections to 127.0.0.1 (note that Postgres treats this different from `localhost`)
* There is a database user `facete-role` with password `facete-pw` having all priviledges on the database `facete-db`. See the [PostgreSQL section](#sec-postgresql) for the set up.

* We assume that the tomcat service is named simply `tomcat`. Depending on the system, it may be different, such as `tomcat5`, `tomcat6` or `tomcat7`. 
* This guide uses `systemctl` for starting stopping PostgreSQL and Tomcat.
If e.g. `sudo systemctl postgresql restart` or `sudo systemctl tomcat restart` fail, you may want to try
e.g. `sudo rcpostgresql restart` and `sudo rctomcat restart` instead.

### Provide the database driver

* Check if there is already a PostgreSQL driver

        ls /usr/share/tomcat/lib/postgres*

* If not, copy the database driver provided with this archive to Tomcat's lib folder

        cp postgresql-8.4-701.jdbc4.jar /usr/share/tomcat/lib/ 

* Restart tomcat

        sudo systemctl restart tomcat

### Loading the database

See the [Appendix](#sec_appendix) section on how to create such a database.

* Load the database file

        psql -h 127.0.0.1 -U facete-role -W -f facete-db-schema-postgres.sql

### Configure the context

* Adjust the database connection settings in `facete.xml` in case that
  your database setup deviates from one assumed in this guide.
  Otherwise, the defaults should work.

### Deploy the WAR file into Tomcat

* Command line:

 * Copy the `facete.xml` to the tomcat folder

            sudo cp facete.xml /etc/tomcat/Catalina/localhost

 * Copy the war file

            sudo cp facete.war /srv/tomcat/webapps


If Tomcat's auto deploy feature is enabled, you should be able to test Facete
visiting [http://localhost:8080/facete](http://localhost:8080/facete).


### WAR Configuration
By default, Facete is configured to fetch data from the endpoint at `http://fp7-pp.publicdata.eu/sparql`.
This can be changed as follows.

After having put the war file into the tomcat directory, Tomcat should explode the WAR, giving easy
access to the following configuration files.
Otherwise, you need to unzip and zip the WAR file manually, see [the the tips section](#sec-tips).

Edit the file `resources/facete-config.js` relative to the WAR file, such as `/srv/tomcat/webapps/facete/resources/facete-config.js`
and adjust the following options to your needs:

        config.sparqlServiceIri = 'http://fp7-pp.publicdata.eu/sparql';
        config.sparqlDefaultGraphIris = ['http://fp7-pp.publicdata.eu/'];


Then restart tomcat.

## <a id="sec-appendix"></a>Appendix: Quick Installation Guides

The following sections contain information about basic tasks required
to get Facete up and running.
Please be aware that this information is no substitute for reading 


### <a id="sec-postgresql"></a>PostgreSQL

* Installing the server

        sudo zypper install postgresql postgresql-server

        # By default, the server will not be running, so we start it
        sudo systemctl restart postgresql

        # Below command redirects to the above one; if above one does not work, try this
        #sudo rcpostgresql start

* Creating the default `facate-db` database

        # Make yourself the postgres user
        # (or some other user that has sufficient privileges for creating dbs and granting privileges)
        sudo su postgres
        psql

Note that you can exit the client by typing `\q`

* Execute the following SQL commands in the client:

        CREATE USER "facete-role" PASSWORD 'facete-pw';
        -- Note: Newer versions of postgres do not distinguish between users and groups
        -- CREATE USER also gives login rights in contrast to CREATE ROLE. Otherwise they are identical.
        -- You can grant login rights with: ALTER ROLE "facete-role" LOGIN;

        CREATE DATABASE "facete-db" OWNER "facete-role";
        GRANT ALL PRIVILEGES ON DATABASE "facete-db" TO "facete-role";

        \q

* Allow users to connect via local IP: Edit `/var/lib/pgsql/data/pg_hba.conf` and make the relevant section look like this:

        # IPv4 local connections:
        #host    all             all             127.0.0.1/32            ident
        host    all             all             127.0.0.1/32            md5

* Now exit the postgres user and try to connect to the db:

        psql -h 127.0.0.1 -d facete-db -U facete-role -W


### Tomcat

Beware that depending on your Linux distribution, `tomcat` may be named slightly different.

* Installation

        sudo zypper install tomcat

* Restarting

        sudo systemctl restart tomcat

        # Below command redirects to the above one; if above one does not work, try this
        #sudo rctomcat start


### SuSE Utils
You may want to install some utilities that help you find your way around in SuSE linux.

* Finding files

        sudo zypper install findutils-locate

        # If above fails, retry with a different package name
        #sudo zypper install find-utils

Now you can do `updatedb` and `locate`


### <a href="#sec-tips"></a>Tips, Tricks and Troubleshooting

* Finding out which version of SuSE is running

        cat /etc/SuSE-release

* If installing packages via zypper fails, make sure there is no reference to the installation CD,
  otherwise zypper will fail reading its repository list

        cd /etc/zypp/repos.d
        grep cd *

    * If this lists any files, consider disabling the corresponding repositories by opening the file and setting:

            enabled=0

* Extracting / Unzipping / Exploding WAR files and Zipping again

    * Important: Make sure to unzip into a new empty folder first, otherwise you will have a mess in your current directory.

            # Extract facete.war into a new directory called 'foo'
            unzip facete.war -d foo

            # Move into the directory and create a zip archive of all contained all files in the parent directory
            cd foo
            zip ../foo.war -r *


* Useful commands for PostgreSQL

    * Change a user's password

            ALTER ROLE rolename PASSWORD 'newpassword';

    * Delete a user

            DROP ROLE rolename

    * Did you know?

        * Single qutes (') indicate strings, such as 'this is a string'

        * Double quotes (") indicate names of database objects, such as "this could be the name of a table"

      * You can put usernames and passwords into a file `$HOME/.pgpass` with below content.
        This gives you a convenient password-less login option, however, be aware that you are trading security.


                127.0.0.1:*:*:facete-role:facete-pw

                # With port:
                #127.0.0.1:5432:*:facete-role:facete-pw


