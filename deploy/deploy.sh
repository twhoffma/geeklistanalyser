#!/bin/bash -xv

set -e

sudo apt-get install nodejs
sudo npm install pm2 -g

sudo apt-get install nginx

sudo apt-get update

#docker
sudo docker-compose up -d

./initcouchdb.sh

#Set services to start on boot - systemd
sudo /bin/systemctl daemon-reload

#Install certbot
sudo apt-get install software-properties-common software-properties-common
sudo apt-get update
sudo apt-get install certbot

sudo certbot certonly --webroot --webroot-path=/var/www/glaze.hoffy.no -d glaze.hoffy.no 

sudo nginx -t

sudo ls -l /etc/letsencrypt/live/glaze.hoffy.no
