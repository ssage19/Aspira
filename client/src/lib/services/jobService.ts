import { CharacterSkills, Job } from "../stores/useCharacter";
import { 
  professions, 
  Profession, 
  CareerPath, 
  JobLevel, 
  meetsSkillRequirements,
  getNextJobInCareerPath,
  getProfession,
  getJobByLevelInProfession,
  getProfessionsByCategory,
  getAllProfessionCategories,
  getCategoryLabel,
  JobCategory
} from "../data/jobs";

// List of fictional companies for each job category
const companiesByCategory: Record<JobCategory, string[]> = {
  'technology': [
    'TechNova Solutions', 
    'ByteWave Systems', 
    'QuantumCore Technologies', 
    'Nexus Digital', 
    'CyberPulse Inc.',
    'Innovatech Systems',
    'FutureForge Technologies',
    'Codesmith Enterprises'
  ],
  'finance': [
    'Meridian Capital Group', 
    'Atlas Financial Services', 
    'Pinnacle Investments', 
    'Sovereign Wealth Partners', 
    'Vertex Financial',
    'Equinox Asset Management',
    'Centauri Financial Group',
    'Prism Fund Analytics'
  ],
  'healthcare': [
    'Vitality Healthcare', 
    'Mercy Medical Center', 
    'WellSpring Health Systems', 
    'Guardian Medical Group', 
    'Rejuvenate Health',
    'Apex Medical Associates',
    'Cascade Healthcare Partners',
    'Helios Medical Network'
  ],
  'education': [
    'Enlighten Academy', 
    'Pioneer Learning Institute', 
    'Knowledge Harbor', 
    'Brilliant Minds School', 
    'Wisdom Path University',
    'Phoenix Educational Services',
    'Elevate Learning Center',
    'Horizon Education Group'
  ],
  'creative': [
    'Imagination Works', 
    'Visionary Design Studio', 
    'Canvas Creative Group', 
    'Spectrum Innovations', 
    'Artisan Collective',
    'Prism Design Partners',
    'Muse Creative Solutions',
    'Kaleidoscope Media Group'
  ],
  'business': [
    'Apex Consultancy Group', 
    'Strategic Solutions Inc.', 
    'Venture Catalyst Partners', 
    'Elevation Business Solutions', 
    'Momentum Enterprises',
    'Catalyst Business Partners',
    'Summit Strategy Group',
    'Horizon Management Consultants'
  ],
  'legal': [
    'Justice Partners Law Firm', 
    'Integrity Legal Associates', 
    'Prestige Law Group', 
    'Advocate Alliance', 
    'Legacy Legal Counsel',
    'Paramount Law Partners',
    'Sentinel Legal Advisors',
    'Zenith Law Offices'
  ],
  'science': [
    'Discovery Laboratories', 
    'Quantum Research Institute', 
    'Horizon Science Foundation', 
    'Breakthrough Innovations', 
    'Intellect Research',
    'Nucleus Scientific',
    'Empirical Research Group',
    'Element Research Labs'
  ],
  'government': [
    'Federal Administration Agency', 
    'National Public Affairs Office', 
    'Central Policy Department', 
    'Civic Affairs Bureau', 
    'Municipal Services',
    'Regional Development Authority',
    'Public Sector Solutions',
    'National Infrastructure Division'
  ],
  'trade': [
    'Elite Craftsmen Guild', 
    'Precision Construction', 
    'Master Works Inc.', 
    'Skilled Trade Alliance', 
    'Craftsman United',
    'Journeyman Builders',
    'Expert Trades Solutions',
    'Pinnacle Construction Group'
  ]
};

// Get a random company from the category
function getRandomCompany(category: JobCategory): string {
  const companies = companiesByCategory[category] || [];
  if (companies.length === 0) return 'Generic Company';
  
  const randomIndex = Math.floor(Math.random() * companies.length);
  return companies[randomIndex];
}

// Convert a career path to a job with company and other details
export function careerPathToJob(
  professionId: string, 
  careerPath: CareerPath, 
  company?: string
): Job {
  const profession = getProfession(professionId);
  if (!profession) {
    throw new Error(`Profession not found: ${professionId}`);
  }
  
  const companyName = company || getRandomCompany(profession.category);
  const stress = calculateJobStress(careerPath);
  
  // Use explicit skill gains if defined in the career path
  // Otherwise, calculate them based on skill requirements
  let skillGains: Partial<CharacterSkills>;
  if (careerPath.skillGains && Object.keys(careerPath.skillGains).length > 0) {
    skillGains = careerPath.skillGains;
  } else {
    skillGains = calculateSkillGains(careerPath.skillRequirements);
  }
  
  // Always cap skill gains at maximum value (25 points per skill)
  const cappedSkillGains = capSkillGains(skillGains);
  
  return {
    id: `${professionId}-${careerPath.level}`,
    title: careerPath.title,
    company: companyName,
    salary: careerPath.salary,
    stress: stress,
    happinessImpact: careerPath.happinessImpact,
    prestigeImpact: careerPath.prestigeImpact,
    timeCommitment: careerPath.timeCommitment,
    skillGains: cappedSkillGains,
    skillRequirements: careerPath.skillRequirements,
    professionId: professionId,
    jobLevel: careerPath.level,
    monthsInPosition: 0,
    experienceRequired: careerPath.experience
  };
}

// Calculate skill gains based on job requirements (skills improve faster in areas the job uses)
function calculateSkillGains(skillRequirements: Partial<CharacterSkills>): Partial<CharacterSkills> {
  const gains: Partial<CharacterSkills> = {};
  
  // Skills used in the job improve faster
  for (const skill in skillRequirements) {
    const typedSkill = skill as keyof CharacterSkills;
    const requirement = skillRequirements[typedSkill] || 0;
    
    // Higher requirements = faster skill gain in that area
    gains[typedSkill] = Math.max(1, Math.floor(requirement / 10));
  }
  
  return gains;
}

// Cap skill gains at the maximum allowed value (25 points per skill)
function capSkillGains(skillGains: Partial<CharacterSkills>, maxGain = 25): Partial<CharacterSkills> {
  const capped: Partial<CharacterSkills> = {};
  
  for (const skill in skillGains) {
    const typedSkill = skill as keyof CharacterSkills;
    const gain = skillGains[typedSkill] || 0;
    
    // Cap gain at 25 points per skill
    capped[typedSkill] = Math.min(gain, maxGain);
  }
  
  return capped;
}

// Calculate job stress based on level, time commitment, and requirements
function calculateJobStress(careerPath: CareerPath): number {
  // Base stress by job level
  const levelStress: Record<JobLevel, number> = {
    'entry': 10,
    'junior': 20,
    'mid': 35,
    'senior': 50,
    'executive': 70
  };
  
  // Calculate time commitment factor (more hours = more stress)
  const timeCommitmentFactor = (careerPath.timeCommitment - 40) / 2;
  
  // Calculate skill requirement factor
  const skillRequirementSum = Object.values(careerPath.skillRequirements)
    .reduce((sum, value) => sum + value, 0);
  const skillFactor = skillRequirementSum / 30;
  
  // Combine factors
  return Math.min(100, Math.max(5, 
    levelStress[careerPath.level] + 
    timeCommitmentFactor + 
    skillFactor
  ));
}

// Get all available entry level jobs 
export function getAvailableEntryLevelJobs(): Job[] {
  return professions.map(profession => {
    const entryJob = profession.careerPath.find(path => path.level === 'entry');
    if (!entryJob) return null;
    return careerPathToJob(profession.id, entryJob);
  }).filter(job => job !== null) as Job[];
}

// Check if a character is eligible for promotion based on their current job and skills
export function checkPromotionEligibility(
  currentJob: Job,
  skills: CharacterSkills
): { 
  eligible: boolean; 
  nextJob?: Job; 
  reason?: string;
  skillsMet: boolean;
  experienceMet: boolean;
} {
  // Get the next job in the career path
  const nextCareerPath = getNextJobInCareerPath(currentJob.professionId, currentJob.jobLevel);
  
  if (!nextCareerPath) {
    return { 
      eligible: false, 
      reason: "You've reached the highest level in this career path",
      skillsMet: false,
      experienceMet: false
    };
  }
  
  // Check experience requirements
  const experienceMet = currentJob.monthsInPosition >= currentJob.experienceRequired;
  
  // Check skill requirements
  const skillsMet = meetsSkillRequirements(skills, nextCareerPath.skillRequirements);
  
  // Create next job object
  const nextJob = careerPathToJob(
    currentJob.professionId, 
    nextCareerPath, 
    currentJob.company // Keep the same company
  );
  
  // Determine eligibility and reason
  if (!experienceMet && !skillsMet) {
    return { 
      eligible: false, 
      nextJob,
      reason: "You need more experience and improved skills for this promotion",
      skillsMet,
      experienceMet
    };
  } else if (!experienceMet) {
    return { 
      eligible: false, 
      nextJob,
      reason: "You need more experience in your current position",
      skillsMet,
      experienceMet
    };
  } else if (!skillsMet) {
    return { 
      eligible: false, 
      nextJob,
      reason: "You need to develop your skills further for this promotion",
      skillsMet,
      experienceMet
    };
  }
  
  return { 
    eligible: true, 
    nextJob,
    skillsMet,
    experienceMet
  };
}

// Get all jobs available for a character based on their skills
export function getJobsAvailableForSkills(skills: CharacterSkills): Job[] {
  const availableJobs: Job[] = [];
  
  // Check all professions and their career paths
  professions.forEach(profession => {
    profession.careerPath.forEach(careerPath => {
      // Skip jobs that require previous experience in the profession
      if (careerPath.experience > 0) return;
      
      // Check if character meets skill requirements
      if (meetsSkillRequirements(skills, careerPath.skillRequirements)) {
        availableJobs.push(careerPathToJob(profession.id, careerPath));
      }
    });
  });
  
  return availableJobs;
}

// Get the next promotion information when not yet employed
export function getJobDetailsAndPath(professionId: string, jobLevel: JobLevel): {
  currentJobDetails: CareerPath;
  careerPath: CareerPath[];
  nextPromotion?: CareerPath;
} {
  const profession = getProfession(professionId);
  if (!profession) {
    throw new Error(`Profession not found: ${professionId}`);
  }
  
  const currentJobDetails = getJobByLevelInProfession(professionId, jobLevel);
  if (!currentJobDetails) {
    throw new Error(`Job level not found: ${jobLevel} in profession ${professionId}`);
  }
  
  // Get next level if exists
  const levelOrder: JobLevel[] = ['entry', 'junior', 'mid', 'senior', 'executive'];
  const currentIndex = levelOrder.indexOf(jobLevel);
  const nextLevel = currentIndex < levelOrder.length - 1 ? levelOrder[currentIndex + 1] : undefined;
  const nextPromotion = nextLevel ? getJobByLevelInProfession(professionId, nextLevel) : undefined;
  
  return {
    currentJobDetails,
    careerPath: profession.careerPath,
    nextPromotion
  };
}

// Export additional functions from jobs.ts
export {
  professions,
  getProfession,
  getProfessionsByCategory,
  getAllProfessionCategories,
  getCategoryLabel,
  getNextJobInCareerPath,
  getJobByLevelInProfession,
  meetsSkillRequirements
};