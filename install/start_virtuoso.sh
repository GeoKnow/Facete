#!/bin/bash
ulimit -c unlimited
wd=`pwd`
../../bin/virtuoso-t -c "$wd/virtuoso.ini"
