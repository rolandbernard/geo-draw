#!/bin/bash

dir_name=$(dirname $(realpath $0))

echo ">>>>> START $(date) >>>>>" >> ${dir_name}/debug.txt
bash ${dir_name}/update.sh >> ${dir_name}/debug.txt 2>&1
echo "<<<<< STOP  $(date) <<<<<" >> ${dir_name}/debug.txt

