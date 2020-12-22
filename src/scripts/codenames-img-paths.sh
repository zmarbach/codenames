#!/bin/bash

# Create 280 jpg files as placeholder for codenames img paths

NUM=1

echo "Moving to the assets directory."
cd ../assets/imgs
echo "Now in" $(pwd)

while [ $NUM -lt 281 ]; do
  FILENAME="${NUM}.jpg"
  touch ${FILENAME}
  echo "File created --> $(pwd)/${FILENAME}"
  ((NUM++))
 done
