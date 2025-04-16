// Script to fix duplicate skillGains in jobs.ts
import fs from 'fs';

const filePath = './client/src/lib/data/jobs.ts';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Regular expression to find duplicate skillGains entries
// This pattern finds 2 or 3 consecutive skillGains properties
const duplicatePattern = /(skillGains: \{[^}]+\},)(\s+skillGains: \{[^}]+\},)(\s+skillGains: \{[^}]+\},)?/g;

// Replace with just the first skillGains entry
const fixedContent = fileContent.replace(duplicatePattern, '$1');

// Write the fixed content back to the file
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('Duplicate skillGains entries have been fixed!');