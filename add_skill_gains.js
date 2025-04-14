// Script to add skillGains to all professions in jobs.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jobsFilePath = path.join(__dirname, 'client/src/lib/data/jobs.ts');

// Read the jobs.ts file
let jobsContent = fs.readFileSync(jobsFilePath, 'utf8');

// Function to determine appropriate skill gains based on job level and requirements
const determineSkillGains = (level, skillRequirements) => {
  const defaultGains = {
    entry: {
      intelligence: 15,
      technical: 15,
    },
    junior: {
      intelligence: 20, 
      technical: 20,
      leadership: 5
    },
    mid: {
      intelligence: 25,
      technical: 20, 
      leadership: 15
    },
    senior: {
      intelligence: 25,
      technical: 20,
      leadership: 25,
      charisma: 15
    },
    executive: {
      intelligence: 30,
      technical: 20,
      leadership: 35,
      charisma: 25
    }
  };

  // For entry level, we just use defaults since there are no requirements
  if (level === 'entry' || !skillRequirements || Object.keys(skillRequirements).length === 0) {
    return defaultGains.entry;
  }

  // For other levels, customize based on the job's skill requirements
  let gains = {...defaultGains[level]};
  
  // Boost the skills that are required for the job
  if (skillRequirements) {
    Object.keys(skillRequirements).forEach(skill => {
      if (!gains[skill]) {
        gains[skill] = 10; // Add skill if not there
      } else {
        gains[skill] += 5; // Boost existing skill
      }
      
      // Cap at reasonable values
      if (gains[skill] > 40) gains[skill] = 40;
    });
  }
  
  // For creative jobs, boost creativity
  if (skillRequirements && skillRequirements.creativity) {
    gains.creativity = Math.max(gains.creativity || 0, 25);
  }
  
  return gains;
};

// Function to convert skill gains object to string format
const skillGainsToString = (gains) => {
  return `{ ${Object.entries(gains).map(([skill, value]) => `${skill}: ${value}`).join(', ')} }`;
};

// Regular expression to find jobs without skillGains - more comprehensive pattern
const jobLevelRegex = /level: ['"](\w+)['"],\s+title: ['"](.+?)['"],\s+salary: (\d+),\s+description: ['"](.+?)['"],\s+skillRequirements: (\{[^}]*\}),(?!\s+skillGains)/g;

// More inclusive pattern to catch other variations
const altJobRegex = /level: ['"](\w+)['"],(?:(?!skillGains).)*?skillRequirements: (\{[^}]*\}),(?:(?!skillGains).)*?(?=happinessImpact)/gs;

// Function to process a match and add skillGains
const processMatch = (match, level, title, salary, description, skillReqs) => {
  // Parse the skill requirements
  let requirements = {};
  try {
    // Simple parsing of the requirements object
    const reqMatches = skillReqs.match(/(\w+): (\d+)/g);
    if (reqMatches) {
      reqMatches.forEach(req => {
        const [skill, value] = req.split(': ');
        requirements[skill] = parseInt(value, 10);
      });
    }
  } catch (e) {
    console.error(`Error parsing requirements for ${title || 'unknown job'}:`, e);
  }

  // Generate appropriate skill gains
  const skillGains = determineSkillGains(level, requirements);
  const skillGainsStr = skillGainsToString(skillGains);

  // Add skillGains property
  if (title && salary && description) {
    return `level: '${level}',
        title: '${title}',
        salary: ${salary},
        description: '${description}',
        skillRequirements: ${skillReqs},
        skillGains: ${skillGainsStr},`;
  } else {
    // For alternative pattern, we may not have all the parts
    return match.replace(/skillRequirements: (\{[^}]*\}),/, 
      `skillRequirements: $1,\n        skillGains: ${skillGainsStr},`);
  }
};

// Replace all instances without skillGains using first pattern
let modifiedContent = jobsContent.replace(jobLevelRegex, (match, level, title, salary, description, skillReqs) => {
  return processMatch(match, level, title, salary, description, skillReqs);
});

// Apply second pattern for any remaining ones
modifiedContent = modifiedContent.replace(altJobRegex, (match) => {
  // Extract the level and skill requirements
  const levelMatch = match.match(/level: ['"](\w+)['"]/);
  const skillReqsMatch = match.match(/skillRequirements: (\{[^}]*\})/);
  
  if (levelMatch && skillReqsMatch) {
    const level = levelMatch[1];
    const skillReqs = skillReqsMatch[1];
    
    return processMatch(match, level, null, null, null, skillReqs);
  }
  
  return match;  // Return unchanged if we can't extract what we need
});

// Write the modified content back to the file
fs.writeFileSync(jobsFilePath, modifiedContent, 'utf8');
console.log('Added skillGains to all profession levels that were missing them.');