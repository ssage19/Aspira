#!/bin/bash

file="client/src/lib/data/lifestyleItems.ts"

# Add durations to jewelry and watches
sed -i 's/name: .Mid-Range Luxury Watch.,/name: \0\n    durationInDays: 730, \/\/ 2 years/g' $file
sed -i 's/name: .High-End Luxury Watch.,/name: \0\n    durationInDays: 1095, \/\/ 3 years/g' $file
sed -i 's/name: .Ultra-Premium Timepiece.,/name: \0\n    durationInDays: 1825, \/\/ 5 years/g' $file
sed -i 's/name: .Fine Jewelry Piece.,/name: \0\n    durationInDays: 730, \/\/ 2 years/g' $file
sed -i 's/name: .Designer Jewelry Set.,/name: \0\n    durationInDays: 1095, \/\/ 3 years/g' $file
sed -i 's/name: .Signature Jewelry Collection.,/name: \0\n    durationInDays: 1825, \/\/ 5 years/g' $file
sed -i 's/name: .Iconic Branded Jewelry.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file
sed -i 's/name: .Rare Gemstone Collection.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file

# Add durations to art and collectibles
sed -i 's/name: .Limited Edition Art Print.,/name: \0\n    durationInDays: 1825, \/\/ 5 years/g' $file
sed -i 's/name: .Emerging Artist Original.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file
sed -i 's/name: .Original Painting.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file
sed -i 's/name: .Fine Art Sculpture.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file
sed -i 's/name: .Fine Art Collection.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file
sed -i 's/name: .Museum-Quality Masterpiece.,/name: \0\n    durationInDays: 7300, \/\/ 20 years/g' $file
sed -i 's/name: .Rare Book Collection.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file
sed -i 's/name: .Antique Furniture Collection.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file
sed -i 's/name: .Classic Vintage Car.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file
sed -i 's/name: .Vintage Car Collection.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file

# Add durations to lifestyle items 
sed -i 's/name: .Designer Wardrobe.,/name: \0\n    durationInDays: 365, \/\/ 1 year/g' $file
sed -i 's/name: .Bespoke Suit Collection.,/name: \0\n    durationInDays: 730, \/\/ 2 years/g' $file
sed -i 's/name: .Haute Couture Collection.,/name: \0\n    durationInDays: 730, \/\/ 2 years/g' $file
sed -i 's/name: .Fine Wine Collection.,/name: \0\n    durationInDays: 1825, \/\/ 5 years/g' $file
sed -i 's/name: .Rare Whiskey Collection.,/name: \0\n    durationInDays: 3650, \/\/ 10 years/g' $file
sed -i 's/name: .Luxury Home Spa.,/name: \0\n    durationInDays: 1825, \/\/ 5 years/g' $file
sed -i 's/name: .Premium Home Theater.,/name: \0\n    durationInDays: 1825, \/\/ 5 years/g' $file
sed -i 's/name: .Smart Home System.,/name: \0\n    durationInDays: 1095, \/\/ 3 years/g' $file
sed -i 's/name: .Private Chef Service.,/name: \0\n    durationInDays: 365, \/\/ 1 year/g' $file
sed -i 's/name: .Personal Stylist.,/name: \0\n    durationInDays: 365, \/\/ 1 year/g' $file
sed -i 's/name: .Celebrity Personal Trainer.,/name: \0\n    durationInDays: 180, \/\/ 6 months/g' $file
sed -i 's/name: .Meditation Retreat Package.,/name: \0\n    durationInDays: 180, \/\/ 6 months/g' $file

echo "Updated durations for luxury items"

