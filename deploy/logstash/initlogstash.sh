#!/bin/sh

sudo /opt/logstash/bin/plugin install logstash-input-couchdb_changes
sudo /opt/logstash/bin/plugin install logstash-output-elasticsearch
sudo /opt/logstash/bin/plugin install logstash-filter-elasticsearch
