#!/bin/bash
ls -1 | while read file; do
	echo "$file:"
	echo "--------------------------------------------------"
	apt-cache search "$file"
done
