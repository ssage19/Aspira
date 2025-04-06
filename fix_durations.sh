#!/bin/bash

file="client/src/lib/data/lifestyleItems.ts"

# Keep track of which vacation items we've fixed
touch /tmp/fixed_vacations.txt
touch /tmp/fixed_experiences.txt

# Add durations to vacation items
grep -n "type: 'vacations'" $file | while read -r line; do
  item_start=$(echo $line | cut -d':' -f1)
  item_end=$(tail -n +$item_start $file | grep -n "},\?$" | head -1 | cut -d':' -f1)
  item_end=$((item_start + item_end - 1))
  
  # Extract duration from the item to determine durationInDays
  duration_line=$(tail -n +$item_start $file | head -n $((item_end - item_start + 1)) | grep "duration:")
  
  # Check if durationInDays already exists in the item
  has_duration=$(tail -n +$item_start $file | head -n $((item_end - item_start + 1)) | grep -c "durationInDays:")
  
  if [ $has_duration -eq 0 ]; then
    # Based on duration string, set appropriate durationInDays
    days=7 # default to 1 week
    
    if [[ "$duration_line" == *"1 day"* ]]; then
      days=1
    elif [[ "$duration_line" == *"2 day"* ]]; then
      days=2
    elif [[ "$duration_line" == *"3 day"* ]]; then
      days=3
    elif [[ "$duration_line" == *"4 day"* ]]; then
      days=4
    elif [[ "$duration_line" == *"5 day"* ]]; then
      days=5
    elif [[ "$duration_line" == *"6 day"* ]]; then
      days=6
    elif [[ "$duration_line" == *"week"* ]]; then
      if [[ "$duration_line" == *"2 week"* ]]; then
        days=14
      elif [[ "$duration_line" == *"3 week"* ]]; then
        days=21
      elif [[ "$duration_line" == *"4 week"* ]]; then
        days=28
      fi
    elif [[ "$duration_line" == *"10 day"* ]]; then
      days=10
    elif [[ "$duration_line" == *"month"* ]]; then
      days=30
      if [[ "$duration_line" == *"2 month"* ]]; then
        days=60
      elif [[ "$duration_line" == *"3 month"* ]]; then
        days=90
      fi
    elif [[ "$duration_line" == *"year"* ]]; then
      days=365
    fi
    
    # Find attributes line to insert after
    attributes_end=$(tail -n +$item_start $file | head -n $((item_end - item_start + 1)) | grep -n "}$" | head -1 | cut -d':' -f1)
    attributes_end=$((item_start + attributes_end - 1))
    
    # Prepare the line to insert with proper indentation
    indent_level=$(grep -n "id:" $file | head -1 | sed 's/[^[:space:]].*//' | wc -c)
    indent=$(printf "%${indent_level}s" "")
    
    # Insert durationInDays right after attributes closing brace
    sed -i "${attributes_end}i\\${indent}durationInDays: $days," $file
    
    echo "Added durationInDays: $days to vacation item at line $item_start" >> /tmp/fixed_vacations.txt
  fi
done

# Add durations to experience items
grep -n "type: 'experiences'" $file | while read -r line; do
  item_start=$(echo $line | cut -d':' -f1)
  item_end=$(tail -n +$item_start $file | grep -n "},\?$" | head -1 | cut -d':' -f1)
  item_end=$((item_start + item_end - 1))
  
  # Check if durationInDays already exists in the item
  has_duration=$(tail -n +$item_start $file | head -n $((item_end - item_start + 1)) | grep -c "durationInDays:")
  
  if [ $has_duration -eq 0 ]; then
    # For experiences, insert durationInDays after price
    price_line=$(tail -n +$item_start $file | head -n $((item_end - item_start + 1)) | grep -n "price:" | head -1 | cut -d':' -f1)
    price_line=$((item_start + price_line - 1))
    
    # Prepare the line to insert with proper indentation
    indent_level=$(grep -n "price:" $file | head -1 | sed 's/[^[:space:]].*//' | wc -c)
    indent=$(printf "%${indent_level}s" "")
    
    # Insert durationInDays right after price
    sed -i "${price_line}a\\${indent}durationInDays: 1, // One-day experience" $file
    
    echo "Added durationInDays: 1 to experience item at line $item_start" >> /tmp/fixed_experiences.txt
  fi
done

echo "Vacation items updated: $(wc -l < /tmp/fixed_vacations.txt)"
echo "Experience items updated: $(wc -l < /tmp/fixed_experiences.txt)"
