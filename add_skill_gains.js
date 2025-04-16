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

// Function to determine appropriate skill gains based on job level and career category
const determineSkillGains = (level, skillRequirements, jobData) => {
  // Extract job category from the context if available
  let category = 'unknown';
  
  // Method 1: Look for explicit category in the job object
  const categoryMatch = jobData ? jobData.match(/category: ['"]([^'"]+)['"]/) : null;
  if (categoryMatch) {
    category = categoryMatch[1];
  } 
  // Method 2: Look for category in parent object context
  else if (jobData) {
    // Look for category in parent structure (up to 500 chars before the job entry)
    const startIndex = Math.max(0, jobsContent.indexOf(jobData) - 500);
    const contextSection = jobsContent.substring(startIndex, jobsContent.indexOf(jobData));
    
    const parentCategoryMatch = contextSection.match(/category: ['"]([^'"]+)['"]/);
    if (parentCategoryMatch) {
      category = parentCategoryMatch[1];
    }
    
    // Method 3: Look for explicit name indicators in job title
    if (category === 'unknown' && jobData) {
      // Look for common job titles that indicate category
      const jobTitle = jobData.match(/title: ['"]([^'"]+)['"]/);
      if (jobTitle) {
        const title = jobTitle[1].toLowerCase();
        
        // Business category indicators
        if (title.includes('marketing') || 
            title.includes('manager') || 
            title.includes('director') || 
            title.includes('ceo') || 
            title.includes('executive') || 
            title.includes('business') ||
            title.includes('sales') ||
            title.includes('entrepreneur')) {
          category = 'business';
        }
        
        // Legal category indicators
        else if (title.includes('lawyer') || 
                title.includes('attorney') || 
                title.includes('legal') || 
                title.includes('judge') || 
                title.includes('paralegal')) {
          category = 'legal';
        }
        
        // Technology category indicators
        else if (title.includes('developer') || 
                title.includes('programmer') || 
                title.includes('engineer') || 
                title.includes('software') || 
                title.includes('it ') || 
                title.includes('web') || 
                title.includes('data scientist')) {
          category = 'technology';
        }
        
        // Other categories can be added as needed
      }
    }
  }
  
  console.log(`Job level: ${level}, detected category: ${category}`);
  
  // Primary and secondary skills by career category
  const categorySkills = {
    // Business-focused professions
    'business': {
      primary: 'leadership',
      secondary: 'charisma',
      primaryValue: {
        entry: 25,
        junior: 30,
        mid: 35,
        senior: 40,
        executive: 45
      },
      secondaryValue: {
        entry: 15,
        junior: 20,
        mid: 25,
        senior: 30,
        executive: 35
      }
    },
    // Legal professions
    'legal': {
      primary: 'intelligence',
      secondary: 'charisma',
      primaryValue: {
        entry: 25,
        junior: 30,
        mid: 35,
        senior: 40,
        executive: 45
      },
      secondaryValue: {
        entry: 15,
        junior: 20,
        mid: 25,
        senior: 30,
        executive: 35
      }
    },
    // Science professions
    'science': {
      primary: 'intelligence',
      secondary: 'technical',
      primaryValue: {
        entry: 25,
        junior: 30,
        mid: 35,
        senior: 40,
        executive: 45
      },
      secondaryValue: {
        entry: 15,
        junior: 20,
        mid: 25,
        senior: 30,
        executive: 35
      }
    },
    // Healthcare professions
    'healthcare': {
      primary: 'technical',
      secondary: 'intelligence',
      primaryValue: {
        entry: 25,
        junior: 30,
        mid: 35,
        senior: 40,
        executive: 45
      },
      secondaryValue: {
        entry: 15,
        junior: 20,
        mid: 25,
        senior: 30,
        executive: 35
      }
    },
    // Technology professions
    'technology': {
      primary: 'technical',
      secondary: 'intelligence',
      primaryValue: {
        entry: 25,
        junior: 30,
        mid: 35,
        senior: 40,
        executive: 45
      },
      secondaryValue: {
        entry: 15,
        junior: 20,
        mid: 25,
        senior: 30,
        executive: 35
      }
    },
    // Education professions
    'education': {
      primary: 'intelligence',
      secondary: 'charisma',
      primaryValue: {
        entry: 25,
        junior: 30,
        mid: 35,
        senior: 40,
        executive: 45
      },
      secondaryValue: {
        entry: 15,
        junior: 20,
        mid: 25,
        senior: 30,
        executive: 35
      }
    },
    // Creative professions
    'creative': {
      primary: 'creativity',
      secondary: 'charisma',
      primaryValue: {
        entry: 25,
        junior: 30,
        mid: 35,
        senior: 40,
        executive: 45
      },
      secondaryValue: {
        entry: 15,
        junior: 20,
        mid: 25,
        senior: 30,
        executive: 35
      }
    },
    // Government professions
    'government': {
      primary: 'leadership',
      secondary: 'intelligence',
      primaryValue: {
        entry: 25,
        junior: 30,
        mid: 35,
        senior: 40,
        executive: 45
      },
      secondaryValue: {
        entry: 15,
        junior: 20,
        mid: 25,
        senior: 30,
        executive: 35
      }
    },
    // Trade professions
    'trade': {
      primary: 'technical',
      secondary: 'physical',
      primaryValue: {
        entry: 25,
        junior: 30,
        mid: 35,
        senior: 40,
        executive: 45
      },
      secondaryValue: {
        entry: 15,
        junior: 20,
        mid: 25,
        senior: 30,
        executive: 35
      }
    },
    // Default for unknown categories
    'unknown': {
      primary: 'intelligence',
      secondary: 'technical',
      primaryValue: {
        entry: 20,
        junior: 25,
        mid: 30,
        senior: 35,
        executive: 40
      },
      secondaryValue: {
        entry: 10,
        junior: 15,
        mid: 20,
        senior: 25,
        executive: 30
      }
    }
  };
  
  // Get the category config or default to unknown
  const categoryConfig = categorySkills[category] || categorySkills.unknown;
  
  // Create a gains object with exactly two skills
  const gains = {};
  gains[categoryConfig.primary] = categoryConfig.primaryValue[level] || categoryConfig.primaryValue.entry;
  gains[categoryConfig.secondary] = categoryConfig.secondaryValue[level] || categoryConfig.secondaryValue.entry;
  
  return gains;
};

// Function to convert skill gains object to string format
const skillGainsToString = (gains) => {
  return `{ ${Object.entries(gains).map(([skill, value]) => `${skill}: ${value}`).join(', ')} }`;
};

// Regular expression to find jobs without skillGains - more comprehensive pattern
// Changed to find ALL job entries, not just ones without skillGains
const jobLevelRegex = /level: ['"](\w+)['"],\s+title: ['"](.+?)['"],\s+salary: (\d+),\s+description: ['"](.+?)['"],\s+skillRequirements: (\{[^}]*\}),(?:\s+skillGains: \{[^}]*\},?){1,3}/g;

// More inclusive pattern to catch other variations - modified to handle existing skillGains
const altJobRegex = /level: ['"](\w+)['"].*?skillRequirements: (\{[^}]*\}),(?:\s+skillGains: \{[^}]*\},)?.*?(?=happinessImpact)/gs;

// Ultra aggressive pattern to catch any remaining jobs by specific formatting - modified to handle existing skillGains
const lastJobRegex = /level: ['"](\w+)['"],\s+title: ['"]([^'"]+)['"],\s+salary: (\d+),[\s\S]*?skillRequirements: (\{[^}]*\}),(?:\s+skillGains: \{[^}]*\},)?/gs;

// Function to process a match and add skillGains
const processMatch = (match, level, title, salary, description, skillReqs, jobContext) => {
  // Find the job context (the surrounding code) if it wasn't provided
  if (!jobContext) {
    // Try to get some context by searching a bit before where the match was found
    const contextStart = Math.max(0, jobsContent.indexOf(match) - 500);
    const contextEnd = jobsContent.indexOf(match) + match.length + 100;
    jobContext = jobsContent.substring(contextStart, contextEnd);
  }

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

  // Generate appropriate skill gains using job context to determine category
  const skillGains = determineSkillGains(level, requirements, jobContext);
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

// Apply final pattern for any stubborn remaining ones
modifiedContent = modifiedContent.replace(lastJobRegex, (match) => {
  // Extract the level, title, salary and skill requirements
  const levelMatch = match.match(/level: ['"](\w+)['"]/);
  const titleMatch = match.match(/title: ['"]([^'"]+)['"]/);
  const salaryMatch = match.match(/salary: (\d+)/);
  const skillReqsMatch = match.match(/skillRequirements: (\{[^}]*\})/);
  
  if (levelMatch && skillReqsMatch) {
    const level = levelMatch[1];
    const title = titleMatch ? titleMatch[1] : "Unknown Job";
    const salary = salaryMatch ? salaryMatch[1] : "0";
    const skillReqs = skillReqsMatch[1];
    
    // Get the job info to feed to the processor
    const requirements = {};
    const skillMatches = skillReqs.match(/(\w+): (\d+)/g);
    if (skillMatches) {
      skillMatches.forEach(req => {
        const [skill, value] = req.split(': ');
        requirements[skill] = parseInt(value, 10);
      });
    }
    
    // Generate skill gains and format
    const skillGains = determineSkillGains(level, requirements, match);
    const skillGainsStr = skillGainsToString(skillGains);
    
    // Insert after skill requirements
    return match.replace(/skillRequirements: (\{[^}]*\}),/, 
      `skillRequirements: $1,\n        skillGains: ${skillGainsStr},`);
  }
  
  return match;  // Return unchanged if we can't extract what we need
});

// Write the modified content back to the file
fs.writeFileSync(jobsFilePath, modifiedContent, 'utf8');
console.log('Added skillGains to all profession levels that were missing them.');