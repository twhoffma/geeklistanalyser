#!/usr/bin

export PATH=$PATH:/opt/logstash/bin

sudo couchdb -b
logstash -f logstash-geeklistdb.conf

