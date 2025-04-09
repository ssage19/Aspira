#!/bin/bash

# Fix the carpenter executive position
sed -i '2763,2767c\          technical: 700,\n          management: 650,\n          physical: 550,\n          creativity: 500' client/src/lib/data/jobs.ts

# Fix the HVAC contractor position
sed -i '2842,2846c\          technical: 800,\n          management: 650,\n          physical: 500' client/src/lib/data/jobs.ts

# Fix the Welding Inspector/Contractor position
sed -i '2920,2924c\          technical: 850,\n          management: 550,\n          physical: 700' client/src/lib/data/jobs.ts

# Fix the Shop Manager/Owner position
sed -i '2998,3002c\          technical: 800,\n          management: 600,\n          physical: 400' client/src/lib/data/jobs.ts

# Fix the Masonry Contractor position
sed -i '3078,3082c\          technical: 650,\n          management: 600,\n          physical: 700' client/src/lib/data/jobs.ts

# Fix the Construction Superintendent position
sed -i '3157,3161c\          technical: 600,\n          management: 750,\n          physical: 550' client/src/lib/data/jobs.ts

# Fix the Landscape Architect/Contractor position 
sed -i '3238,3242c\          technical: 600,\n          management: 550,\n          physical: 350,\n          creativity: 700' client/src/lib/data/jobs.ts

# Fix the other duplicate positions
sed -i '3319,3323c\          technical: 550,\n          management: 600,\n          physical: 400,\n          creativity: 350' client/src/lib/data/jobs.ts

# Fix the last duplicate position
sed -i '3398,3402c\          technical: 800,\n          management: 650,\n          physical: 500' client/src/lib/data/jobs.ts

chmod +x fix_duplicates.sh
./fix_duplicates.sh
