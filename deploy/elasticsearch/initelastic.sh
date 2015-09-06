#!/bin/sh

curl -XDELETE 'http://127.0.0.1:9200/boardgames/'

curl -XPUT 'http://127.0.0.1:9200/boardgames' -d @elastic_index_boardgames.json

