#!/bin/sh

sudo apt-get install nodejs
sudo npm install pm2 -g

sudo apt-get install nginx

wget -qO - https://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -

echo "deb http://packages.elastic.co/elasticsearch/1.7/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-1.7.list

echo "deb http://packages.elasticsearch.org/logstash/1.5/debian stable main" | sudo tee -a /etc/apt/sources.list

sudo apt-get update
sudo apt-get install elasticsearch logstash

sudo service elasticsearch stop

sudo service start elasticsearch

#Install inquisitor for debugging queries
sudo /usr/share/elasticsearch/bin/plugin -install polyfractal/elasticsearch-inquisitor



#Set services to start on boot - systemd
sudo /bin/systemctl daemon-reload
#sudo /bin/systemctl enable elasticsearch.service
#sudo /bin/systemctl enable logstash.service

#XXX:
#We have problems running couchdb as a service on Debian 8 since we built it..
#sudo couchdb -b
