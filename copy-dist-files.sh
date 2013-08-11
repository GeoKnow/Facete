#!/bin/bash
for f in `find . -name *.dist`; do 
#	echo "$f" "${f%.dist}"
	cp "$f" "${f%.dist}"
	#mv -- "$f" "${f%.txt}.text"
done
