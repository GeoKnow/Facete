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
    
    
    [ 4. install/virtuload.sh for import big example data 
    
        sh ~/bin/virtload.sh ~/Downloads/MyLocalGraphFinancialTransparancy.nt http://fintrans.publicdata.eu/ec/ 1112 dba dba 
    ]
    
    
    5. You need Virtuoso 6.1.5 !
    
        - Download: http://sourceforge.net/projects/virtuoso/files/latest/download
       
        - Unzip and switch to the directory
       
        - After downloading install neccessary build tools:
         sudo apt-get install autoconf automake libtool flex bison gperf gawk m4 make openssl libssl-dev
    
        - ./configure --prefix=/opt/virtuoso/ose/6.1.5 --with-readline=/usr/lib/libreadline.so
       
        - make
       
        - sudo make install
       
       
        - sudo mkdir /opt/virtuoso/ose/6.1.5/databases/ && sudo mkdir /opt/virtuoso/ose/6.1.5/databases/default_1112_8891 
    
        - sudo mv [your repo]/install/virtuoso.ini /opt/virtuoso/ose/6.1.5/databases/default_1112_8891 
    
        - sudo mv [your repo]/install/start.sh /opt/virtuoso/ose/6.1.5/databases/default_1112_8891
    
        - cd /opt/virtuoso/ose/6.1.5/databases/default_1112_8891 && sudo sh start.sh
    
    6. sudo service apache2 restart
    
       
