#!/bin/bash

file="client/src/lib/data/lifestyleItems.ts"

# First, remove the duplicated entries
duplicates=$(grep -n "^ \+durationInDays:" $file | cut -d':' -f1)

for line in $duplicates; do
  # Delete the line
  sed -i "${line}d" $file
done

# Fix any JSON syntax issues
sed -i 's/,\s*}/}/g' $file  # Remove trailing commas before closing braces
sed -i 's/,\s*\]/]/g' $file  # Remove trailing commas before closing brackets

echo "Fixed duplicate durationInDays entries and JSON syntax issues"
