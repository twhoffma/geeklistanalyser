#!/bin/sh

sudo apt-get install nodejs
sudo npm install pm2 -g

sudo apt-get install nginx

wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -

echo "deb http://packages.elastic.co/elasticsearch/1.7/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-1.7.list

echo "deb http://packages.elasticsearch.org/logstash/1.5/debian stable main" | sudo tee -a /etc/apt/sources.list

sudo apt-get update
sudo apt-get install elasticsearch logstash



#Set services to start on boot - systemd
sudo /bin/systemctl daemon-reload
sudo /bin/systemctl enable elasticsearch.service 
