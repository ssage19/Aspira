#!/bin/bash

file="client/src/lib/data/lifestyleItems.ts"

# Fix all instances of "name: name:"
sed -i 's/name: name:/name:/g' $file

echo "Fixed duplicate name attributes"

