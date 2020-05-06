#!/bin/sh

#Still more to be done here and in applications themselves. Should actually want a read-only user for the middleware and a read/write user for the backend..
#https://docs.couchdb.org/en/2.2.0/intro/security.html

read -p "ADMIN:" USR
read -p "PW:" PW

echo "setting up special dbs required by couch 3.0"

echo "_users"
curl -X PUT http://"$USR":"$PW"@127.0.0.1:5984/_users

echo "_replicator"
curl -X PUT http://"$USR":"$PW"@127.0.0.1:5984/_replicator

echo "_global_changes"
curl -X PUT http://"$USR":"$PW"@127.0.0.1:5984/_global_changes


echo "deleting db"
curl -X DELETE http://"$USR":"$PW"@127.0.0.1:5984/geeklistdb

echo "creating db"
curl -X PUT http://"$USR":"$PW"@127.0.0.1:5984/geeklistdb

#Add a read/write user
echo "Add user grog"
curl -X PUT http://localhost:5984/_users/org.couchdb.user:grog \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -H "If-Match: 1-e0ebfb84005b920488fc7a8cc5470cc0" \
     -d '{"name":"grog", "roles":[], "type":"user", "password":"kampai"}' \
     -u "$USR":"$PW"

echo "Assign grog as admin to geeklistdb"
curl -X PUT http://localhost:5984/geeklistdb/_security -u "$USR":"$PW" \
  -H "Content-Type: application/json" \
  -d '{"admins": { "names": ["grog"], "roles": [] }, "members": { "names": [], "roles": [] } }'


#echo "geeklist docs"
#curl -d @data/geeklists.json -H "Content-type: application/json" -X POST http://127.0.0.1:5984/geeklistdb/_bulk_docs -d 'name=grog&password=kampai'

echo "design_docs/geeklists.json (view)"
curl -d @design_docs/geeklists.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklists -u "grog":"kampai"


echo "geeklist view"
curl -d @design_docs/geeklist.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklist -u "grog":"kampai"


echo "boardgame view"
curl -d @design_docs/boardgame.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/boardgame -u "grog":"kampai"

curl -d @design_docs/boardgame2.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/boardgame2 -u "grog":"kampai"

echo "boardgamestats view"
curl -d @design_docs/boardgamestats.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/boardgamestats -u "grog":"kampai"


echo "geekliststats view"
curl -d @design_docs/geekliststats.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geekliststats -u "grog":"kampai"


echo "geeklistfilters view"
curl -d @design_docs/geeklistfilters.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklistfilters -u "grog":"kampai"
