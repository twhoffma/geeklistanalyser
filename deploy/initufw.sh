#!/bin/sh
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow from 127.0.0.1 to 127.0.0.1 port 9200
sudo ufw allow from 127.0.0.1 to 127.0.0.1 port 5984
sudo ufw allow from 127.0.0.1 to 127.0.0.1 port 11211
sudo ufw allow from 127.0.0.1 to 127.0.0.1 port 3000
sudo ufw disable
sudo ufw enable
curl 127.0.0.1:5984
curl 127.0.0.1:9200
curl 127.0.0.1:11211
