#!/bin/sh

/opt/logstash/bin/logstash -f logstash-geeklistdb.conf -l logstash.out --debug --verbose
