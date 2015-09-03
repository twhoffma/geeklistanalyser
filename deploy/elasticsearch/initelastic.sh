#!/bin/sh

curl -XDELETE 'http://127.0.0.1:9200/boardgames/'

curl -XPUT 'http://127.0.0.1:9200/boardgames' -d @elastic_index_boardgames.json

sudo /opt/logstash/bin/plugin install logstash-input-couchdb_changes
sudo /opt/logstash/bin/plugin install logstash-output-elasticsearch
sudo /opt/logstash/bin/plugin install logstash-filter-elasticsearch
