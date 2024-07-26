#!/bin/bash

function glazebackup(){
	base="$HOME/backup/"
	filebase="-geeklistdb-boardgames.json"
	dest="$base`date +%Y%m%d-%H%M%S`$filebase"
	
	echo "dumping couchdb"	
	#couchdb-dump "http://127.0.0.1:5984/geeklistdb" | xz > "${dest}.xz" 2>/dev/null #"${dest}.log"
	curl -sS "http://127.0.0.1:5984/geeklistdb/_design/boardgame/_view/boardgame?include_docs=true" -o "${dest}"

	echo "stripping ._rev and compressing"
	cat "${dest}"|jq '.rows[].doc|del(._rev)'|jq -s '{docs: .}' | xz > "${dest}.xz"

	echo "pushing to s3"
	s3cmd --no-progress put "${dest}.xz" s3://hoffy-geeklistdb 

	echo "Cleaning up old"
        find $base -type f -name "*${filebase}.log" -mtime +1 -delete
	find $base -type f -name "*${filebase}" -mtime +3 -delete
	find $base -type f -name "*${filebase}.xz" -mtime +7 -delete
}

glazebackup 2>&1|logger -t "geeklistanalyzer-backup" 
