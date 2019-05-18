#!/bin/bash

function glazebackup(){
	base="$HOME/backup/"
	filebase="-geeklistdb.dump"
	dest="$base`date +%Y%m%d-%H%M%S`$filebase"

	couchdb-dump -b 100 "http://127.0.0.1:5984/geeklistdb" > $dest 2>"${dest}.log"

	echo "zipping couchdb backup"
	gzip $dest 

	echo "pushing to s3"
	s3cmd --no-progress put "$dest.gz" s3://hoffy-geeklistdb 

	echo "Cleaning up old"
        find $base -type f -name "*${filebase}.log" -mtime 1 -delete
	find $base -type f -name "*${filebase}" -mtime +3 -delete
	find $base -type f -name "*${filebase}.gz" -mtime +7 -delete
}

glazebackup 2>&1|logger -t "geeklistanalyzer-backup" 
