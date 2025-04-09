#!/bin/bash

# Find all lines with duplicate leadership keys
grep -n "leadership: [0-9]*," client/src/lib/data/jobs.ts | awk -F: '{print $1}' | sort -n > line_numbers.txt

# Create a temporary file
cat client/src/lib/data/jobs.ts > temp_file.ts

# For each duplicate leadership key line, check if the next line has a leadership key
while read -r line_num; do
  next_line=$((line_num + 1))
  if grep -q "leadership: [0-9]*," <(head -n $next_line client/src/lib/data/jobs.ts | tail -n 1); then
    # Keep the first leadership entry, remove the second
    sed -i "${next_line}d" temp_file.ts
  fi
done < line_numbers.txt

# Replace the original file
mv temp_file.ts client/src/lib/data/jobs.ts

# Clean up
rm line_numbers.txt
