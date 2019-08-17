#!/bin/sh

sudo apt-get update

#nginx
sudo apt-get install nginx


#/nginx


#docker
sudo apt-get install docker.io
sudo apt-get install curl 

sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

sudo docker-compose up -d 
#/docker

#couchdb
cd couchdb
./initdb.sh
cd ..
#/couchdb

#elastic
cd elasticsearch
./initelastic.sh
cd ..
#/elastic

#elastic plugins
#Dunno how to use this with a docker image..
#Install inquisitor for debugging queries
#sudo /usr/share/elasticsearch/bin/plugin -install polyfractal/elasticsearch-inquisitor
#/elastic plugins

#certbot - only necessary for production, not for dev..
sudo apt-get install software-properties-common software-properties-common
sudo apt-get update
sudo apt-get install certbot


sudo certbot certonly --webroot --webroot-path=/var/www/glaze.hoffy.no -d glaze.hoffy.no 

sudo nginx -t

sudo ls -l /etc/letsencrypt/live/glaze.hoffy.no
#/certbot

#node
sudo apt-get install jq

sudo apt-get install nodejs

sudo apt-get install npm
sudo npm install pm2 -g

#Install backend binaries
cd ..
sudo npm install

cd middleware
sudo npm install

cd ..

#[Not done] Start middleware
#sudo pm2 start ./middleware/index.js --watch

sudo pm2 startup
#/node
