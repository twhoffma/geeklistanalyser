#!/bin/sh

sudo apt-get install nodejs
sudo npm install pm2 -g

sudo apt-get install nginx

#wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -

#echo "deb http://packages.elastic.co/elasticsearch/1.7/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-1.7.list

sudo apt-get update
#sudo apt-get install elasticsearch 

#sudo service elasticsearch stop

#sudo service start elasticsearch

#Install inquisitor for debugging queries
#sudo /usr/share/elasticsearch/bin/plugin -install polyfractal/elasticsearch-inquisitor

#todo: add docker for couchdb.

#docker
sudo docker pull docker.elastic.co/elasticsearch/elasticsearch:7.3.0  
sudo docker run -p 9201:9200 -p 9301:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.3.0

#Set services to start on boot - systemd
sudo /bin/systemctl daemon-reload
#sudo /bin/systemctl enable elasticsearch.service

#XXX:
#We have problems running couchdb as a service on Debian 8 since we built it..
#sudo couchdb -b

#Install certbot
sudo apt-get install software-properties-common software-properties-common
sudo apt-get update
sudo apt-get install certbot


sudo certbot certonly --webroot --webroot-path=/var/www/glaze.hoffy.no -d glaze.hoffy.no 

sudo nginx -t

sudo ls -l /etc/letsencrypt/live/glaze.hoffy.no


