#!/bin/bash

dir_name=$(dirname $0)
date >> ${dir_name}/debug.txt
bash ${dir_name}/update.sh >> ${dir_name}/debug.txt 2>&1
date >> ${dir_name}/debug.txt

