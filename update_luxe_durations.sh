#!/bin/bash

# Create a backup
cp client/src/lib/data/lifestyleItems.ts client/src/lib/data/lifestyleItems.ts.bak2

# Create a temporary file for processed content
temp_file=$(mktemp)

# Process the file and add the type declaration as needed
awk '
BEGIN {
  inside_vacation = 0
  vacation_item_start = 0
  attributes_end = 0
  duration_value = 7
}

# Track when we start a vacation item
/type: '\''vacations'\''/ {
  inside_vacation = 1
  vacation_item_start = NR
}

# Parse duration to determine duration in days
/duration:/ && inside_vacation {
  if ($0 ~ /1 day/) duration_value = 1
  else if ($0 ~ /2 day/) duration_value = 2
  else if ($0 ~ /3 day/) duration_value = 3
  else if ($0 ~ /4 day/) duration_value = 4
  else if ($0 ~ /5 day/) duration_value = 5
  else if ($0 ~ /6 day/) duration_value = 6
  else if ($0 ~ /2 week/) duration_value = 14
  else if ($0 ~ /3 week/) duration_value = 21
  else if ($0 ~ /4 week/) duration_value = 28
  else if ($0 ~ /month/) duration_value = 30
  else if ($0 ~ /2 month/) duration_value = 60
  else if ($0 ~ /3 month/) duration_value = 90
  else if ($0 ~ /year/) duration_value = 365
  else if ($0 ~ /10 day/) duration_value = 10
  else duration_value = 7  # default to 1 week
}

# Handle end of attributes or item
/^    }/ && inside_vacation {
  attributes_end = NR
}

# End of item - check if we need to add durationInDays
/^  },/ && inside_vacation {
  # If we havent found durationInDays, insert it after attributes
  if (!has_duration_days && attributes_end > 0) {
    print $0
    print "    durationInDays: " duration_value ","
    inside_vacation = 0
    has_duration_days = 0
    attributes_end = 0
    duration_value = 7
    next
  }
  inside_vacation = 0
  has_duration_days = 0
  attributes_end = 0
  duration_value = 7
}

# Check if durationInDays already exists
/durationInDays:/ && inside_vacation {
  has_duration_days = 1
}

# Print the line
{
  print $0
}
' client/src/lib/data/lifestyleItems.ts > $temp_file

# Replace the original file
mv $temp_file client/src/lib/data/lifestyleItems.ts

echo "Added missing durationInDays to vacation items"

# Now handle experience items
temp_file=$(mktemp)

# Process the file and add the type declaration as needed
awk '
BEGIN {
  inside_experience = 0
  exp_item_start = 0
  has_duration_days = 0
}

# Track when we start an experience item
/type: '\''experiences'\''/ {
  inside_experience = 1
  exp_item_start = NR
}

# Process price line to add durationInDays
/price:/ && inside_experience && !has_price {
  has_price = 1
  print $0
  
  # If we havent found durationInDays, insert it after price
  if (!has_duration_days) {
    gsub(/^[ \t]+/, "", indentation)  # Get the indentation
    print "    durationInDays: 1, // One-day experience"
    next
  }
}

# End of item - reset flags
/^  },/ && inside_experience {
  inside_experience = 0
  has_duration_days = 0
  has_price = 0
}

# Check if durationInDays already exists
/durationInDays:/ && inside_experience {
  has_duration_days = 1
}

# Print the line
{
  print $0
}
' client/src/lib/data/lifestyleItems.ts > $temp_file

# Replace the original file
mv $temp_file client/src/lib/data/lifestyleItems.ts

echo "Added missing durationInDays to experience items"
