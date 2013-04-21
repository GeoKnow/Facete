Installation

1. sudo nano /etc/apache2/sites-available/default

    <Proxy *>
        Order allow,deny
        allow from all
    </Proxy>

    ProxyPass /sparql http://localhost:8891/sparql retry=0
    ProxyPassReverse /sparql http://localhost:8891/sparql
    
    
    add to the end of the file
    
    
2. Activate apache proxy_http module:

   sudo a2enmod proxy_http


3. sudo service apache2 restart


4. You need Virtuoso 6.1.5 !

    - Download: 
        
        wget http://sourceforge.net/projects/virtuoso/files/latest/download
   
    - Unzip and switch to the directory:
    
        tar -xf download && cd virtuoso-opensource-6.1.5
   
    - After downloading install neccessary build tools:
    
        sudo apt-get install autoconf automake libtool flex bison gperf gawk m4 make openssl libssl-dev

    - Install Virtuoso:
    
        ./configure --prefix=/opt/virtuoso/ose/6.1.5 --with-readline=/usr/lib/libreadline.so
        
        At the end you will see something like "Virtuoso Open Source Edition 6.1.5 configuration summary"
        If not, try this instead: ./configure --prefix=/opt/virtuoso/ose/6.1.5
        
        make
        
        sudo make install
   
    - Configure Virtuoso:
    
        sudo mkdir /opt/virtuoso/ose/6.1.5/databases/ && sudo mkdir /opt/virtuoso/ose/6.1.5/databases/default_1112_8891 

        > move (cd) back to the repository

        sudo cp install/virtuoso.ini /opt/virtuoso/ose/6.1.5/databases/default_1112_8891 

        sudo cp install/start_virtuoso.sh /opt/virtuoso/ose/6.1.5/databases/default_1112_8891

        cd /opt/virtuoso/ose/6.1.5/databases/default_1112_8891 && sudo sh start_virtuoso.sh
        

5. Use install/virtuload.sh to import big example data into your Virtuoso DB:

    > move (cd) back to the repository
    
    unzip example dataset:     
    tar -xf install/data.nt.bz2

    import data:
    sh install/virtload.sh install/data.nt http://fintrans.publicdata.eu/ec/ 1112 dba dba 
    
    notice: If dont use dba/dba for authentification then adapt the command!

6. sudo service apache2 restart
    

Some notes on the concept:
TODO: Rethink which paths we actually need, and which can be possibly expressed in terms of others

A QueryGenerator is comprised of:
concept: The initial set of resources to start from. specified either extensional (set of resources) or intensional (SPARQL query + variable).
focusPath: The path to the set of resources to fetch related counts for (TODO this is not the same as facet counts - its just: there is x resources on property y for these resources)
navigationPath: A path from the concept to where a user navigated to
facetPath: the path to the set of resources for which to fetch the facet counts.
geoPath: The path from the concept to its related geometries.

Obviously, there can be nesting:
We start we a concept, navigate to geometries, and use this as a new concept.


       
