// Define job career types
export type JobCategory = 
  | 'technology' 
  | 'finance' 
  | 'healthcare' 
  | 'education' 
  | 'media' 
  | 'business' 
  | 'legal' 
  | 'government'
  | 'creative'
  | 'trades';

// Define skill requirements for jobs
export interface JobSkillRequirements {
  intelligence: number; // 0-100 scale
  creativity: number; // 0-100 scale
  charisma: number; // 0-100 scale
  technical: number; // 0-100 scale
  leadership: number; // 0-100 scale
}

// Define career level structure
export interface CareerLevel {
  title: string;
  salary: number;
  prestige: number;
  timeCommitment: number; // hours per week
  stressLevel: number; // 0-100 scale
  skillRequirements: JobSkillRequirements;
  description: string;
  promotionTimeRequired?: number | null; // months to promotion eligibility
  promotionChance?: number | null; // % chance of promotion when eligible
}

// Define job structure
export interface Job {
  id: string;
  name: string;
  category: JobCategory;
  description: string;
  baseSalary: number;
  careerLevels: CareerLevel[];
  educationRequired?: string;
  special?: string; // any special considerations
  skillGrowth?: Partial<JobSkillRequirements>; // how this job increases skills per year
  specialBenefits?: string[];
}

// Job definitions
export const jobs: Job[] = [
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    category: 'technology',
    description: 'Develop applications and systems software by designing, building, and maintaining efficient code.',
    baseSalary: 85000,
    careerLevels: [
      {
        title: 'Junior Developer',
        salary: 85000,
        prestige: 10,
        timeCommitment: 40,
        stressLevel: 30,
        skillRequirements: {
          intelligence: 60,
          creativity: 40,
          charisma: 30,
          technical: 60,
          leadership: 20
        },
        description: 'Entry-level position responsible for writing code under supervision of more senior developers.',
        promotionTimeRequired: 18,
        promotionChance: 70
      },
      {
        title: 'Software Engineer',
        salary: 120000,
        prestige: 20,
        timeCommitment: 45,
        stressLevel: 40,
        skillRequirements: {
          intelligence: 70,
          creativity: 50,
          charisma: 40,
          technical: 75,
          leadership: 30
        },
        description: 'Mid-level developer responsible for designing and implementing software solutions.',
        promotionTimeRequired: 24,
        promotionChance: 50
      },
      {
        title: 'Senior Engineer',
        salary: 160000,
        prestige: 30,
        timeCommitment: 50,
        stressLevel: 50,
        skillRequirements: {
          intelligence: 80,
          creativity: 60,
          charisma: 50,
          technical: 85,
          leadership: 60
        },
        description: 'Experienced developer who designs complex solutions and mentors junior team members.',
        promotionTimeRequired: 36,
        promotionChance: 40
      },
      {
        title: 'Principal Engineer',
        salary: 220000,
        prestige: 45,
        timeCommitment: 50,
        stressLevel: 60,
        skillRequirements: {
          intelligence: 90,
          creativity: 70,
          charisma: 60,
          technical: 95,
          leadership: 70
        },
        description: 'Technical leader responsible for system architecture and setting technical direction.',
        promotionTimeRequired: 48,
        promotionChance: 20
      },
      {
        title: 'Chief Technology Officer',
        salary: 350000,
        prestige: 80,
        timeCommitment: 55,
        stressLevel: 70,
        skillRequirements: {
          intelligence: 90,
          creativity: 80,
          charisma: 80,
          technical: 90,
          leadership: 90
        },
        description: 'Executive responsible for the organization\'s technological needs and research and development.',
        promotionTimeRequired: undefined,
        promotionChance: undefined
      }
    ],
    skillGrowth: {
      intelligence: 3,
      technical: 4,
      creativity: 2
    },
    specialBenefits: ['Remote work potential', 'Stock options', 'Cutting-edge technology exposure']
  },
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    category: 'finance',
    description: 'Analyze financial data, market trends, and investment opportunities to guide business decisions.',
    baseSalary: 75000,
    careerLevels: [
      {
        title: 'Junior Financial Analyst',
        salary: 75000,
        prestige: 15,
        timeCommitment: 45,
        stressLevel: 40,
        skillRequirements: {
          intelligence: 70,
          creativity: 30,
          charisma: 40,
          technical: 60,
          leadership: 20
        },
        description: 'Entry-level position analyzing financial data and preparing reports under supervision.',
        promotionTimeRequired: 18,
        promotionChance: 70
      },
      {
        title: 'Financial Analyst',
        salary: 95000,
        prestige: 25,
        timeCommitment: 50,
        stressLevel: 50,
        skillRequirements: {
          intelligence: 75,
          creativity: 40,
          charisma: 50,
          technical: 70,
          leadership: 30
        },
        description: 'Mid-level analyst who evaluates investments and creates financial models.',
        promotionTimeRequired: 24,
        promotionChance: 60
      },
      {
        title: 'Senior Financial Analyst',
        salary: 130000,
        prestige: 40,
        timeCommitment: 50,
        stressLevel: 60,
        skillRequirements: {
          intelligence: 85,
          creativity: 50,
          charisma: 60,
          technical: 80,
          leadership: 60
        },
        description: 'Experienced analyst who leads complex financial analyses and oversees junior analysts.',
        promotionTimeRequired: 36,
        promotionChance: 40
      },
      {
        title: 'Investment Manager',
        salary: 200000,
        prestige: 60,
        timeCommitment: 55,
        stressLevel: 70,
        skillRequirements: {
          intelligence: 90,
          creativity: 60,
          charisma: 70,
          technical: 85,
          leadership: 80
        },
        description: 'Senior position managing investment portfolios and making high-level financial decisions.',
        promotionTimeRequired: 48,
        promotionChance: 30
      },
      {
        title: 'Chief Financial Officer',
        salary: 320000,
        prestige: 85,
        timeCommitment: 60,
        stressLevel: 75,
        skillRequirements: {
          intelligence: 95,
          creativity: 70,
          charisma: 80,
          technical: 85,
          leadership: 90
        },
        description: 'Executive responsible for managing financial risks and planning the financial strategy of the entire organization.',
        promotionTimeRequired: undefined,
        promotionChance: undefined
      }
    ],
    skillGrowth: {
      intelligence: 3,
      technical: 3,
      leadership: 2
    },
    specialBenefits: ['Investment opportunities', 'Performance bonuses', 'Financial industry connections']
  },
  {
    id: 'physician',
    name: 'Physician',
    category: 'healthcare',
    description: 'Diagnose and treat injuries, diseases, and medical conditions to improve patient health.',
    baseSalary: 200000,
    careerLevels: [
      {
        title: 'Medical Resident',
        salary: 60000,
        prestige: 40,
        timeCommitment: 70,
        stressLevel: 80,
        skillRequirements: {
          intelligence: 85,
          creativity: 50,
          charisma: 60,
          technical: 80,
          leadership: 30
        },
        description: 'Physician in training who works under supervision while completing medical specialty education.',
        promotionTimeRequired: 36,
        promotionChance: 90
      },
      {
        title: 'Attending Physician',
        salary: 220000,
        prestige: 70,
        timeCommitment: 60,
        stressLevel: 70,
        skillRequirements: {
          intelligence: 90,
          creativity: 60,
          charisma: 70,
          technical: 85,
          leadership: 60
        },
        description: 'Licensed physician who diagnoses and treats patients independently.',
        promotionTimeRequired: 60,
        promotionChance: 50
      },
      {
        title: 'Senior Physician',
        salary: 280000,
        prestige: 80,
        timeCommitment: 55,
        stressLevel: 65,
        skillRequirements: {
          intelligence: 90,
          creativity: 70,
          charisma: 75,
          technical: 90,
          leadership: 70
        },
        description: 'Experienced doctor with established practice and reputation in their specialty.',
        promotionTimeRequired: 72,
        promotionChance: 40
      },
      {
        title: 'Department Chief',
        salary: 350000,
        prestige: 85,
        timeCommitment: 60,
        stressLevel: 75,
        skillRequirements: {
          intelligence: 90,
          creativity: 75,
          charisma: 80,
          technical: 90,
          leadership: 85
        },
        description: 'Leads a medical department in a hospital or large practice.',
        promotionTimeRequired: 84,
        promotionChance: 20
      },
      {
        title: 'Chief Medical Officer',
        salary: 450000,
        prestige: 90,
        timeCommitment: 65,
        stressLevel: 80,
        skillRequirements: {
          intelligence: 95,
          creativity: 80,
          charisma: 85,
          technical: 90,
          leadership: 95
        },
        description: 'Top executive physician responsible for all medical operations in a healthcare organization.',
        promotionTimeRequired: undefined,
        promotionChance: undefined
      }
    ],
    educationRequired: 'Medical Degree',
    skillGrowth: {
      intelligence: 2,
      technical: 3,
      charisma: 2
    },
    specialBenefits: ['High job security', 'Social prestige', 'Opportunity to help others']
  },
  {
    id: 'teacher',
    name: 'Teacher',
    category: 'education',
    description: 'Educate students in various academic subjects, helping them develop knowledge and skills.',
    baseSalary: 45000,
    careerLevels: [
      {
        title: 'Teacher Assistant',
        salary: 30000,
        prestige: 10,
        timeCommitment: 35,
        stressLevel: 30,
        skillRequirements: {
          intelligence: 60,
          creativity: 50,
          charisma: 60,
          technical: 30,
          leadership: 40
        },
        description: 'Assists lead teachers with classroom activities and student support.',
        promotionTimeRequired: 12,
        promotionChance: 80
      },
      {
        title: 'Teacher',
        salary: 50000,
        prestige: 25,
        timeCommitment: 45,
        stressLevel: 50,
        skillRequirements: {
          intelligence: 70,
          creativity: 60,
          charisma: 70,
          technical: 40,
          leadership: 60
        },
        description: 'Full-time educator responsible for classroom instruction and student development.',
        promotionTimeRequired: 36,
        promotionChance: 50
      },
      {
        title: 'Senior Teacher',
        salary: 65000,
        prestige: 35,
        timeCommitment: 50,
        stressLevel: 55,
        skillRequirements: {
          intelligence: 75,
          creativity: 70,
          charisma: 80,
          technical: 50,
          leadership: 70
        },
        description: 'Experienced educator who mentors other teachers and develops curriculum.',
        promotionTimeRequired: 60,
        promotionChance: 40
      },
      {
        title: 'Department Head',
        salary: 80000,
        prestige: 45,
        timeCommitment: 55,
        stressLevel: 60,
        skillRequirements: {
          intelligence: 80,
          creativity: 75,
          charisma: 80,
          technical: 60,
          leadership: 85
        },
        description: 'Leads a subject department and coordinates educational strategies.',
        promotionTimeRequired: 72,
        promotionChance: 30
      },
      {
        title: 'Principal',
        salary: 120000,
        prestige: 60,
        timeCommitment: 60,
        stressLevel: 70,
        skillRequirements: {
          intelligence: 85,
          creativity: 80,
          charisma: 85,
          technical: 70,
          leadership: 90
        },
        description: 'Manages an entire school, overseeing all educational and administrative operations.',
        promotionTimeRequired: undefined,
        promotionChance: undefined
      }
    ],
    educationRequired: 'Bachelor\'s Degree in Education',
    skillGrowth: {
      intelligence: 2,
      creativity: 3,
      charisma: 4
    },
    specialBenefits: ['Summers off', 'Fulfilling work', 'Stable pension']
  },
  {
    id: 'journalist',
    name: 'Journalist',
    category: 'media',
    description: 'Research, write, and report news stories for print, broadcast, or digital media.',
    baseSalary: 55000,
    careerLevels: [
      {
        title: 'Junior Reporter',
        salary: 40000,
        prestige: 15,
        timeCommitment: 45,
        stressLevel: 40,
        skillRequirements: {
          intelligence: 70,
          creativity: 65,
          charisma: 60,
          technical: 40,
          leadership: 20
        },
        description: 'Entry-level journalist covering local stories and assisting senior reporters.',
        promotionTimeRequired: 18,
        promotionChance: 70
      },
      {
        title: 'Staff Reporter',
        salary: 60000,
        prestige: 30,
        timeCommitment: 50,
        stressLevel: 55,
        skillRequirements: {
          intelligence: 75,
          creativity: 70,
          charisma: 70,
          technical: 50,
          leadership: 40
        },
        description: 'Full-time journalist responsible for regularly researching and producing original stories.',
        promotionTimeRequired: 24,
        promotionChance: 60
      },
      {
        title: 'Senior Reporter',
        salary: 80000,
        prestige: 45,
        timeCommitment: 55,
        stressLevel: 65,
        skillRequirements: {
          intelligence: 80,
          creativity: 80,
          charisma: 80,
          technical: 60,
          leadership: 60
        },
        description: 'Experienced journalist covering major stories and developing special features.',
        promotionTimeRequired: 36,
        promotionChance: 50
      },
      {
        title: 'Editor',
        salary: 100000,
        prestige: 60,
        timeCommitment: 60,
        stressLevel: 70,
        skillRequirements: {
          intelligence: 85,
          creativity: 85,
          charisma: 75,
          technical: 70,
          leadership: 80
        },
        description: 'Manages content development and editing for a section or department.',
        promotionTimeRequired: 48,
        promotionChance: 30
      },
      {
        title: 'Editor-in-Chief',
        salary: 150000,
        prestige: 75,
        timeCommitment: 60,
        stressLevel: 75,
        skillRequirements: {
          intelligence: 90,
          creativity: 90,
          charisma: 85,
          technical: 75,
          leadership: 90
        },
        description: 'Leads the entire editorial operation of a publication or news outlet.',
        promotionTimeRequired: undefined,
        promotionChance: undefined
      }
    ],
    skillGrowth: {
      intelligence: 3,
      creativity: 4,
      charisma: 3
    },
    specialBenefits: ['Access to exclusive events', 'Meeting influential people', 'Potential for public recognition']
  },
  {
    id: 'marketing-executive',
    name: 'Marketing Executive',
    category: 'business',
    description: 'Develop and implement marketing strategies to promote products, services, and brands.',
    baseSalary: 70000,
    careerLevels: [
      {
        title: 'Marketing Coordinator',
        salary: 50000,
        prestige: 15,
        timeCommitment: 40,
        stressLevel: 35,
        skillRequirements: {
          intelligence: 60,
          creativity: 70,
          charisma: 65,
          technical: 50,
          leadership: 30
        },
        description: 'Entry-level position assisting with marketing campaigns and social media.',
        promotionTimeRequired: 18,
        promotionChance: 75
      },
      {
        title: 'Marketing Manager',
        salary: 80000,
        prestige: 30,
        timeCommitment: 45,
        stressLevel: 50,
        skillRequirements: {
          intelligence: 70,
          creativity: 80,
          charisma: 75,
          technical: 60,
          leadership: 60
        },
        description: 'Develops and implements marketing campaigns across various channels.',
        promotionTimeRequired: 24,
        promotionChance: 60
      },
      {
        title: 'Senior Marketing Manager',
        salary: 120000,
        prestige: 45,
        timeCommitment: 50,
        stressLevel: 60,
        skillRequirements: {
          intelligence: 75,
          creativity: 85,
          charisma: 85,
          technical: 70,
          leadership: 75
        },
        description: 'Oversees major marketing initiatives and leads a team of marketers.',
        promotionTimeRequired: 36,
        promotionChance: 50
      },
      {
        title: 'Marketing Director',
        salary: 180000,
        prestige: 60,
        timeCommitment: 55,
        stressLevel: 70,
        skillRequirements: {
          intelligence: 80,
          creativity: 90,
          charisma: 90,
          technical: 75,
          leadership: 85
        },
        description: 'Leads the marketing function and develops brand strategy.',
        promotionTimeRequired: 48,
        promotionChance: 30
      },
      {
        title: 'Chief Marketing Officer',
        salary: 250000,
        prestige: 80,
        timeCommitment: 60,
        stressLevel: 75,
        skillRequirements: {
          intelligence: 85,
          creativity: 95,
          charisma: 95,
          technical: 80,
          leadership: 95
        },
        description: 'Executive responsible for all marketing activities across the organization.',
        promotionTimeRequired: undefined,
        promotionChance: undefined
      }
    ],
    skillGrowth: {
      creativity: 4,
      charisma: 3,
      leadership: 2
    },
    specialBenefits: ['Brand partnerships', 'Creative working environment', 'Industry events and travel']
  },
  {
    id: 'lawyer',
    name: 'Lawyer',
    category: 'legal',
    description: 'Represent and advise clients on legal matters in various fields of law.',
    baseSalary: 100000,
    careerLevels: [
      {
        title: 'Legal Associate',
        salary: 100000,
        prestige: 40,
        timeCommitment: 60,
        stressLevel: 70,
        skillRequirements: {
          intelligence: 85,
          creativity: 60,
          charisma: 70,
          technical: 70,
          leadership: 40
        },
        description: 'Entry-level lawyer working on cases under partner supervision.',
        promotionTimeRequired: 36,
        promotionChance: 60
      },
      {
        title: 'Senior Associate',
        salary: 150000,
        prestige: 50,
        timeCommitment: 65,
        stressLevel: 75,
        skillRequirements: {
          intelligence: 90,
          creativity: 70,
          charisma: 75,
          technical: 80,
          leadership: 60
        },
        description: 'Experienced lawyer handling more complex cases with greater autonomy.',
        promotionTimeRequired: 48,
        promotionChance: 50
      },
      {
        title: 'Junior Partner',
        salary: 250000,
        prestige: 70,
        timeCommitment: 65,
        stressLevel: 80,
        skillRequirements: {
          intelligence: 95,
          creativity: 75,
          charisma: 85,
          technical: 85,
          leadership: 80
        },
        description: 'Partial owner of the firm with increased management responsibilities.',
        promotionTimeRequired: 60,
        promotionChance: 40
      },
      {
        title: 'Senior Partner',
        salary: 400000,
        prestige: 85,
        timeCommitment: 60,
        stressLevel: 75,
        skillRequirements: {
          intelligence: 95,
          creativity: 80,
          charisma: 90,
          technical: 90,
          leadership: 90
        },
        description: 'Senior leadership role with significant equity in the firm.',
        promotionTimeRequired: 84,
        promotionChance: 20
      },
      {
        title: 'Managing Partner',
        salary: 600000,
        prestige: 95,
        timeCommitment: 60,
        stressLevel: 80,
        skillRequirements: {
          intelligence: 95,
          creativity: 85,
          charisma: 95,
          technical: 90,
          leadership: 95
        },
        description: 'Top leadership position overseeing all firm operations and strategic direction.',
        promotionTimeRequired: undefined,
        promotionChance: undefined
      }
    ],
    educationRequired: 'Law Degree',
    skillGrowth: {
      intelligence: 3,
      charisma: 2,
      leadership: 2
    },
    specialBenefits: ['High earning potential', 'Professional prestige', 'Intellectual challenge']
  },
  {
    id: 'civil-servant',
    name: 'Civil Servant',
    category: 'government',
    description: 'Work in public administration to implement policies and provide services to citizens.',
    baseSalary: 60000,
    careerLevels: [
      {
        title: 'Administrative Assistant',
        salary: 45000,
        prestige: 10,
        timeCommitment: 40,
        stressLevel: 30,
        skillRequirements: {
          intelligence: 60,
          creativity: 30,
          charisma: 50,
          technical: 50,
          leadership: 20
        },
        description: 'Entry-level position supporting government departments and officials.',
        promotionTimeRequired: 24,
        promotionChance: 70
      },
      {
        title: 'Policy Analyst',
        salary: 65000,
        prestige: 25,
        timeCommitment: 40,
        stressLevel: 40,
        skillRequirements: {
          intelligence: 75,
          creativity: 50,
          charisma: 60,
          technical: 60,
          leadership: 40
        },
        description: 'Analyzes and develops public policies and programs.',
        promotionTimeRequired: 36,
        promotionChance: 60
      },
      {
        title: 'Department Manager',
        salary: 85000,
        prestige: 40,
        timeCommitment: 45,
        stressLevel: 55,
        skillRequirements: {
          intelligence: 80,
          creativity: 60,
          charisma: 70,
          technical: 70,
          leadership: 70
        },
        description: 'Leads a government department or program area.',
        promotionTimeRequired: 48,
        promotionChance: 50
      },
      {
        title: 'Director',
        salary: 110000,
        prestige: 55,
        timeCommitment: 50,
        stressLevel: 65,
        skillRequirements: {
          intelligence: 85,
          creativity: 70,
          charisma: 80,
          technical: 75,
          leadership: 85
        },
        description: 'Oversees multiple departments and implements strategic initiatives.',
        promotionTimeRequired: 60,
        promotionChance: 30
      },
      {
        title: 'Deputy Minister',
        salary: 180000,
        prestige: 75,
        timeCommitment: 55,
        stressLevel: 75,
        skillRequirements: {
          intelligence: 90,
          creativity: 80,
          charisma: 90,
          technical: 80,
          leadership: 95
        },
        description: 'Top non-political official in a government ministry or department.',
        promotionTimeRequired: undefined,
        promotionChance: undefined
      }
    ],
    skillGrowth: {
      intelligence: 2,
      charisma: 2,
      leadership: 3
    },
    specialBenefits: ['Job security', 'Excellent benefits', 'Public service impact']
  },
  {
    id: 'graphic-designer',
    name: 'Graphic Designer',
    category: 'creative',
    description: 'Create visual concepts, using computer software or by hand, to communicate ideas that inspire, inform, or captivate consumers.',
    baseSalary: 55000,
    careerLevels: [
      {
        title: 'Junior Designer',
        salary: 45000,
        prestige: 10,
        timeCommitment: 40,
        stressLevel: 30,
        skillRequirements: {
          intelligence: 60,
          creativity: 80,
          charisma: 50,
          technical: 70,
          leadership: 20
        },
        description: 'Entry-level position creating basic design elements under supervision.',
        promotionTimeRequired: 18,
        promotionChance: 75
      },
      {
        title: 'Graphic Designer',
        salary: 60000,
        prestige: 20,
        timeCommitment: 40,
        stressLevel: 40,
        skillRequirements: {
          intelligence: 65,
          creativity: 85,
          charisma: 60,
          technical: 80,
          leadership: 30
        },
        description: 'Creates a wide range of visual assets for products, services, or campaigns.',
        promotionTimeRequired: 24,
        promotionChance: 65
      },
      {
        title: 'Senior Designer',
        salary: 80000,
        prestige: 35,
        timeCommitment: 45,
        stressLevel: 50,
        skillRequirements: {
          intelligence: 70,
          creativity: 90,
          charisma: 70,
          technical: 85,
          leadership: 60
        },
        description: 'Leads design projects and mentors junior designers.',
        promotionTimeRequired: 36,
        promotionChance: 50
      },
      {
        title: 'Art Director',
        salary: 110000,
        prestige: 50,
        timeCommitment: 50,
        stressLevel: 60,
        skillRequirements: {
          intelligence: 75,
          creativity: 95,
          charisma: 80,
          technical: 85,
          leadership: 80
        },
        description: 'Oversees design teams and establishes the visual direction of projects.',
        promotionTimeRequired: 48,
        promotionChance: 30
      },
      {
        title: 'Creative Director',
        salary: 150000,
        prestige: 70,
        timeCommitment: 55,
        stressLevel: 70,
        skillRequirements: {
          intelligence: 80,
          creativity: 95,
          charisma: 90,
          technical: 85,
          leadership: 90
        },
        description: 'Top creative position determining the creative vision across all projects.',
        promotionTimeRequired: undefined,
        promotionChance: undefined
      }
    ],
    skillGrowth: {
      creativity: 5,
      technical: 3,
      charisma: 1
    },
    specialBenefits: ['Portfolio development', 'Creative fulfillment', 'Flexible work arrangements']
  },
  {
    id: 'electrician',
    name: 'Electrician',
    category: 'trades',
    description: 'Install, maintain, and repair electrical power, communications, lighting, and control systems.',
    baseSalary: 60000,
    careerLevels: [
      {
        title: 'Apprentice Electrician',
        salary: 35000,
        prestige: 5,
        timeCommitment: 40,
        stressLevel: 30,
        skillRequirements: {
          intelligence: 60,
          creativity: 40,
          charisma: 40,
          technical: 70,
          leadership: 10
        },
        description: 'Training position learning under a licensed electrician.',
        promotionTimeRequired: 36,
        promotionChance: 80
      },
      {
        title: 'Journeyman Electrician',
        salary: 65000,
        prestige: 15,
        timeCommitment: 40,
        stressLevel: 40,
        skillRequirements: {
          intelligence: 70,
          creativity: 50,
          charisma: 50,
          technical: 85,
          leadership: 30
        },
        description: 'Licensed electrician qualified to work independently on most electrical systems.',
        promotionTimeRequired: 48,
        promotionChance: 60
      },
      {
        title: 'Master Electrician',
        salary: 85000,
        prestige: 25,
        timeCommitment: 45,
        stressLevel: 45,
        skillRequirements: {
          intelligence: 75,
          creativity: 60,
          charisma: 60,
          technical: 95,
          leadership: 60
        },
        description: 'Highly skilled electrician qualified to design electrical systems and supervise others.',
        promotionTimeRequired: 60,
        promotionChance: 50
      },
      {
        title: 'Electrical Contractor',
        salary: 120000,
        prestige: 35,
        timeCommitment: 50,
        stressLevel: 60,
        skillRequirements: {
          intelligence: 80,
          creativity: 70,
          charisma: 70,
          technical: 95,
          leadership: 80
        },
        description: 'Runs own electrical contracting business with employees.',
        promotionTimeRequired: 60,
        promotionChance: 30
      },
      {
        title: 'Master Electrical Engineer',
        salary: 150000,
        prestige: 50,
        timeCommitment: 50,
        stressLevel: 55,
        skillRequirements: {
          intelligence: 85,
          creativity: 75,
          charisma: 70,
          technical: 95,
          leadership: 85
        },
        description: 'Top level electrician who designs complex electrical systems and manages large projects.',
        promotionTimeRequired: undefined,
        promotionChance: undefined
      }
    ],
    skillGrowth: {
      technical: 5,
      intelligence: 2,
      creativity: 1
    },
    specialBenefits: ['High job security', 'Independence', 'Entrepreneurial opportunities']
  }
];

// Get a job by ID
export const getJobById = (id: string): Job | undefined => {
  return jobs.find(job => job.id === id);
};

// Get all jobs
export const getAllJobs = (): Job[] => {
  return jobs;
};

// Get jobs by category
export const getJobsByCategory = (category: JobCategory): Job[] => {
  return jobs.filter(job => job.category === category);
};