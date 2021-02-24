#!/bin/sh

#Still more to be done here and in applications themselves. Should actually want a read-only user for the middleware and a read/write user for the backend..
#https://docs.couchdb.org/en/2.2.0/intro/security.html

echo "setting up special dbs required by couch 3.0"
DB_IP="127.0.0.1"
DB_PORT="5984"

echo "_users"
curl --netrc-file ../couch-adm.netrc -X PUT http://$DB_IP:$DB_PORT/_users 

echo "_replicator"
curl --netrc-file ../couch-adm.netrc -X PUT http://$DB_IP:$DB_PORT/_replicator

echo "_global_changes"
curl --netrc-file ../couch-adm.netrc -X PUT http://$DB_IP:$DB_PORT/_global_changes


echo "deleting db"
curl --netrc-file ../couch-adm.netrc -X DELETE http://$DB_IP:$DB_PORT/geeklistdb

echo "creating db"
curl --netrc-file ../couch-adm.netrc -X PUT http://$DB_IP:$DB_PORT/geeklistdb

#Add a read/write user
echo "Add user grog"
curl --netrc-file ../couch-usr.netrc -X PUT http://$DB_IP:$DB_PORT/_users/org.couchdb.user:grog \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -d '{"name":"grog", "roles":[], "type":"user", "password":"kampai"}' \

echo "Assign grog as admin to geeklistdb"
curl --netrc-file ../couch-usr.netrc -X PUT http://$DB_IP:$DB_PORT/geeklistdb/_security \
  -H "Content-Type: application/json" \
  -d '{"admins": { "names": ["grog"], "roles": [] }, "members": { "names": [], "roles": [] } }'


#echo "geeklist docs"
#curl -d @data/geeklists.json -H "Content-type: application/json" -X POST http://$DB_IP:$DB_PORT/geeklistdb/_bulk_docs

echo "design_docs/geeklists.json (view)"
curl --netrc-file ../couch-usr.netrc -d @design_docs/geeklists.json -H "Content-type: application/json" -X PUT http://$DB_IP:$DB_PORT/geeklistdb/_design/geeklists


echo "geeklist view"
curl --netrc-file ../couch-usr.netrc -d @design_docs/geeklist.json -H "Content-type: application/json" -X PUT http://$DB_IP:$DB_PORT/geeklistdb/_design/geeklist


echo "boardgame view"
curl --netrc-file ../couch-usr.netrc -d @design_docs/boardgame.json -H "Content-type: application/json" -X PUT http://$DB_IP:$DB_PORT/geeklistdb/_design/boardgame

curl --netrc-file ../couch-usr.netrc -d @design_docs/boardgame2.json -H "Content-type: application/json" -X PUT http://$DB_IP:$DB_PORT/geeklistdb/_design/boardgame2

echo "boardgamestats view"
curl --netrc-file ../couch-usr.netrc -d @design_docs/boardgamestats.json -H "Content-type: application/json" -X PUT http://$DB_IP:$DB_PORT/geeklistdb/_design/boardgamestats


echo "geekliststats view"
curl --netrc-file ../couch-usr.netrc -d @design_docs/geekliststats.json -H "Content-type: application/json" -X PUT http://$DB_IP:$DB_PORT/geeklistdb/_design/geekliststats


echo "geeklistfilters view"
curl --netrc-file ../couch-usr.netrc -d @design_docs/geeklistfilters.json -H "Content-type: application/json" -X PUT http://$DB_IP:$DB_PORT/geeklistdb/_design/geeklistfilters
