#!/bin/sh

echo "doc compaction"
curl -H "Content-Type: application/json" -X POST http://localhost:5984/geeklistdb/_compact


echo "view compaction"
for designdoc in boardgame boardgame2 boardgamestats geeklistfilters geeklisthistograms geeklist geeklists geekliststats
do
	echo $designdoc
	curl -H "Content-Type: application/json" -X POST http://localhost:5984/geeklistdb/_compact/$designdoc
done

echo "view cleanup"
curl -H "Content-Type: application/json" -X POST http://localhost:5984/geeklistdb/_view_cleanup
