import { CharacterSkills } from "../stores/useCharacter";

// Define job categories
export type JobCategory =
  | 'technology'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'creative'
  | 'business'
  | 'legal'
  | 'science'
  | 'government'
  | 'trade';

// Define job levels
export type JobLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'executive';

// Define a single position in a career path
export interface CareerPath {
  level: JobLevel;
  title: string;
  salary: number;
  description: string;
  skillRequirements: Partial<CharacterSkills>;
  happinessImpact: number;
  prestigeImpact: number;
  timeCommitment: number; // Hours per week
  experience: number; // Months needed at previous level to be eligible
  healthImpact?: number; // Optional health impact of the job
}

// Define a profession (collection of related jobs forming a career path)
export interface Profession {
  id: string;
  name: string;
  category: JobCategory;
  description: string;
  careerPath: CareerPath[];
}

// List of professions with career paths
export const professions: Profession[] = [
  // Technology Professions
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    category: 'technology',
    description: 'Design, develop, and maintain software applications using various programming languages and frameworks.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior Developer',
        salary: 65000,
        description: 'Write code, fix bugs, and participate in code reviews under senior guidance.',
        skillRequirements: { },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Software Developer',
        salary: 85000,
        description: 'Develop software components independently and collaborate on larger projects.',
        skillRequirements: { technical: 550, intelligence: 600 },
        happinessImpact: 8,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Senior Developer',
        salary: 115000,
        description: 'Lead development of software projects and mentor junior developers.',
        skillRequirements: { technical: 700, intelligence: 700, leadership: 500 },
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 24
      },
      {
        level: 'senior',
        title: 'Lead Developer',
        salary: 145000,
        description: 'Oversee multiple projects, make architectural decisions, and manage development teams.',
        skillRequirements: { technical: 800, intelligence: 750, leadership: 650 },
        happinessImpact: 12,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 36
      },
      {
        level: 'executive',
        title: 'Chief Technology Officer',
        salary: 210000,
        description: 'Define technical vision, strategy, and oversee all technical operations of the company.',
        skillRequirements: { technical: 900, intelligence: 850, leadership: 800 },
        happinessImpact: 15,
        prestigeImpact: 50,
        timeCommitment: 60,
        experience: 48
      }
    ]
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    category: 'technology',
    description: 'Analyze and interpret complex data to help organizations make better decisions.',
    careerPath: [
      {
        level: 'entry',
        title: 'Data Analyst',
        salary: 70000,
        description: 'Collect, clean, and analyze data to support business decisions.',
        skillRequirements: { },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Junior Data Scientist',
        salary: 90000,
        description: 'Develop statistical models and begin working with machine learning algorithms.',
        skillRequirements: { intelligence: 700, technical: 550 },
        happinessImpact: 8,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Data Scientist',
        salary: 120000,
        description: 'Create advanced models and lead data-driven initiatives.',
        skillRequirements: { intelligence: 800, technical: 700 },
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 24
      },
      {
        level: 'senior',
        title: 'Senior Data Scientist',
        salary: 150000,
        description: 'Lead teams, design complex data systems, and drive organizational data strategy.',
        skillRequirements: { intelligence: 850, technical: 800, leadership: 600 },
        happinessImpact: 12,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 36
      },
      {
        level: 'executive',
        title: 'Chief Data Officer',
        salary: 200000,
        description: 'Set data vision, lead data governance, and maximize data value across the organization.',
        skillRequirements: { intelligence: 900, technical: 850, leadership: 800 },
        happinessImpact: 15,
        prestigeImpact: 50,
        timeCommitment: 60,
        experience: 48
      }
    ]
  },
  
  // Finance Professions
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    category: 'finance',
    description: 'Analyze financial data and market trends to guide investment decisions.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior Financial Analyst',
        salary: 65000,
        description: 'Gather financial data, perform basic analysis, and prepare reports.',
        skillRequirements: { },
        happinessImpact: 3,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Financial Analyst',
        salary: 85000,
        description: 'Conduct detailed financial analysis and create financial models.',
        skillRequirements: { intelligence: 650, technical: 500 },
        happinessImpact: 5,
        prestigeImpact: 20,
        timeCommitment: 50,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Senior Financial Analyst',
        salary: 110000,
        description: 'Lead complex financial analyses and provide strategic investment recommendations.',
        skillRequirements: { intelligence: 750, technical: 600, leadership: 400 },
        happinessImpact: 8,
        prestigeImpact: 30,
        timeCommitment: 55,
        experience: 24
      },
      {
        level: 'senior',
        title: 'Investment Manager',
        salary: 150000,
        description: 'Manage portfolios, create investment strategies, and lead analyst teams.',
        skillRequirements: { intelligence: 850, technical: 700, leadership: 600 },
        happinessImpact: 10,
        prestigeImpact: 40,
        timeCommitment: 60,
        experience: 36
      },
      {
        level: 'executive',
        title: 'Chief Investment Officer',
        salary: 200000,
        description: 'Direct all investment activities, develop investment philosophy, and maximize portfolio performance.',
        skillRequirements: { intelligence: 900, technical: 800, leadership: 800 },
        happinessImpact: 12,
        prestigeImpact: 50,
        timeCommitment: 65,
        experience: 48
      }
    ]
  },
  {
    id: 'accountant',
    name: 'Accountant',
    category: 'finance',
    description: 'Prepare and examine financial records, ensuring accuracy and compliance with regulations.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior Accountant',
        salary: 55000,
        description: 'Assist with financial record-keeping, reconciliations, and basic report preparation.',
        skillRequirements: { },
        happinessImpact: 2,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Staff Accountant',
        salary: 70000,
        description: 'Prepare financial statements, handle tax preparations, and ensure regulatory compliance.',
        skillRequirements: { intelligence: 600, technical: 450 },
        happinessImpact: 4,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Senior Accountant',
        salary: 90000,
        description: 'Oversee accounting operations, complex financial analyses, and audit preparations.',
        skillRequirements: { intelligence: 700, technical: 550, leadership: 400 },
        happinessImpact: 6,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 24
      },
      {
        level: 'senior',
        title: 'Accounting Manager',
        salary: 120000,
        description: 'Lead accounting teams, manage financial systems, and provide strategic financial advice.',
        skillRequirements: { intelligence: 800, technical: 650, leadership: 600 },
        happinessImpact: 8,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 36
      },
      {
        level: 'executive',
        title: 'Chief Financial Officer',
        salary: 180000,
        description: 'Direct all financial activities, develop financial strategies, and ensure financial health.',
        skillRequirements: { intelligence: 850, technical: 750, leadership: 800 },
        happinessImpact: 10,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 48
      }
    ]
  },
  
  // Healthcare Professions
  {
    id: 'physician',
    name: 'Physician',
    category: 'healthcare',
    description: 'Diagnose and treat illnesses, injuries, and medical conditions.',
    careerPath: [
      {
        level: 'entry',
        title: 'Medical Resident',
        salary: 60000,
        description: 'Complete supervised medical training after medical school.',
        skillRequirements: { },
        happinessImpact: 2,
        prestigeImpact: 20,
        timeCommitment: 70,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Attending Physician',
        salary: 180000,
        description: 'Provide patient care in hospital or clinical settings.',
        skillRequirements: { intelligence: 800, technical: 700, charisma: 600 },
        happinessImpact: 5,
        prestigeImpact: 40,
        timeCommitment: 60,
        experience: 36
      },
      {
        level: 'mid',
        title: 'Specialist Physician',
        salary: 250000,
        description: 'Provide specialized care in a particular medical field.',
        skillRequirements: { intelligence: 850, technical: 800, charisma: 650 },
        happinessImpact: 8,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Chief of Medicine',
        salary: 300000,
        description: 'Lead medical departments, establish protocols, and oversee patient care.',
        skillRequirements: { intelligence: 900, technical: 850, leadership: 750, charisma: 700 },
        happinessImpact: 10,
        prestigeImpact: 50,
        timeCommitment: 60,
        experience: 60
      },
      {
        level: 'executive',
        title: 'Hospital Medical Director',
        salary: 350000,
        description: 'Direct all medical operations and ensure high-quality healthcare delivery.',
        skillRequirements: { intelligence: 950, technical: 900, leadership: 850, charisma: 750 },
        happinessImpact: 12,
        prestigeImpact: 60,
        timeCommitment: 65,
        experience: 72
      }
    ]
  },
  {
    id: 'nurse',
    name: 'Nurse',
    category: 'healthcare',
    description: 'Provide patient care, administer treatments, and support overall healthcare delivery.',
    careerPath: [
      {
        level: 'entry',
        title: 'Registered Nurse',
        salary: 65000,
        description: 'Provide direct patient care, administer medications, and monitor patient conditions.',
        skillRequirements: { },
        happinessImpact: 8,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Charge Nurse',
        salary: 80000,
        description: 'Coordinate nursing care for a unit, assign tasks, and supervise nursing staff.',
        skillRequirements: { technical: 600, charisma: 650, leadership: 500 },
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Nurse Practitioner',
        salary: 110000,
        description: 'Diagnose and treat patients, prescribe medications, and coordinate care plans.',
        skillRequirements: { technical: 700, charisma: 700, intelligence: 650 },
        happinessImpact: 12,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Nursing Director',
        salary: 130000,
        description: 'Lead nursing departments, develop policies, and ensure quality patient care.',
        skillRequirements: { technical: 750, charisma: 750, leadership: 700, intelligence: 700 },
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Chief Nursing Officer',
        salary: 160000,
        description: 'Direct all nursing operations, develop nursing strategy, and shape healthcare delivery.',
        skillRequirements: { technical: 800, charisma: 800, leadership: 800, intelligence: 750 },
        happinessImpact: 8,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 60
      }
    ]
  },
  
  // Education Professions
  {
    id: 'teacher',
    name: 'Teacher',
    category: 'education',
    description: 'Educate students in various subjects and grade levels.',
    careerPath: [
      {
        level: 'entry',
        title: 'Teacher Assistant',
        salary: 35000,
        description: 'Support lead teachers with classroom activities and student management.',
        skillRequirements: { },
        happinessImpact: 10,
        prestigeImpact: 5,
        timeCommitment: 35,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Teacher',
        salary: 50000,
        description: 'Develop lesson plans, teach students, and assess learning progress.',
        skillRequirements: { charisma: 600, intelligence: 550, creativity: 450 },
        happinessImpact: 12,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 12
      },
      {
        level: 'mid',
        title: 'Senior Teacher',
        salary: 65000,
        description: 'Mentor other teachers, develop curriculum, and take on specialized teaching roles.',
        skillRequirements: { charisma: 700, intelligence: 650, creativity: 550, leadership: 500 },
        happinessImpact: 15,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Department Head',
        salary: 80000,
        description: 'Lead subject departments, coordinate curriculum, and supervise teachers.',
        skillRequirements: { charisma: 750, intelligence: 700, creativity: 600, leadership: 650 },
        happinessImpact: 12,
        prestigeImpact: 30,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'executive',
        title: 'School Principal',
        salary: 110000,
        description: 'Lead school operations, develop educational vision, and oversee all staff.',
        skillRequirements: { charisma: 800, intelligence: 750, leadership: 800 },
        happinessImpact: 10,
        prestigeImpact: 40,
        timeCommitment: 60,
        experience: 60
      }
    ]
  },
  {
    id: 'professor',
    name: 'Professor',
    category: 'education',
    description: 'Conduct research and teach students at the college or university level.',
    careerPath: [
      {
        level: 'entry',
        title: 'Teaching Assistant',
        salary: 40000,
        description: 'Assist professors with courses and begin academic research.',
        skillRequirements: { },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Assistant Professor',
        salary: 75000,
        description: 'Teach courses independently and pursue research projects.',
        skillRequirements: { intelligence: 800, charisma: 600, creativity: 550 },
        happinessImpact: 8,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Associate Professor',
        salary: 95000,
        description: 'Lead courses, conduct significant research, and mentor junior faculty.',
        skillRequirements: { intelligence: 850, charisma: 650, creativity: 700 },
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Full Professor',
        salary: 120000,
        description: 'Lead advanced courses, direct major research initiatives, and shape department direction.',
        skillRequirements: { intelligence: 900, charisma: 700, creativity: 800, leadership: 600 },
        happinessImpact: 12,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 60
      },
      {
        level: 'executive',
        title: 'Department Chair',
        salary: 150000,
        description: 'Lead academic departments, manage faculty, and direct academic programs.',
        skillRequirements: { intelligence: 950, charisma: 750, leadership: 800 },
        happinessImpact: 10,
        prestigeImpact: 50,
        timeCommitment: 65,
        experience: 72
      }
    ]
  },
  
  // Creative Professions
  {
    id: 'graphic-designer',
    name: 'Graphic Designer',
    category: 'creative',
    description: 'Create visual concepts to communicate ideas that inspire and inform consumers.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior Designer',
        salary: 45000,
        description: 'Create basic designs, learn design tools, and assist senior designers.',
        skillRequirements: { },
        happinessImpact: 8,
        prestigeImpact: 5,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Graphic Designer',
        salary: 60000,
        description: 'Develop original designs, work on client projects, and build a portfolio.',
        skillRequirements: { creativity: 650, technical: 500, charisma: 450 },
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Senior Designer',
        salary: 80000,
        description: 'Lead design projects, develop creative strategies, and mentor junior designers.',
        skillRequirements: { creativity: 750, technical: 600, charisma: 550 },
        happinessImpact: 12,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Art Director',
        salary: 100000,
        description: 'Oversee design teams, set creative direction, and ensure brand consistency.',
        skillRequirements: { creativity: 850, technical: 700, leadership: 600, charisma: 650 },
        happinessImpact: 15,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Creative Director',
        salary: 130000,
        description: 'Shape overall creative vision, direct multiple teams, and build client relationships.',
        skillRequirements: { creativity: 900, leadership: 750, charisma: 750 },
        happinessImpact: 18,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 60
      }
    ]
  },
  {
    id: 'writer',
    name: 'Writer',
    category: 'creative',
    description: 'Create written content across various media, including books, articles, scripts, and more.',
    careerPath: [
      {
        level: 'entry',
        title: 'Content Writer',
        salary: 40000,
        description: 'Write web content, blog posts, and basic marketing materials.',
        skillRequirements: { },
        happinessImpact: 7,
        prestigeImpact: 5,
        timeCommitment: 35,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Staff Writer',
        salary: 55000,
        description: 'Write feature articles, longer content pieces, and develop editorial voice.',
        skillRequirements: { creativity: 600, intelligence: 550 },
        happinessImpact: 9,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Senior Writer',
        salary: 70000,
        description: 'Lead content creation, develop content strategies, and mentor junior writers.',
        skillRequirements: { creativity: 700, intelligence: 650, charisma: 500 },
        happinessImpact: 12,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Editor',
        salary: 90000,
        description: 'Direct content development, manage writers, and shape publication voice.',
        skillRequirements: { creativity: 800, intelligence: 750, leadership: 600 },
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Editor-in-Chief',
        salary: 120000,
        description: 'Guide overall editorial direction, manage content operations, and build publication brand.',
        skillRequirements: { creativity: 850, intelligence: 800, leadership: 750, charisma: 700 },
        happinessImpact: 12,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 60
      }
    ]
  },
  
  // Business Professions
  {
    id: 'marketing-specialist',
    name: 'Marketing Specialist',
    category: 'business',
    description: 'Develop and implement marketing strategies to promote products and services.',
    careerPath: [
      {
        level: 'entry',
        title: 'Marketing Coordinator',
        salary: 50000,
        description: 'Assist with marketing campaigns, gather market data, and support marketing initiatives.',
        skillRequirements: { },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Marketing Specialist',
        salary: 65000,
        description: 'Develop marketing materials, manage social media, and analyze campaign performance.',
        skillRequirements: { charisma: 600, creativity: 550, intelligence: 500 },
        happinessImpact: 8,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Marketing Manager',
        salary: 85000,
        description: 'Develop and implement comprehensive marketing strategies and lead marketing initiatives.',
        skillRequirements: { charisma: 700, creativity: 650, intelligence: 600, leadership: 500 },
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Senior Marketing Director',
        salary: 120000,
        description: 'Lead marketing departments, develop brand strategy, and drive market growth.',
        skillRequirements: { charisma: 800, creativity: 750, leadership: 700 },
        happinessImpact: 12,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Chief Marketing Officer',
        salary: 180000,
        description: 'Direct all marketing activities, shape brand vision, and drive corporate growth strategies.',
        skillRequirements: { charisma: 850, creativity: 800, leadership: 800, intelligence: 750 },
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 60
      }
    ]
  },
  {
    id: 'business-consultant',
    name: 'Business Consultant',
    category: 'business',
    description: 'Provide expert advice to help organizations improve performance and efficiency.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior Consultant',
        salary: 65000,
        description: 'Gather data, perform analysis, and support consulting projects.',
        skillRequirements: { },
        happinessImpact: 3,
        prestigeImpact: 15,
        timeCommitment: 50,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Consultant',
        salary: 90000,
        description: 'Work directly with clients, develop recommendations, and lead specific project components.',
        skillRequirements: { intelligence: 700, charisma: 600, technical: 550 },
        happinessImpact: 5,
        prestigeImpact: 25,
        timeCommitment: 55,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Consultant',
        salary: 120000,
        description: 'Manage client relationships, lead project teams, and develop consulting frameworks.',
        skillRequirements: { intelligence: 800, charisma: 700, leadership: 600 },
        happinessImpact: 8,
        prestigeImpact: 35,
        timeCommitment: 60,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Principal Consultant',
        salary: 160000,
        description: 'Lead major consulting engagements, develop new business, and mentor consultant teams.',
        skillRequirements: { intelligence: 850, charisma: 800, leadership: 750 },
        happinessImpact: 10,
        prestigeImpact: 45,
        timeCommitment: 65,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Managing Partner',
        salary: 250000,
        description: 'Lead consulting practice, direct firm strategy, and build high-level client relationships.',
        skillRequirements: { intelligence: 900, charisma: 850, leadership: 850 },
        happinessImpact: 12,
        prestigeImpact: 60,
        timeCommitment: 70,
        experience: 60
      }
    ]
  },
  
  // Legal Professions
  {
    id: 'lawyer',
    name: 'Lawyer',
    category: 'legal',
    description: 'Provide legal advice and representation to individuals, businesses, and organizations.',
    careerPath: [
      {
        level: 'entry',
        title: 'Legal Associate',
        salary: 80000,
        description: 'Conduct legal research, draft documents, and support senior attorneys.',
        skillRequirements: { },
        happinessImpact: 2,
        prestigeImpact: 20,
        timeCommitment: 60,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Attorney',
        salary: 110000,
        description: 'Represent clients, handle cases independently, and develop legal expertise.',
        skillRequirements: { intelligence: 750, charisma: 650 },
        happinessImpact: 5,
        prestigeImpact: 30,
        timeCommitment: 65,
        experience: 36
      },
      {
        level: 'mid',
        title: 'Senior Attorney',
        salary: 150000,
        description: 'Handle complex cases, mentor junior attorneys, and develop client relationships.',
        skillRequirements: { intelligence: 850, charisma: 750, leadership: 600 },
        happinessImpact: 8,
        prestigeImpact: 40,
        timeCommitment: 70,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Partner',
        salary: 250000,
        description: 'Lead legal teams, build practice areas, and develop new business.',
        skillRequirements: { intelligence: 900, charisma: 800, leadership: 750 },
        happinessImpact: 10,
        prestigeImpact: 50,
        timeCommitment: 65,
        experience: 60
      },
      {
        level: 'executive',
        title: 'Managing Partner',
        salary: 400000,
        description: 'Lead law firm, direct firm strategy, and manage high-profile client relationships.',
        skillRequirements: { intelligence: 950, charisma: 850, leadership: 850 },
        happinessImpact: 12,
        prestigeImpact: 60,
        timeCommitment: 70,
        experience: 72
      }
    ]
  },
  
  // Science Professions
  {
    id: 'scientist',
    name: 'Scientist',
    category: 'science',
    description: 'Conduct research to advance knowledge in a specific scientific field.',
    careerPath: [
      {
        level: 'entry',
        title: 'Research Assistant',
        salary: 50000,
        description: 'Support research projects, collect and analyze data, and maintain lab equipment.',
        skillRequirements: { },
        happinessImpact: 8,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Scientist',
        salary: 75000,
        description: 'Conduct independent research, publish findings, and contribute to research teams.',
        skillRequirements: { intelligence: 750, technical: 600 },
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Scientist',
        salary: 95000,
        description: 'Lead research projects, secure funding, and guide research direction.',
        skillRequirements: { intelligence: 850, technical: 700, leadership: 500 },
        happinessImpact: 12,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Principal Scientist',
        salary: 120000,
        description: 'Direct major research initiatives, mentor scientists, and shape field direction.',
        skillRequirements: { intelligence: 900, technical: 800, leadership: 650 },
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Research Director',
        salary: 150000,
        description: 'Lead research organizations, set research agenda, and drive scientific innovation.',
        skillRequirements: { intelligence: 950, technical: 850, leadership: 800 },
        happinessImpact: 18,
        prestigeImpact: 50,
        timeCommitment: 60,
        experience: 60
      }
    ]
  },
  
  // Additional Technology Professions
  {
    id: 'cybersecurity-specialist',
    name: 'Cybersecurity Specialist',
    category: 'technology',
    description: 'Protect computer systems, networks, and data from security breaches and cyber attacks.',
    careerPath: [
      {
        level: 'entry',
        title: 'Security Analyst',
        salary: 70000,
        description: 'Monitor networks for security issues and implement basic security measures.',
        skillRequirements: { },
        happinessImpact: 5,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Security Specialist',
        salary: 90000,
        description: 'Implement security measures and respond to security incidents.',
        skillRequirements: { technical: 650, intelligence: 650 },
        happinessImpact: 7,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Security Engineer',
        salary: 115000,
        description: 'Design and implement robust security systems and lead security audits.',
        skillRequirements: { technical: 750, intelligence: 750 },
        happinessImpact: 9,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 24
      },
      {
        level: 'senior',
        title: 'Security Architect',
        salary: 140000,
        description: 'Design comprehensive security strategies and direct security implementations.',
        skillRequirements: { technical: 850, intelligence: 800, leadership: 650 },
        happinessImpact: 10,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 36
      },
      {
        level: 'executive',
        title: 'Chief Information Security Officer',
        salary: 200000,
        description: 'Lead all security initiatives and ensure organizational security compliance.',
        skillRequirements: { technical: 900, intelligence: 850, leadership: 800 },
        happinessImpact: 12,
        prestigeImpact: 50,
        timeCommitment: 60,
        experience: 48
      }
    ]
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    category: 'technology',
    description: 'Oversee product development, from conception to launch, ensuring market fit and business success.',
    careerPath: [
      {
        level: 'entry',
        title: 'Product Coordinator',
        salary: 65000,
        description: 'Support product teams with research, documentation, and administrative tasks.',
        skillRequirements: { },
        happinessImpact: 6,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Associate Product Manager',
        salary: 85000,
        description: 'Assist in planning and execution of product features and gather user feedback.',
        skillRequirements: { intelligence: 650, charisma: 600, leadership: 500 },
        happinessImpact: 8,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Product Manager',
        salary: 120000,
        description: 'Lead product vision, strategy, and roadmap for specific product areas.',
        skillRequirements: { intelligence: 750, charisma: 700, leadership: 650 },
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 24
      },
      {
        level: 'senior',
        title: 'Senior Product Manager',
        salary: 150000,
        description: 'Define strategic direction for product lines and mentor product teams.',
        skillRequirements: { intelligence: 800, charisma: 750, leadership: 750 },
        happinessImpact: 12,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 36
      },
      {
        level: 'executive',
        title: 'Director of Product',
        salary: 200000,
        description: 'Lead product organization, define product vision, and drive product innovation.',
        skillRequirements: { intelligence: 850, charisma: 800, leadership: 850 },
        happinessImpact: 15,
        prestigeImpact: 50,
        timeCommitment: 60,
        experience: 48
      }
    ]
  },
  
  // Additional Technology Professions
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    category: 'technology',
    description: 'Design user interfaces and create optimal user experiences for websites, applications, and digital products.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior UI/UX Designer',
        salary: 58000,
        description: 'Create basic wireframes and mockups under supervision.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        id: 'ui-ux-designer',
        title: 'UI/UX Designer',
        level: 'mid',
        salary: 78000,
        skillRequirements: { creativity: 300, intelligence: 250 },
        healthImpact: -10,
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 24
      },
      {
        id: 'senior-ui-ux-designer',
        title: 'Senior UI/UX Designer',
        level: 'senior',
        salary: 105000,
        skillRequirements: { creativity: 500, intelligence: 400 },
        healthImpact: -15,
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 48
      },
      {
        id: 'ux-director',
        title: 'UX Director',
        level: 'executive',
        salary: 145000,
        skillRequirements: { creativity: 700, intelligence: 600, charisma: 500 },
        healthImpact: -20,
        happinessImpact: 15,
        prestigeImpact: 50,
        timeCommitment: 60,
        experience: 72
      }
    ]
  },
  
  {
    id: 'network-engineer',
    name: 'Network Engineer',
    category: 'technology',
    description: 'Design, implement, and maintain computer networks, ensuring optimal performance and security.',
    careerPath: [
      {
        id: 'network-technician',
        title: 'Network Technician',
        level: 'entry',
        salary: 55000,
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        id: 'network-administrator',
        title: 'Network Administrator',
        level: 'mid',
        salary: 75000,
        skillRequirements: { intelligence: 300, technical: 300 },
        healthImpact: -10,
        happinessImpact: 5,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 24
      },
      {
        id: 'network-engineer',
        title: 'Network Engineer',
        level: 'senior',
        salary: 98000,
        skillRequirements: { intelligence: 500, technical: 500 },
        healthImpact: -15,
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 48
      },
      {
        id: 'network-architect',
        title: 'Network Architect',
        level: 'executive',
        salary: 130000,
        skillRequirements: { intelligence: 700, technical: 700 },
        healthImpact: -20,
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 72
      }
    ]
  },
  
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    category: 'technology',
    description: 'Bridge development and operations, automating infrastructure and streamlining software delivery processes.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior DevOps Engineer',
        salary: 65000,
        description: 'Assist with automation scripts and basic CI/CD pipeline maintenance.',
        skillRequirements: { },
        healthImpact: -10,
        happinessImpact: 5,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 0
      },
      {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        level: 'mid',
        salary: 92000,
        skillRequirements: { intelligence: 350, technical: 350 },
        healthImpact: -15,
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 24
      },
      {
        id: 'senior-devops-engineer',
        title: 'Senior DevOps Engineer',
        level: 'senior',
        salary: 120000,
        skillRequirements: { intelligence: 550, technical: 550 },
        healthImpact: -20,
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 48
      },
      {
        id: 'devops-architect',
        title: 'DevOps Architect',
        level: 'executive',
        salary: 150000,
        skillRequirements: { intelligence: 750, technical: 750 },
        healthImpact: -25,
        happinessImpact: 15,
        prestigeImpact: 50,
        timeCommitment: 60,
        experience: 72
      }
    ]
  },
  
  {
    id: 'system-administrator',
    name: 'System Administrator',
    category: 'technology',
    description: 'Install, configure, and maintain computer systems and servers to ensure optimal performance.',
    careerPath: [
      {
        id: 'it-support-specialist',
        title: 'IT Support Specialist',
        level: 'entry',
        salary: 48000,
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        id: 'system-administrator',
        title: 'System Administrator',
        level: 'mid',
        salary: 70000,
        skillRequirements: { intelligence: 300, technical: 250 },
        healthImpact: -10,
        happinessImpact: 5,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 24
      },
      {
        id: 'senior-system-administrator',
        title: 'Senior System Administrator',
        level: 'senior',
        salary: 90000,
        skillRequirements: { intelligence: 500, technical: 450 },
        healthImpact: -15,
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 48
      },
      {
        id: 'it-operations-manager',
        title: 'IT Operations Manager',
        level: 'executive',
        salary: 120000,
        skillRequirements: { intelligence: 650, technical: 600, charisma: 400 },
        healthImpact: -20,
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 72
      }
    ]
  },
  
  {
    id: 'database-administrator',
    name: 'Database Administrator',
    category: 'technology',
    description: 'Design, implement, maintain, and optimize database systems to ensure data integrity and performance.',
    careerPath: [
      {
        id: 'database-technician',
        title: 'Database Technician',
        level: 'entry',
        salary: 58000,
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        id: 'database-administrator',
        title: 'Database Administrator',
        level: 'mid',
        salary: 82000,
        skillRequirements: { intelligence: 350, technical: 350 },
        healthImpact: -10,
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 24
      },
      {
        id: 'senior-database-administrator',
        title: 'Senior Database Administrator',
        level: 'senior',
        salary: 105000,
        skillRequirements: { intelligence: 550, technical: 550 },
        healthImpact: -15,
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 48
      },
      {
        id: 'database-architect',
        title: 'Database Architect',
        level: 'executive',
        salary: 135000,
        skillRequirements: { intelligence: 750, technical: 750 },
        healthImpact: -20,
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 72
      }
    ]
  },
  
  {
    id: 'qa-engineer',
    name: 'QA Engineer',
    category: 'technology',
    description: 'Develop and execute test plans to ensure software quality and identify bugs before product release.',
    careerPath: [
      {
        id: 'qa-tester',
        title: 'QA Tester',
        level: 'entry',
        salary: 52000,
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        id: 'qa-engineer',
        title: 'QA Engineer',
        level: 'mid',
        salary: 72000,
        skillRequirements: { intelligence: 250, technical: 300 },
        healthImpact: -10,
        happinessImpact: 5,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 24
      },
      {
        id: 'senior-qa-engineer',
        title: 'Senior QA Engineer',
        level: 'senior',
        salary: 95000,
        skillRequirements: { intelligence: 450, technical: 500 },
        healthImpact: -15,
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 48
      },
      {
        id: 'qa-manager',
        title: 'QA Manager',
        level: 'executive',
        salary: 125000,
        skillRequirements: { intelligence: 600, technical: 650, charisma: 400 },
        healthImpact: -20,
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 72
      }
    ]
  },
  
  // Additional Finance Professions
  {
    id: 'investment-banker',
    name: 'Investment Banker',
    category: 'finance',
    description: 'Raise capital, facilitate mergers and acquisitions, and provide financial advisory services.',
    careerPath: [
      {
        level: 'entry',
        title: 'Investment Banking Analyst',
        salary: 85000,
        description: 'Perform financial analyses, prepare pitch books, and support deal execution.',
        skillRequirements: { intelligence: 70, technical: 60 },
        happinessImpact: 0,
        prestigeImpact: 25,
        timeCommitment: 70,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Investment Banking Associate',
        salary: 150000,
        description: 'Lead analytical work, client interactions, and coordinate deal activities.',
        skillRequirements: { intelligence: 80, technical: 70, charisma: 60 },
        happinessImpact: 2,
        prestigeImpact: 35,
        timeCommitment: 65,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Vice President',
        salary: 250000,
        description: 'Manage client relationships, lead deal teams, and develop new business.',
        skillRequirements: { intelligence: 85, technical: 75, charisma: 75, leadership: 70 },
        happinessImpact: 5,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Director',
        salary: 400000,
        description: 'Lead complex transactions, develop key client relationships, and mentor junior bankers.',
        skillRequirements: { intelligence: 90, technical: 80, charisma: 80, leadership: 80 },
        happinessImpact: 8,
        prestigeImpact: 55,
        timeCommitment: 60,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Managing Director',
        salary: 600000,
        description: 'Lead banking divisions, secure major deals, and drive firm strategy.',
        skillRequirements: { intelligence: 95, technical: 85, charisma: 90, leadership: 90 },
        happinessImpact: 10,
        prestigeImpact: 65,
        timeCommitment: 60,
        experience: 60
      }
    ]
  },
  
  {
    id: 'financial-advisor',
    name: 'Financial Advisor',
    category: 'finance',
    description: 'Provide personalized financial advice to individuals and businesses on investments, insurance, and planning.',
    careerPath: [
      {
        level: 'entry',
        title: 'Financial Services Representative',
        salary: 48000,
        description: 'Assist clients with basic financial products and services.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Financial Advisor',
        salary: 65000,
        description: 'Develop financial plans and recommend investment strategies for clients.',
        skillRequirements: { intelligence: 250, charisma: 300 },
        healthImpact: -10,
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Financial Advisor',
        salary: 90000,
        description: 'Manage a portfolio of high-value clients and complex financial planning cases.',
        skillRequirements: { intelligence: 400, charisma: 450, leadership: 300 },
        healthImpact: -15,
        happinessImpact: 15,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Wealth Manager',
        salary: 130000,
        description: 'Provide comprehensive wealth management services to affluent clients.',
        skillRequirements: { intelligence: 550, charisma: 600, leadership: 450 },
        healthImpact: -15,
        happinessImpact: 20,
        prestigeImpact: 45,
        timeCommitment: 50,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Private Wealth Director',
        salary: 200000,
        description: 'Lead wealth management division and serve ultra-high-net-worth individuals.',
        skillRequirements: { intelligence: 700, charisma: 750, leadership: 650 },
        healthImpact: -20,
        happinessImpact: 25,
        prestigeImpact: 60,
        timeCommitment: 55,
        experience: 96
      }
    ]
  },
  
  {
    id: 'risk-manager',
    name: 'Risk Manager',
    category: 'finance',
    description: 'Identify, analyze, and mitigate financial risks for organizations.',
    careerPath: [
      {
        level: 'entry',
        title: 'Risk Analyst',
        salary: 60000,
        description: 'Collect and analyze data to identify potential financial risks.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Senior Risk Analyst',
        salary: 80000,
        description: 'Evaluate complex risk scenarios and develop mitigation strategies.',
        skillRequirements: { intelligence: 300, technical: 350 },
        healthImpact: -10,
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Risk Manager',
        salary: 110000,
        description: 'Develop and implement comprehensive risk management programs.',
        skillRequirements: { intelligence: 450, technical: 500, leadership: 350 },
        healthImpact: -15,
        happinessImpact: 15,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Senior Risk Manager',
        salary: 150000,
        description: 'Lead risk management teams and integrate risk strategies with business objectives.',
        skillRequirements: { intelligence: 600, technical: 650, leadership: 550 },
        healthImpact: -20,
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Chief Risk Officer',
        salary: 225000,
        description: 'Direct enterprise-wide risk management strategy and policies.',
        skillRequirements: { intelligence: 750, technical: 700, leadership: 800 },
        healthImpact: -25,
        happinessImpact: 20,
        prestigeImpact: 60,
        timeCommitment: 60,
        experience: 96
      }
    ]
  },
  
  {
    id: 'investment-fund-manager',
    name: 'Investment Fund Manager',
    category: 'finance',
    description: 'Manage investment portfolios and funds to generate returns for clients.',
    careerPath: [
      {
        level: 'entry',
        title: 'Investment Analyst',
        salary: 70000,
        description: 'Research investment opportunities and provide recommendations.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Portfolio Analyst',
        salary: 90000,
        description: 'Analyze portfolio performance and assist in investment decision-making.',
        skillRequirements: { intelligence: 350, technical: 300 },
        healthImpact: -10,
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Portfolio Manager',
        salary: 130000,
        description: 'Manage investment portfolios and make buy/sell decisions.',
        skillRequirements: { intelligence: 500, technical: 450, leadership: 300 },
        healthImpact: -15,
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Senior Fund Manager',
        salary: 200000,
        description: 'Manage large investment funds and develop investment strategies.',
        skillRequirements: { intelligence: 650, technical: 600, leadership: 500 },
        healthImpact: -20,
        happinessImpact: 20,
        prestigeImpact: 55,
        timeCommitment: 60,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Chief Investment Officer',
        salary: 350000,
        description: 'Direct overall investment strategy and oversee all fund management activities.',
        skillRequirements: { intelligence: 800, technical: 750, leadership: 700 },
        healthImpact: -25,
        happinessImpact: 25,
        prestigeImpact: 70,
        timeCommitment: 65,
        experience: 96
      }
    ]
  },
  
  {
    id: 'insurance-actuary',
    name: 'Insurance Actuary',
    category: 'finance',
    description: 'Analyze statistical data to calculate insurance risks and premiums.',
    careerPath: [
      {
        level: 'entry',
        title: 'Actuarial Analyst',
        salary: 65000,
        description: 'Gather and analyze data to support actuarial calculations.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Associate Actuary',
        salary: 85000,
        description: 'Perform actuarial analyses and assist in developing pricing models.',
        skillRequirements: { intelligence: 350, technical: 400 },
        healthImpact: -10,
        happinessImpact: 5,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'mid',
        title: 'Actuary',
        salary: 120000,
        description: 'Design insurance products and develop risk assessment models.',
        skillRequirements: { intelligence: 550, technical: 600 },
        healthImpact: -15,
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 45,
        experience: 60
      },
      {
        level: 'senior',
        title: 'Senior Actuary',
        salary: 160000,
        description: 'Lead actuarial teams and oversee complex risk modeling projects.',
        skillRequirements: { intelligence: 700, technical: 750, leadership: 400 },
        healthImpact: -15,
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 50,
        experience: 84
      },
      {
        level: 'executive',
        title: 'Chief Actuary',
        salary: 220000,
        description: 'Direct all actuarial functions and develop long-term risk strategies.',
        skillRequirements: { intelligence: 850, technical: 900, leadership: 600 },
        healthImpact: -20,
        happinessImpact: 20,
        prestigeImpact: 55,
        timeCommitment: 55,
        experience: 108
      }
    ]
  },
  
  {
    id: 'financial-controller',
    name: 'Financial Controller',
    category: 'finance',
    description: 'Oversee accounting operations and financial reporting for organizations.',
    careerPath: [
      {
        level: 'entry',
        title: 'Staff Accountant',
        salary: 55000,
        description: 'Perform accounting tasks and assist with financial reporting.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Senior Accountant',
        salary: 70000,
        description: 'Manage accounting processes and prepare financial statements.',
        skillRequirements: { intelligence: 250, technical: 300 },
        healthImpact: -10,
        happinessImpact: 5,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Accounting Manager',
        salary: 90000,
        description: 'Supervise accounting staff and ensure accurate financial reporting.',
        skillRequirements: { intelligence: 400, technical: 450, leadership: 350 },
        healthImpact: -15,
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Financial Controller',
        salary: 120000,
        description: 'Direct all accounting operations and financial control systems.',
        skillRequirements: { intelligence: 550, technical: 600, leadership: 500 },
        healthImpact: -20,
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Chief Financial Officer',
        salary: 200000,
        description: 'Lead all financial strategy, planning, and operations.',
        skillRequirements: { intelligence: 700, technical: 650, leadership: 750 },
        healthImpact: -25,
        happinessImpact: 20,
        prestigeImpact: 60,
        timeCommitment: 60,
        experience: 96
      }
    ]
  },
  
  {
    id: 'trader',
    name: 'Trader',
    category: 'finance',
    description: 'Execute securities trades in financial markets to generate profits.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior Trader',
        salary: 75000,
        description: 'Execute basic trades under supervision and assist senior traders.',
        skillRequirements: { },
        healthImpact: -10,
        happinessImpact: 5,
        prestigeImpact: 20,
        timeCommitment: 50,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Trader',
        salary: 100000,
        description: 'Execute trades independently and develop trading strategies.',
        skillRequirements: { intelligence: 350, technical: 300 },
        healthImpact: -15,
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 55,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Trader',
        salary: 150000,
        description: 'Trade larger positions and mentor junior traders.',
        skillRequirements: { intelligence: 500, technical: 450 },
        healthImpact: -20,
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 60,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Principal Trader',
        salary: 250000,
        description: 'Manage a trading desk and develop advanced trading strategies.',
        skillRequirements: { intelligence: 650, technical: 600, leadership: 450 },
        healthImpact: -25,
        happinessImpact: 20,
        prestigeImpact: 50,
        timeCommitment: 65,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Head of Trading',
        salary: 400000,
        description: 'Lead all trading operations and set trading strategies.',
        skillRequirements: { intelligence: 800, technical: 750, leadership: 700 },
        healthImpact: -30,
        happinessImpact: 25,
        prestigeImpact: 65,
        timeCommitment: 70,
        experience: 96
      }
    ]
  },
  
  // Additional Healthcare Professions
  {
    id: 'pharmacist',
    name: 'Pharmacist',
    category: 'healthcare',
    description: 'Dispense medications, advise on proper use, and monitor patient health and progress.',
    careerPath: [
      {
        level: 'entry',
        title: 'Staff Pharmacist',
        salary: 110000,
        description: 'Dispense prescriptions, advise patients, and ensure medication safety.',
        skillRequirements: { intelligence: 75, technical: 65 },
        happinessImpact: 7,
        prestigeImpact: 25,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Clinical Pharmacist',
        salary: 125000,
        description: 'Provide specialized clinical services and collaborate with healthcare teams.',
        skillRequirements: { intelligence: 80, technical: 70, charisma: 60 },
        happinessImpact: 9,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Pharmacy Manager',
        salary: 140000,
        description: 'Oversee pharmacy operations, supervise staff, and ensure regulatory compliance.',
        skillRequirements: { intelligence: 80, technical: 75, leadership: 65 },
        happinessImpact: 8,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Director of Pharmacy',
        salary: 160000,
        description: 'Lead pharmacy departments, develop protocols, and manage pharmacy budgets.',
        skillRequirements: { intelligence: 85, technical: 80, leadership: 75 },
        happinessImpact: 10,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Chief Pharmacy Officer',
        salary: 180000,
        description: 'Direct pharmacy strategy, ensure optimal medication use, and lead pharmaceutical initiatives.',
        skillRequirements: { intelligence: 90, technical: 85, leadership: 80 },
        happinessImpact: 12,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 60
      }
    ]
  },
  
  {
    id: 'dentist',
    name: 'Dentist',
    category: 'healthcare',
    description: 'Diagnose and treat dental issues, perform procedures, and promote oral health.',
    careerPath: [
      {
        level: 'entry',
        title: 'Associate Dentist',
        salary: 120000,
        description: 'Provide dental care in an established practice under senior dentist supervision.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 0
      },
      {
        level: 'junior',
        title: 'General Dentist',
        salary: 150000,
        description: 'Independently diagnose and treat a wide range of dental conditions.',
        skillRequirements: { intelligence: 350, technical: 400, charisma: 250 },
        healthImpact: -10,
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Dentist',
        salary: 180000,
        description: 'Lead complex procedures and mentor junior dentists.',
        skillRequirements: { intelligence: 500, technical: 550, charisma: 350 },
        healthImpact: -15,
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Dental Specialist',
        salary: 250000,
        description: 'Specialize in advanced dental care such as orthodontics, oral surgery, or endodontics.',
        skillRequirements: { intelligence: 650, technical: 700, charisma: 400 },
        healthImpact: -20,
        happinessImpact: 20,
        prestigeImpact: 50,
        timeCommitment: 55,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Dental Practice Owner',
        salary: 350000,
        description: 'Own and manage a large dental practice or group of practices.',
        skillRequirements: { intelligence: 750, technical: 800, leadership: 600, charisma: 500 },
        healthImpact: -25,
        happinessImpact: 25,
        prestigeImpact: 60,
        timeCommitment: 60,
        experience: 96
      }
    ]
  },
  
  {
    id: 'physical-therapist',
    name: 'Physical Therapist',
    category: 'healthcare',
    description: 'Help patients improve movement, manage pain, and recover physical function.',
    careerPath: [
      {
        level: 'entry',
        title: 'Physical Therapist',
        salary: 75000,
        description: 'Evaluate patients and develop therapeutic exercise programs.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Senior Physical Therapist',
        salary: 90000,
        description: 'Specialize in specific treatment areas and mentor entry-level therapists.',
        skillRequirements: { intelligence: 250, technical: 300, charisma: 300, physical: 350 },
        healthImpact: -10,
        happinessImpact: 15,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Lead Physical Therapist',
        salary: 105000,
        description: 'Oversee therapy programs and coordinate patient care with other healthcare providers.',
        skillRequirements: { intelligence: 350, technical: 400, charisma: 400, physical: 450, leadership: 300 },
        healthImpact: -15,
        happinessImpact: 20,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Rehabilitation Director',
        salary: 120000,
        description: 'Manage physical therapy departments and develop treatment protocols.',
        skillRequirements: { intelligence: 450, technical: 500, charisma: 500, physical: 550, leadership: 450 },
        healthImpact: -20,
        happinessImpact: 25,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Rehabilitation Services Executive',
        salary: 150000,
        description: 'Lead rehabilitation services across multiple facilities or healthcare systems.',
        skillRequirements: { intelligence: 550, technical: 600, charisma: 600, physical: 650, leadership: 600 },
        healthImpact: -25,
        happinessImpact: 30,
        prestigeImpact: 55,
        timeCommitment: 60,
        experience: 96
      }
    ]
  },
  
  {
    id: 'medical-technologist',
    name: 'Medical Technologist',
    category: 'healthcare',
    description: 'Perform laboratory tests to detect, diagnose, and treat diseases.',
    careerPath: [
      {
        level: 'entry',
        title: 'Medical Laboratory Technician',
        salary: 50000,
        description: 'Perform routine laboratory tests under supervision.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Medical Technologist',
        salary: 65000,
        description: 'Independently perform and analyze complex laboratory tests.',
        skillRequirements: { intelligence: 300, technical: 350 },
        healthImpact: -10,
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 40,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Lead Medical Technologist',
        salary: 80000,
        description: 'Supervise laboratory operations and specialized testing procedures.',
        skillRequirements: { intelligence: 450, technical: 500, leadership: 300 },
        healthImpact: -15,
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Laboratory Manager',
        salary: 95000,
        description: 'Manage laboratory staff, budget, and quality assurance programs.',
        skillRequirements: { intelligence: 600, technical: 650, leadership: 500 },
        healthImpact: -20,
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 50,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Laboratory Director',
        salary: 120000,
        description: 'Direct all laboratory operations and develop strategic plans.',
        skillRequirements: { intelligence: 750, technical: 800, leadership: 700 },
        healthImpact: -25,
        happinessImpact: 20,
        prestigeImpact: 50,
        timeCommitment: 55,
        experience: 96
      }
    ]
  },
  
  {
    id: 'psychologist',
    name: 'Psychologist',
    category: 'healthcare',
    description: 'Assess, diagnose, and treat mental, emotional, and behavioral disorders.',
    careerPath: [
      {
        level: 'entry',
        title: 'Psychological Assistant',
        salary: 60000,
        description: 'Provide psychological services under licensed psychologist supervision.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Licensed Psychologist',
        salary: 80000,
        description: 'Independently diagnose and treat psychological disorders.',
        skillRequirements: { intelligence: 400, charisma: 450 },
        healthImpact: -10,
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'mid',
        title: 'Senior Psychologist',
        salary: 100000,
        description: 'Specialize in specific psychological areas and supervise junior psychologists.',
        skillRequirements: { intelligence: 550, charisma: 600, leadership: 350 },
        healthImpact: -15,
        happinessImpact: 15,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 60
      },
      {
        level: 'senior',
        title: 'Psychology Director',
        salary: 120000,
        description: 'Lead psychology departments and develop treatment programs.',
        skillRequirements: { intelligence: 700, charisma: 750, leadership: 550 },
        healthImpact: -20,
        happinessImpact: 20,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 84
      },
      {
        level: 'executive',
        title: 'Chief Psychologist',
        salary: 150000,
        description: 'Direct psychological services across healthcare systems and influence policy.',
        skillRequirements: { intelligence: 850, charisma: 900, leadership: 750 },
        healthImpact: -25,
        happinessImpact: 25,
        prestigeImpact: 55,
        timeCommitment: 60,
        experience: 108
      }
    ]
  },
  
  {
    id: 'nutritionist',
    name: 'Nutritionist',
    category: 'healthcare',
    description: 'Advise on nutrition and develop dietary plans to promote health and manage disease.',
    careerPath: [
      {
        level: 'entry',
        title: 'Nutrition Assistant',
        salary: 45000,
        description: 'Support registered dietitians and help implement nutrition programs.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 10,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Registered Dietitian',
        salary: 60000,
        description: 'Assess nutritional needs and develop personalized dietary plans.',
        skillRequirements: { intelligence: 250, charisma: 300 },
        healthImpact: -5,
        happinessImpact: 15,
        prestigeImpact: 20,
        timeCommitment: 40,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Clinical Dietitian',
        salary: 75000,
        description: 'Specialize in medical nutrition therapy for complex health conditions.',
        skillRequirements: { intelligence: 400, charisma: 450, technical: 350 },
        healthImpact: -10,
        happinessImpact: 20,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Nutrition Services Manager',
        salary: 90000,
        description: 'Manage nutrition departments and develop institutional dietary programs.',
        skillRequirements: { intelligence: 550, charisma: 600, technical: 500, leadership: 450 },
        healthImpact: -15,
        happinessImpact: 20,
        prestigeImpact: 40,
        timeCommitment: 50,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Nutrition Director',
        salary: 110000,
        description: 'Lead nutrition strategy across healthcare systems and influence public health policy.',
        skillRequirements: { intelligence: 700, charisma: 750, technical: 650, leadership: 600 },
        healthImpact: -20,
        happinessImpact: 25,
        prestigeImpact: 50,
        timeCommitment: 55,
        experience: 96
      }
    ]
  },
  
  {
    id: 'healthcare-administrator',
    name: 'Healthcare Administrator',
    category: 'healthcare',
    description: 'Plan, direct, and coordinate medical and health services in facilities or specific departments.',
    careerPath: [
      {
        level: 'entry',
        title: 'Administrative Assistant',
        salary: 50000,
        description: 'Support healthcare management and perform administrative tasks.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Department Coordinator',
        salary: 70000,
        description: 'Oversee daily operations of a specific healthcare department.',
        skillRequirements: { intelligence: 250, leadership: 300, charisma: 250 },
        healthImpact: -10,
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Department Manager',
        salary: 90000,
        description: 'Manage staff, budget, and operations of a healthcare department.',
        skillRequirements: { intelligence: 400, leadership: 450, charisma: 350, technical: 300 },
        healthImpact: -15,
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Healthcare Director',
        salary: 120000,
        description: 'Direct multiple departments or a small healthcare facility.',
        skillRequirements: { intelligence: 550, leadership: 600, charisma: 500, technical: 450 },
        healthImpact: -20,
        happinessImpact: 20,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Hospital CEO',
        salary: 200000,
        description: 'Lead all aspects of a hospital or healthcare system.',
        skillRequirements: { intelligence: 700, leadership: 800, charisma: 700, technical: 600 },
        healthImpact: -25,
        happinessImpact: 25,
        prestigeImpact: 60,
        timeCommitment: 60,
        experience: 96
      }
    ]
  },
  
  {
    id: 'medical-researcher',
    name: 'Medical Researcher',
    category: 'healthcare',
    description: 'Conduct research to advance medical knowledge and develop new treatments.',
    careerPath: [
      {
        level: 'entry',
        title: 'Research Assistant',
        salary: 55000,
        description: 'Support research projects by collecting and analyzing data.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 5,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Research Associate',
        salary: 75000,
        description: 'Design and conduct research studies under supervision.',
        skillRequirements: { intelligence: 400, technical: 350 },
        healthImpact: -10,
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'mid',
        title: 'Senior Researcher',
        salary: 95000,
        description: 'Lead research projects and publish findings in scientific journals.',
        skillRequirements: { intelligence: 600, technical: 550 },
        healthImpact: -15,
        happinessImpact: 15,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 60
      },
      {
        level: 'senior',
        title: 'Principal Investigator',
        salary: 120000,
        description: 'Direct major research initiatives and secure funding grants.',
        skillRequirements: { intelligence: 750, technical: 700, leadership: 500, charisma: 450 },
        healthImpact: -20,
        happinessImpact: 20,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 84
      },
      {
        level: 'executive',
        title: 'Research Director',
        salary: 160000,
        description: 'Lead research institutions and shape research priorities.',
        skillRequirements: { intelligence: 900, technical: 850, leadership: 700, charisma: 600 },
        healthImpact: -25,
        happinessImpact: 25,
        prestigeImpact: 55,
        timeCommitment: 60,
        experience: 108
      }
    ]
  },
  
  // Additional Education Professions
  {
    id: 'education-administrator',
    name: 'Education Administrator',
    category: 'education',
    description: 'Manage educational institutions, develop academic policies, and oversee faculty and staff.',
    careerPath: [
      {
        level: 'entry',
        title: 'Administrative Assistant',
        salary: 45000,
        description: 'Support administrative functions in educational institutions.',
        skillRequirements: { intelligence: 50, leadership: 40, charisma: 50 },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Program Coordinator',
        salary: 60000,
        description: 'Coordinate educational programs, schedules, and student services.',
        skillRequirements: { intelligence: 60, leadership: 50, charisma: 60 },
        happinessImpact: 7,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Assistant Principal',
        salary: 85000,
        description: 'Assist in school leadership, discipline management, and teacher supervision.',
        skillRequirements: { intelligence: 70, leadership: 65, charisma: 65 },
        happinessImpact: 8,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Principal',
        salary: 110000,
        description: 'Lead school operations, develop educational vision, and oversee all staff.',
        skillRequirements: { intelligence: 75, leadership: 80, charisma: 70 },
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Superintendent',
        salary: 160000,
        description: 'Direct school district operations, shape educational policy, and manage district resources.',
        skillRequirements: { intelligence: 80, leadership: 90, charisma: 80 },
        happinessImpact: 12,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 60
      }
    ]
  },
  
  {
    id: 'counselor',
    name: 'School Counselor',
    category: 'education',
    description: 'Guide students through academic, personal, and career development challenges.',
    careerPath: [
      {
        level: 'entry',
        title: 'School Counselor Assistant',
        salary: 42000,
        description: 'Support counseling programs and assist with student guidance activities.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'School Counselor',
        salary: 55000,
        description: 'Provide academic, career, and personal counseling to students.',
        skillRequirements: { intelligence: 300, charisma: 350 },
        healthImpact: -10,
        happinessImpact: 15,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Lead School Counselor',
        salary: 70000,
        description: 'Develop counseling programs and coordinate counseling teams.',
        skillRequirements: { intelligence: 450, charisma: 500, leadership: 300 },
        healthImpact: -15,
        happinessImpact: 20,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Counseling Department Head',
        salary: 85000,
        description: 'Lead counseling departments and develop district-wide counseling strategies.',
        skillRequirements: { intelligence: 600, charisma: 650, leadership: 450 },
        healthImpact: -15,
        happinessImpact: 25,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Director of Student Services',
        salary: 110000,
        description: 'Oversee all student support services across multiple schools or districts.',
        skillRequirements: { intelligence: 750, charisma: 800, leadership: 600 },
        healthImpact: -20,
        happinessImpact: 30,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 96
      }
    ]
  },
  
  {
    id: 'librarian',
    name: 'Librarian',
    category: 'education',
    description: 'Manage library resources, support research, and promote information literacy.',
    careerPath: [
      {
        level: 'entry',
        title: 'Library Assistant',
        salary: 35000,
        description: 'Assist with circulation, shelving, and basic library services.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 10,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Librarian',
        salary: 50000,
        description: 'Manage collections, provide research assistance, and develop library programs.',
        skillRequirements: { intelligence: 350, technical: 250 },
        healthImpact: -5,
        happinessImpact: 15,
        prestigeImpact: 20,
        timeCommitment: 40,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Librarian',
        salary: 65000,
        description: 'Lead specialized library departments and develop digital resources.',
        skillRequirements: { intelligence: 500, technical: 400, leadership: 300 },
        healthImpact: -10,
        happinessImpact: 20,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Head Librarian',
        salary: 80000,
        description: 'Manage entire libraries and develop strategic information services.',
        skillRequirements: { intelligence: 650, technical: 550, leadership: 450 },
        healthImpact: -15,
        happinessImpact: 20,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Library Director',
        salary: 100000,
        description: 'Direct library systems across institutions or districts.',
        skillRequirements: { intelligence: 800, technical: 650, leadership: 600 },
        healthImpact: -15,
        happinessImpact: 25,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 96
      }
    ]
  },
  
  {
    id: 'special-education-teacher',
    name: 'Special Education Teacher',
    category: 'education',
    description: 'Educate students with diverse learning needs and develop individualized education programs.',
    careerPath: [
      {
        level: 'entry',
        title: 'Special Education Aide',
        salary: 32000,
        description: 'Support special education teachers and assist students with disabilities.',
        skillRequirements: { },
        healthImpact: -10,
        happinessImpact: 15,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Special Education Teacher',
        salary: 48000,
        description: 'Develop and implement individualized education plans for students with special needs.',
        skillRequirements: { intelligence: 300, charisma: 350, creativity: 300 },
        healthImpact: -15,
        happinessImpact: 20,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Lead Special Education Teacher',
        salary: 60000,
        description: 'Coordinate special education programs and mentor other teachers.',
        skillRequirements: { intelligence: 450, charisma: 500, creativity: 450, leadership: 350 },
        healthImpact: -20,
        happinessImpact: 25,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Special Education Coordinator',
        salary: 75000,
        description: 'Develop special education curricula and oversee program implementation.',
        skillRequirements: { intelligence: 600, charisma: 650, creativity: 550, leadership: 500 },
        healthImpact: -25,
        happinessImpact: 30,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Director of Special Education',
        salary: 95000,
        description: 'Lead special education services across schools or districts.',
        skillRequirements: { intelligence: 750, charisma: 800, creativity: 650, leadership: 650 },
        healthImpact: -30,
        happinessImpact: 35,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 96
      }
    ]
  },
  
  {
    id: 'curriculum-developer',
    name: 'Curriculum Developer',
    category: 'education',
    description: 'Design and improve educational curricula, instructional materials, and assessment methods.',
    careerPath: [
      {
        level: 'entry',
        title: 'Curriculum Assistant',
        salary: 45000,
        description: 'Support curriculum development and help create educational materials.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Curriculum Specialist',
        salary: 60000,
        description: 'Develop subject-specific curricula and assessment tools.',
        skillRequirements: { intelligence: 350, creativity: 400 },
        healthImpact: -10,
        happinessImpact: 15,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'mid',
        title: 'Senior Curriculum Developer',
        salary: 75000,
        description: 'Lead curriculum projects and integrate educational technologies.',
        skillRequirements: { intelligence: 500, creativity: 550, technical: 400 },
        healthImpact: -15,
        happinessImpact: 20,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 60
      },
      {
        level: 'senior',
        title: 'Curriculum Director',
        salary: 90000,
        description: 'Oversee curriculum development across multiple subject areas or grade levels.',
        skillRequirements: { intelligence: 650, creativity: 700, technical: 500, leadership: 450 },
        healthImpact: -20,
        happinessImpact: 25,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 84
      },
      {
        level: 'executive',
        title: 'Chief Academic Officer',
        salary: 120000,
        description: 'Shape educational vision and curriculum strategy across entire institutions.',
        skillRequirements: { intelligence: 800, creativity: 850, technical: 600, leadership: 700 },
        healthImpact: -25,
        happinessImpact: 30,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 108
      }
    ]
  },
  
  {
    id: 'education-researcher',
    name: 'Education Researcher',
    category: 'education',
    description: 'Conduct research to advance educational theory, practice, and policy.',
    careerPath: [
      {
        level: 'entry',
        title: 'Research Assistant',
        salary: 40000,
        description: 'Support education research projects by collecting and analyzing data.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Education Researcher',
        salary: 55000,
        description: 'Design and conduct research studies on educational practices.',
        skillRequirements: { intelligence: 400, technical: 350 },
        healthImpact: -10,
        happinessImpact: 15,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'mid',
        title: 'Senior Researcher',
        salary: 70000,
        description: 'Lead research projects and publish findings in academic journals.',
        skillRequirements: { intelligence: 550, technical: 500 },
        healthImpact: -15,
        happinessImpact: 20,
        prestigeImpact: 35,
        timeCommitment: 45,
        experience: 60
      },
      {
        level: 'senior',
        title: 'Principal Investigator',
        salary: 90000,
        description: 'Direct major research initiatives and secure research grants.',
        skillRequirements: { intelligence: 700, technical: 650, leadership: 500 },
        healthImpact: -20,
        happinessImpact: 25,
        prestigeImpact: 45,
        timeCommitment: 50,
        experience: 84
      },
      {
        level: 'executive',
        title: 'Research Director',
        salary: 120000,
        description: 'Lead educational research institutions and shape research priorities.',
        skillRequirements: { intelligence: 850, technical: 750, leadership: 650 },
        healthImpact: -25,
        happinessImpact: 30,
        prestigeImpact: 55,
        timeCommitment: 55,
        experience: 108
      }
    ]
  },
  
  {
    id: 'educational-technology-specialist',
    name: 'Educational Technology Specialist',
    category: 'education',
    description: 'Integrate technology into educational environments to enhance teaching and learning.',
    careerPath: [
      {
        level: 'entry',
        title: 'EdTech Support Specialist',
        salary: 45000,
        description: 'Provide technical support for educational technology tools and platforms.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Educational Technology Specialist',
        salary: 60000,
        description: 'Implement educational technology solutions and train educators.',
        skillRequirements: { technical: 350, intelligence: 300, charisma: 250 },
        healthImpact: -10,
        happinessImpact: 15,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior EdTech Specialist',
        salary: 75000,
        description: 'Develop educational technology strategies and lead implementation projects.',
        skillRequirements: { technical: 500, intelligence: 450, charisma: 350, leadership: 300 },
        healthImpact: -15,
        happinessImpact: 20,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'senior',
        title: 'EdTech Coordinator',
        salary: 90000,
        description: 'Oversee educational technology integration across schools or departments.',
        skillRequirements: { technical: 650, intelligence: 600, charisma: 450, leadership: 500 },
        healthImpact: -20,
        happinessImpact: 25,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Chief Technology Officer (Education)',
        salary: 120000,
        description: 'Direct educational technology vision and strategy across institutions.',
        skillRequirements: { technical: 800, intelligence: 750, charisma: 550, leadership: 700 },
        healthImpact: -25,
        happinessImpact: 30,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 96
      }
    ]
  },
  
  {
    id: 'instructional-designer',
    name: 'Instructional Designer',
    category: 'education',
    description: 'Create effective learning experiences, materials, and programs for various educational settings.',
    careerPath: [
      {
        level: 'entry',
        title: 'Instructional Design Assistant',
        salary: 42000,
        description: 'Support the development of instructional materials and learning activities.',
        skillRequirements: { },
        healthImpact: -5,
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Instructional Designer',
        salary: 58000,
        description: 'Design learning experiences and develop instructional materials.',
        skillRequirements: { creativity: 350, intelligence: 300, technical: 250 },
        healthImpact: -10,
        happinessImpact: 15,
        prestigeImpact: 20,
        timeCommitment: 40,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Instructional Designer',
        salary: 72000,
        description: 'Lead instructional design projects and develop innovative learning approaches.',
        skillRequirements: { creativity: 500, intelligence: 450, technical: 400 },
        healthImpact: -15,
        happinessImpact: 20,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Instructional Design Manager',
        salary: 85000,
        description: 'Oversee instructional design teams and develop learning strategies.',
        skillRequirements: { creativity: 650, intelligence: 600, technical: 550, leadership: 500 },
        healthImpact: -20,
        happinessImpact: 25,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Director of Learning Design',
        salary: 105000,
        description: 'Shape instructional vision and learning strategies across organizations.',
        skillRequirements: { creativity: 800, intelligence: 750, technical: 650, leadership: 700 },
        healthImpact: -25,
        happinessImpact: 30,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 96
      }
    ]
  },
  
  // Additional Creative Professions
  {
    id: 'film-director',
    name: 'Film Director',
    category: 'creative',
    description: 'Direct and oversee the creative aspects of film production, from concept to final cut.',
    careerPath: [
      {
        level: 'entry',
        title: 'Production Assistant',
        salary: 35000,
        description: 'Support film production with various tasks on and off set.',
        skillRequirements: { creativity: 55, charisma: 50 },
        happinessImpact: 6,
        prestigeImpact: 10,
        timeCommitment: 50,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Assistant Director',
        salary: 60000,
        description: 'Coordinate on-set activities, manage production schedule, and assist director.',
        skillRequirements: { creativity: 65, charisma: 60, leadership: 50 },
        happinessImpact: 8,
        prestigeImpact: 20,
        timeCommitment: 55,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Independent Director',
        salary: 90000,
        description: 'Direct small-budget films, shorts, or commercials independently.',
        skillRequirements: { creativity: 75, charisma: 70, leadership: 65 },
        happinessImpact: 12,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Feature Film Director',
        salary: 150000,
        description: 'Direct major films with larger budgets and established production companies.',
        skillRequirements: { creativity: 85, charisma: 80, leadership: 75 },
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Award-Winning Director',
        salary: 300000,
        description: 'Direct high-profile films, win industry recognition, and shape cinematic trends.',
        skillRequirements: { creativity: 95, charisma: 85, leadership: 85 },
        happinessImpact: 18,
        prestigeImpact: 60,
        timeCommitment: 65,
        experience: 60
      }
    ]
  },
  
  {
    id: 'ux-designer',
    name: 'UX Designer',
    category: 'creative',
    description: 'Design intuitive, user-centered digital experiences and interfaces.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior UX Designer',
        salary: 45000,
        description: 'Assist with user research and create wireframes under supervision.',
        skillRequirements: { },
        happinessImpact: 10,
        prestigeImpact: 10,
        timeCommitment: 40,
        healthImpact: -5,
        experience: 0
      },
      {
        level: 'junior',
        title: 'UX Designer',
        salary: 65000,
        description: 'Design user flows, conduct usability testing, and create prototypes.',
        skillRequirements: { creativity: 500, technical: 450, intelligence: 400 },
        happinessImpact: 12,
        prestigeImpact: 20,
        timeCommitment: 45,
        healthImpact: -10,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior UX Designer',
        salary: 85000,
        description: 'Lead UX projects, mentor junior designers, and define interaction patterns.',
        skillRequirements: { creativity: 650, technical: 600, intelligence: 550, leadership: 350 },
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 50,
        healthImpact: -15,
        experience: 48
      },
      {
        level: 'senior',
        title: 'UX Lead',
        salary: 105000,
        description: 'Define UX strategy, oversee multiple projects, and establish UX standards.',
        skillRequirements: { creativity: 800, technical: 700, intelligence: 650, leadership: 500 },
        happinessImpact: 12,
        prestigeImpact: 40,
        timeCommitment: 50,
        healthImpact: -20,
        experience: 72
      },
      {
        level: 'executive',
        title: 'UX Director',
        salary: 130000,
        description: 'Shape organizational UX vision, lead design systems, and drive innovation.',
        skillRequirements: { creativity: 900, technical: 800, intelligence: 750, leadership: 650 },
        happinessImpact: 10,
        prestigeImpact: 50,
        timeCommitment: 55,
        healthImpact: -25,
        experience: 96
      }
    ]
  },
  
  {
    id: 'animator',
    name: 'Animator',
    category: 'creative',
    description: 'Create animated visual content for entertainment, education, and marketing.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior Animator',
        salary: 42000,
        description: 'Create basic animations and assist with animation production.',
        skillRequirements: { },
        happinessImpact: 12,
        prestigeImpact: 15,
        timeCommitment: 40,
        healthImpact: -10,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Animator',
        salary: 60000,
        description: 'Create complex animations and develop character movements.',
        skillRequirements: { creativity: 550, technical: 500 },
        happinessImpact: 15,
        prestigeImpact: 25,
        timeCommitment: 45,
        healthImpact: -15,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Animator',
        salary: 80000,
        description: 'Lead animation sequences and mentor junior animators.',
        skillRequirements: { creativity: 700, technical: 650, leadership: 400 },
        happinessImpact: 18,
        prestigeImpact: 35,
        timeCommitment: 50,
        healthImpact: -20,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Animation Director',
        salary: 100000,
        description: 'Oversee animation production and direct animation teams.',
        skillRequirements: { creativity: 850, technical: 750, leadership: 600 },
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 55,
        healthImpact: -25,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Animation Studio Director',
        salary: 120000,
        description: 'Lead animation studio operations and shape creative direction.',
        skillRequirements: { creativity: 900, technical: 800, leadership: 750 },
        happinessImpact: 12,
        prestigeImpact: 55,
        timeCommitment: 60,
        healthImpact: -30,
        experience: 96
      }
    ]
  },
  
  {
    id: 'photographer',
    name: 'Photographer',
    category: 'creative',
    description: 'Capture and create visual images for artistic, commercial, or documentary purposes.',
    careerPath: [
      {
        level: 'entry',
        title: 'Photography Assistant',
        salary: 35000,
        description: 'Assist professional photographers with equipment and studio setup.',
        skillRequirements: { },
        happinessImpact: 10,
        prestigeImpact: 10,
        timeCommitment: 40,
        healthImpact: -5,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Photographer',
        salary: 50000,
        description: 'Shoot commercial and editorial photography projects.',
        skillRequirements: { creativity: 500, technical: 450 },
        happinessImpact: 15,
        prestigeImpact: 20,
        timeCommitment: 45,
        healthImpact: -10,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Photographer',
        salary: 70000,
        description: 'Lead photography projects and develop unique visual styles.',
        skillRequirements: { creativity: 650, technical: 600, charisma: 450 },
        happinessImpact: 18,
        prestigeImpact: 30,
        timeCommitment: 45,
        healthImpact: -15,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Photography Director',
        salary: 90000,
        description: 'Direct photography teams and define visual direction for campaigns.',
        skillRequirements: { creativity: 800, technical: 700, charisma: 600, leadership: 500 },
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 50,
        healthImpact: -20,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Photography Studio Owner',
        salary: 110000,
        description: 'Run a photography agency and work with high-profile clients.',
        skillRequirements: { creativity: 900, technical: 800, charisma: 700, leadership: 650 },
        happinessImpact: 12,
        prestigeImpact: 50,
        timeCommitment: 55,
        healthImpact: -25,
        experience: 96
      }
    ]
  },
  
  {
    id: 'interior-designer',
    name: 'Interior Designer',
    category: 'creative',
    description: 'Design functional and aesthetically pleasing interior spaces.',
    careerPath: [
      {
        level: 'entry',
        title: 'Interior Design Assistant',
        salary: 38000,
        description: 'Support senior designers with material selection and space planning.',
        skillRequirements: { },
        happinessImpact: 10,
        prestigeImpact: 10,
        timeCommitment: 40,
        healthImpact: -5,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Interior Designer',
        salary: 55000,
        description: 'Design residential and small commercial spaces.',
        skillRequirements: { creativity: 500, technical: 400, charisma: 350 },
        happinessImpact: 12,
        prestigeImpact: 20,
        timeCommitment: 45,
        healthImpact: -10,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Interior Designer',
        salary: 75000,
        description: 'Lead complex design projects and develop client relationships.',
        skillRequirements: { creativity: 650, technical: 550, charisma: 500, leadership: 350 },
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 50,
        healthImpact: -15,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Design Director',
        salary: 95000,
        description: 'Oversee design teams and set standards for design excellence.',
        skillRequirements: { creativity: 800, technical: 650, charisma: 600, leadership: 550 },
        happinessImpact: 12,
        prestigeImpact: 40,
        timeCommitment: 55,
        healthImpact: -20,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Interior Design Firm Principal',
        salary: 120000,
        description: 'Own and lead a design firm, working with high-profile clients and projects.',
        skillRequirements: { creativity: 900, technical: 750, charisma: 750, leadership: 700 },
        happinessImpact: 10,
        prestigeImpact: 50,
        timeCommitment: 60,
        healthImpact: -25,
        experience: 96
      }
    ]
  },
  
  {
    id: 'fashion-designer',
    name: 'Fashion Designer',
    category: 'creative',
    description: 'Design clothing, accessories, and footwear for consumers and industry.',
    careerPath: [
      {
        level: 'entry',
        title: 'Design Assistant',
        salary: 40000,
        description: 'Support senior designers with sketches, material selection, and production.',
        skillRequirements: { },
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 45,
        healthImpact: -10,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Fashion Designer',
        salary: 60000,
        description: 'Create clothing designs and oversee sample production.',
        skillRequirements: { creativity: 600, technical: 500 },
        happinessImpact: 15,
        prestigeImpact: 25,
        timeCommitment: 50,
        healthImpact: -15,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Fashion Designer',
        salary: 85000,
        description: 'Design clothing collections and oversee creation from concept to production.',
        skillRequirements: { creativity: 750, technical: 650, leadership: 450 },
        happinessImpact: 18,
        prestigeImpact: 35,
        timeCommitment: 55,
        healthImpact: -20,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Design Director',
        salary: 110000,
        description: 'Direct design teams and shape brand aesthetic for clothing lines.',
        skillRequirements: { creativity: 850, technical: 750, leadership: 650, charisma: 600 },
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 60,
        healthImpact: -25,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Creative Director',
        salary: 150000,
        description: 'Define overall creative vision for fashion brands or design houses.',
        skillRequirements: { creativity: 950, technical: 850, leadership: 800, charisma: 750 },
        happinessImpact: 12,
        prestigeImpact: 60,
        timeCommitment: 65,
        healthImpact: -30,
        experience: 96
      }
    ]
  },
  
  {
    id: 'music-producer',
    name: 'Music Producer',
    category: 'creative',
    description: 'Oversee and manage the recording, mixing, and production of music.',
    careerPath: [
      {
        level: 'entry',
        title: 'Studio Assistant',
        salary: 35000,
        description: 'Support recording sessions and learn studio equipment operation.',
        skillRequirements: { },
        happinessImpact: 12,
        prestigeImpact: 10,
        timeCommitment: 40,
        healthImpact: -10,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Sound Engineer',
        salary: 50000,
        description: 'Record and mix music tracks for artists and bands.',
        skillRequirements: { creativity: 450, technical: 550 },
        happinessImpact: 15,
        prestigeImpact: 20,
        timeCommitment: 45,
        healthImpact: -15,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Music Producer',
        salary: 75000,
        description: 'Produce music projects and guide artists through the recording process.',
        skillRequirements: { creativity: 600, technical: 700, charisma: 500 },
        happinessImpact: 18,
        prestigeImpact: 30,
        timeCommitment: 50,
        healthImpact: -20,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Executive Producer',
        salary: 100000,
        description: 'Oversee multiple music productions and develop artist careers.',
        skillRequirements: { creativity: 750, technical: 800, charisma: 650, leadership: 600 },
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 55,
        healthImpact: -25,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Studio Owner',
        salary: 150000,
        description: 'Own and operate a recording studio, working with top artists and labels.',
        skillRequirements: { creativity: 850, technical: 900, charisma: 800, leadership: 750 },
        happinessImpact: 12,
        prestigeImpact: 60,
        timeCommitment: 60,
        healthImpact: -30,
        experience: 96
      }
    ]
  },
  
  {
    id: 'video-game-designer',
    name: 'Video Game Designer',
    category: 'creative',
    description: 'Design concepts, mechanics, and systems for video games.',
    careerPath: [
      {
        level: 'entry',
        title: 'Game Design Intern',
        salary: 40000,
        description: 'Assist design teams and learn game development processes.',
        skillRequirements: { },
        happinessImpact: 15,
        prestigeImpact: 15,
        timeCommitment: 40,
        healthImpact: -10,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Game Designer',
        salary: 65000,
        description: 'Design game mechanics and features for video games.',
        skillRequirements: { creativity: 550, technical: 500, intelligence: 500 },
        happinessImpact: 18,
        prestigeImpact: 25,
        timeCommitment: 45,
        healthImpact: -15,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Game Designer',
        salary: 90000,
        description: 'Lead game design for specific features or systems.',
        skillRequirements: { creativity: 700, technical: 650, intelligence: 650, leadership: 400 },
        happinessImpact: 20,
        prestigeImpact: 35,
        timeCommitment: 50,
        healthImpact: -20,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Lead Game Designer',
        salary: 120000,
        description: 'Direct overall game design and manage design teams.',
        skillRequirements: { creativity: 850, technical: 750, intelligence: 750, leadership: 650 },
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 55,
        healthImpact: -25,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Game Director',
        salary: 160000,
        description: 'Set creative vision for games and lead entire development studios.',
        skillRequirements: { creativity: 950, technical: 850, intelligence: 850, leadership: 800 },
        happinessImpact: 12,
        prestigeImpact: 60,
        timeCommitment: 60,
        healthImpact: -30,
        experience: 96
      }
    ]
  },
  
  // Additional Business Professions
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    category: 'business',
    description: 'Start and grow business ventures, develop innovative products or services, and lead companies.',
    careerPath: [
      {
        level: 'entry',
        title: 'Startup Founder',
        salary: 40000,
        description: 'Launch and develop a new business venture with minimal resources.',
        skillRequirements: { creativity: 60, leadership: 55, charisma: 60 },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 70,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Small Business Owner',
        salary: 75000,
        description: 'Run a small, established business with steady revenue and a small team.',
        skillRequirements: { creativity: 65, leadership: 65, charisma: 65, technical: 55 },
        happinessImpact: 8,
        prestigeImpact: 20,
        timeCommitment: 60,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Mid-Size Company CEO',
        salary: 150000,
        description: 'Lead a growing company with multiple employees and expanding market share.',
        skillRequirements: { creativity: 70, leadership: 75, charisma: 75, technical: 65 },
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Serial Entrepreneur',
        salary: 300000,
        description: 'Successfully launch and grow multiple business ventures simultaneously.',
        skillRequirements: { creativity: 80, leadership: 85, charisma: 80, technical: 70 },
        happinessImpact: 12,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Industry Magnate',
        salary: 500000,
        description: 'Lead a business empire with multiple successful companies and substantial market influence.',
        skillRequirements: { creativity: 85, leadership: 90, charisma: 85, technical: 75 },
        happinessImpact: 15,
        prestigeImpact: 60,
        timeCommitment: 65,
        experience: 60
      }
    ]
  },
  
  // Additional Legal Professions
  {
    id: 'judge',
    name: 'Judge',
    category: 'legal',
    description: 'Preside over court proceedings, interpret laws, and issue legal decisions.',
    careerPath: [
      {
        level: 'entry',
        title: 'Law Clerk',
        salary: 70000,
        description: 'Assist judges with research, drafting opinions, and administrative tasks.',
        skillRequirements: { intelligence: 75, charisma: 60 },
        happinessImpact: 5,
        prestigeImpact: 20,
        timeCommitment: 50,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Administrative Law Judge',
        salary: 120000,
        description: 'Preside over administrative hearings and issue decisions in specific regulatory areas.',
        skillRequirements: { intelligence: 80, charisma: 70, leadership: 65 },
        happinessImpact: 8,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 72
      },
      {
        level: 'mid',
        title: 'District Judge',
        salary: 160000,
        description: 'Preside over trial courts, conduct trials, and issue legal rulings.',
        skillRequirements: { intelligence: 85, charisma: 75, leadership: 75 },
        happinessImpact: 10,
        prestigeImpact: 40,
        timeCommitment: 50,
        experience: 96
      },
      {
        level: 'senior',
        title: 'Appellate Judge',
        salary: 200000,
        description: 'Review lower court decisions, hear appeals, and establish legal precedents.',
        skillRequirements: { intelligence: 90, charisma: 80, leadership: 80 },
        happinessImpact: 12,
        prestigeImpact: 50,
        timeCommitment: 55,
        experience: 120
      },
      {
        level: 'executive',
        title: 'Supreme Court Justice',
        salary: 250000,
        description: 'Serve on the highest court, decide constitutional issues, and shape legal interpretation.',
        skillRequirements: { intelligence: 95, charisma: 85, leadership: 85 },
        happinessImpact: 15,
        prestigeImpact: 60,
        timeCommitment: 60,
        experience: 144
      }
    ]
  },
  
  // Additional Science Professions
  {
    id: 'aerospace-engineer',
    name: 'Aerospace Engineer',
    category: 'science',
    description: 'Design, develop, and test aircraft, spacecraft, satellites, and missiles.',
    careerPath: [
      {
        level: 'entry',
        title: 'Junior Aerospace Engineer',
        salary: 75000,
        description: 'Assist with design, analysis, and testing of aerospace systems under supervision.',
        skillRequirements: { intelligence: 70, technical: 65 },
        happinessImpact: 7,
        prestigeImpact: 20,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Aerospace Engineer',
        salary: 95000,
        description: 'Design components, conduct analyses, and solve engineering problems independently.',
        skillRequirements: { intelligence: 75, technical: 75 },
        happinessImpact: 9,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Aerospace Engineer',
        salary: 120000,
        description: 'Lead engineering projects, develop complex aerospace systems, and mentor junior engineers.',
        skillRequirements: { intelligence: 80, technical: 85, leadership: 60 },
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Principal Aerospace Engineer',
        salary: 150000,
        description: 'Direct major aerospace programs, lead research initiatives, and guide technical strategy.',
        skillRequirements: { intelligence: 85, technical: 90, leadership: 70 },
        happinessImpact: 12,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Chief Engineer',
        salary: 200000,
        description: 'Set engineering vision, direct aerospace innovation, and lead engineering organizations.',
        skillRequirements: { intelligence: 90, technical: 95, leadership: 80 },
        happinessImpact: 15,
        prestigeImpact: 55,
        timeCommitment: 60,
        experience: 60
      }
    ]
  },
  
  // Government Professions
  {
    id: 'diplomat',
    name: 'Diplomat',
    category: 'government',
    description: 'Represent your country abroad, negotiate international agreements, and promote foreign policy objectives.',
    careerPath: [
      {
        level: 'entry',
        title: 'Foreign Service Officer',
        salary: 60000,
        description: 'Provide consular services, report on political developments, and support diplomatic missions.',
        skillRequirements: { },
        happinessImpact: 8,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Second Secretary',
        salary: 80000,
        description: 'Lead specific diplomatic portfolios and serve as specialized representatives in embassies.',
        skillRequirements: { charisma: 750, intelligence: 700 },
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 36
      },
      {
        level: 'mid',
        title: 'First Secretary',
        salary: 100000,
        description: 'Manage diplomatic relations in specific areas and negotiate international agreements.',
        skillRequirements: { charisma: 800, intelligence: 750, leadership: 650 },
        happinessImpact: 12,
        prestigeImpact: 35,
        timeCommitment: 55,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Ambassador',
        salary: 150000,
        description: 'Serve as principal representative of your country in a foreign nation.',
        skillRequirements: { charisma: 850, intelligence: 800, leadership: 750 },
        happinessImpact: 15,
        prestigeImpact: 50,
        timeCommitment: 60,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Secretary of State',
        salary: 210000,
        description: 'Direct all foreign policy, lead international negotiations, and shape global diplomacy.',
        skillRequirements: { charisma: 900, intelligence: 850, leadership: 850 },
        happinessImpact: 10,
        prestigeImpact: 65,
        timeCommitment: 70,
        experience: 96
      }
    ]
  },
  
  // Policy Analyst
  {
    id: 'policy-analyst',
    name: 'Policy Analyst',
    category: 'government',
    description: 'Research, analyze, and develop public policy solutions to address societal issues.',
    careerPath: [
      {
        level: 'entry',
        title: 'Research Assistant',
        salary: 55000,
        description: 'Gather data, conduct literature reviews, and support policy research projects.',
        skillRequirements: { },
        happinessImpact: 6,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Policy Analyst',
        salary: 75000,
        description: 'Analyze policy issues, prepare briefings, and make recommendations to decision-makers.',
        skillRequirements: { intelligence: 700, technical: 650 },
        happinessImpact: 8,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Policy Analyst',
        salary: 95000,
        description: 'Lead complex policy analysis, develop policy frameworks, and coordinate stakeholder engagement.',
        skillRequirements: { intelligence: 800, technical: 750, leadership: 600 },
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Policy Director',
        salary: 120000,
        description: 'Direct policy development in a specific area, manage policy teams, and advise high-level officials.',
        skillRequirements: { intelligence: 850, technical: 800, leadership: 700, charisma: 650 },
        happinessImpact: 12,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 60
      },
      {
        level: 'executive',
        title: 'Chief Policy Advisor',
        salary: 160000,
        description: 'Shape national policy strategy, lead major policy initiatives, and advise top government officials.',
        skillRequirements: { intelligence: 900, technical: 850, leadership: 800, charisma: 750 },
        happinessImpact: 15,
        prestigeImpact: 50,
        timeCommitment: 60,
        experience: 84
      }
    ]
  },
  
  // Legislator
  {
    id: 'legislator',
    name: 'Legislator',
    category: 'government',
    description: 'Represent constituents and work to create, amend, and pass laws that address societal needs.',
    careerPath: [
      {
        level: 'entry',
        title: 'Legislative Aide',
        salary: 45000,
        description: 'Support elected officials with constituent services, research, and administrative tasks.',
        skillRequirements: { },
        happinessImpact: 5,
        prestigeImpact: 20,
        timeCommitment: 50,
        experience: 0
      },
      {
        level: 'junior',
        title: 'City Council Member',
        salary: 65000,
        description: 'Serve on local governing body, create local ordinances, and address community issues.',
        skillRequirements: { charisma: 700, leadership: 650, intelligence: 600 },
        happinessImpact: 10,
        prestigeImpact: 35,
        timeCommitment: 30,
        experience: 24
      },
      {
        level: 'mid',
        title: 'State Representative',
        salary: 85000,
        description: 'Create and vote on state laws, represent district interests, and serve on legislative committees.',
        skillRequirements: { charisma: 800, leadership: 750, intelligence: 700 },
        happinessImpact: 12,
        prestigeImpact: 45,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'senior',
        title: 'U.S. Representative',
        salary: 174000,
        description: 'Serve in the House of Representatives, create federal legislation, and represent district interests.',
        skillRequirements: { charisma: 850, leadership: 800, intelligence: 750 },
        happinessImpact: 15,
        prestigeImpact: 60,
        timeCommitment: 60,
        experience: 72
      },
      {
        level: 'executive',
        title: 'U.S. Senator',
        salary: 174000,
        description: 'Serve in the Senate, shape national policy, and provide consent on treaties and appointments.',
        skillRequirements: { charisma: 900, leadership: 850, intelligence: 800 },
        happinessImpact: 18,
        prestigeImpact: 70,
        timeCommitment: 65,
        experience: 96
      }
    ]
  },
  
  // Civil Servant
  {
    id: 'civil-servant',
    name: 'Civil Servant',
    category: 'government',
    description: 'Work within government departments to implement policies, administer programs, and serve the public.',
    careerPath: [
      {
        level: 'entry',
        title: 'Administrative Assistant',
        salary: 42000,
        description: 'Provide administrative support, process documents, and assist with basic departmental operations.',
        skillRequirements: { },
        happinessImpact: 6,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Program Specialist',
        salary: 55000,
        description: 'Implement government programs, process applications, and assist with program management.',
        skillRequirements: { intelligence: 600, technical: 600 },
        happinessImpact: 7,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Program Manager',
        salary: 75000,
        description: 'Oversee government program operations, manage budgets, and ensure program effectiveness.',
        skillRequirements: { intelligence: 700, technical: 650, leadership: 650 },
        happinessImpact: 8,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Department Director',
        salary: 110000,
        description: 'Lead a government department, develop strategic plans, and manage large teams of civil servants.',
        skillRequirements: { intelligence: 750, leadership: 800, technical: 700 },
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Agency Director',
        salary: 150000,
        description: 'Direct a major government agency, implement high-level policy directives, and manage agency operations.',
        skillRequirements: { intelligence: 800, leadership: 850, technical: 750, charisma: 700 },
        happinessImpact: 12,
        prestigeImpact: 40,
        timeCommitment: 60,
        experience: 96
      }
    ]
  },
  
  // Intelligence Officer
  {
    id: 'intelligence-officer',
    name: 'Intelligence Officer',
    category: 'government',
    description: 'Gather and analyze intelligence to protect national security and inform government decision-making.',
    careerPath: [
      {
        level: 'entry',
        title: 'Intelligence Analyst',
        salary: 65000,
        description: 'Collect and analyze intelligence data, prepare reports, and identify potential threats.',
        skillRequirements: { },
        happinessImpact: 7,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Field Agent',
        salary: 85000,
        description: 'Conduct field operations, gather human intelligence, and develop intelligence networks.',
        skillRequirements: { intelligence: 700, physical: 700, charisma: 650 },
        happinessImpact: 6,
        prestigeImpact: 30,
        timeCommitment: 55,
        experience: 36
      },
      {
        level: 'mid',
        title: 'Senior Intelligence Officer',
        salary: 110000,
        description: 'Lead intelligence operations, manage intelligence collection, and brief senior officials.',
        skillRequirements: { intelligence: 800, physical: 750, charisma: 700, leadership: 650 },
        happinessImpact: 8,
        prestigeImpact: 35,
        timeCommitment: 60,
        experience: 60
      },
      {
        level: 'senior',
        title: 'Division Chief',
        salary: 140000,
        description: 'Oversee intelligence operations in specific regions or subject areas, coordinate with other agencies.',
        skillRequirements: { intelligence: 850, leadership: 800, charisma: 750 },
        happinessImpact: 10,
        prestigeImpact: 45,
        timeCommitment: 60,
        experience: 84
      },
      {
        level: 'executive',
        title: 'Intelligence Director',
        salary: 180000,
        description: 'Lead intelligence agency, shape national security strategy, and advise top government officials.',
        skillRequirements: { intelligence: 900, leadership: 850, charisma: 800 },
        happinessImpact: 12,
        prestigeImpact: 55,
        timeCommitment: 65,
        experience: 108
      }
    ]
  },
  
  // Military Officer
  {
    id: 'military-officer',
    name: 'Military Officer',
    category: 'government',
    description: 'Lead military personnel, plan and execute operations, and protect national security interests.',
    careerPath: [
      {
        level: 'entry',
        title: 'Second Lieutenant/Ensign',
        salary: 45000,
        description: 'Lead small units, learn military operations, and develop leadership skills.',
        skillRequirements: { },
        happinessImpact: 8,
        prestigeImpact: 25,
        timeCommitment: 60,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Captain/Lieutenant',
        salary: 70000,
        description: 'Command company-sized units, plan operations, and take on increased leadership responsibilities.',
        skillRequirements: { leadership: 700, physical: 700, intelligence: 650 },
        happinessImpact: 10,
        prestigeImpact: 30,
        timeCommitment: 60,
        experience: 48
      },
      {
        level: 'mid',
        title: 'Major/Lieutenant Commander',
        salary: 90000,
        description: 'Serve as staff officers, develop strategic plans, and take on specialized leadership roles.',
        skillRequirements: { leadership: 800, physical: 750, intelligence: 750 },
        happinessImpact: 12,
        prestigeImpact: 35,
        timeCommitment: 60,
        experience: 96
      },
      {
        level: 'senior',
        title: 'Colonel/Captain',
        salary: 130000,
        description: 'Command large units, develop major operational plans, and lead significant military initiatives.',
        skillRequirements: { leadership: 850, intelligence: 800, charisma: 750 },
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 65,
        experience: 144
      },
      {
        level: 'executive',
        title: 'General/Admiral',
        salary: 200000,
        description: 'Direct military branches, shape national defense strategy, and advise civilian leadership.',
        skillRequirements: { leadership: 900, intelligence: 850, charisma: 800 },
        happinessImpact: 18,
        prestigeImpact: 60,
        timeCommitment: 70,
        experience: 192
      }
    ]
  },
  
  // Urban Planner
  {
    id: 'urban-planner',
    name: 'Urban Planner',
    category: 'government',
    description: 'Plan and design communities, manage development projects, and create sustainable urban environments.',
    careerPath: [
      {
        level: 'entry',
        title: 'Planning Technician',
        salary: 50000,
        description: 'Assist with planning projects, create maps and diagrams, and collect planning data.',
        skillRequirements: { },
        happinessImpact: 7,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Urban Planner',
        salary: 65000,
        description: 'Develop land use plans, review development proposals, and engage with community stakeholders.',
        skillRequirements: { intelligence: 650, technical: 700, creativity: 600 },
        happinessImpact: 9,
        prestigeImpact: 20,
        timeCommitment: 40,
        experience: 36
      },
      {
        level: 'mid',
        title: 'Senior Urban Planner',
        salary: 85000,
        description: 'Lead planning projects, develop comprehensive plans, and coordinate with various agencies.',
        skillRequirements: { intelligence: 750, technical: 800, creativity: 700, charisma: 650 },
        happinessImpact: 11,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 60
      },
      {
        level: 'senior',
        title: 'Planning Director',
        salary: 110000,
        description: 'Direct planning department, develop long-range planning strategies, and manage planning staff.',
        skillRequirements: { intelligence: 800, technical: 850, leadership: 750, charisma: 700 },
        happinessImpact: 12,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 84
      },
      {
        level: 'executive',
        title: 'City Development Commissioner',
        salary: 140000,
        description: 'Shape urban development policy, direct major urban initiatives, and coordinate regional planning.',
        skillRequirements: { intelligence: 850, technical: 900, leadership: 800, charisma: 750 },
        happinessImpact: 14,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 108
      }
    ]
  },
  
  // Public Health Official
  {
    id: 'public-health-official',
    name: 'Public Health Official',
    category: 'government',
    description: 'Protect and improve community health through policy, education, and public health initiatives.',
    careerPath: [
      {
        level: 'entry',
        title: 'Public Health Analyst',
        salary: 55000,
        description: 'Collect and analyze health data, support health education programs, and assist with health initiatives.',
        skillRequirements: { },
        happinessImpact: 8,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Public Health Specialist',
        salary: 70000,
        description: 'Develop health programs, conduct health assessments, and coordinate community health services.',
        skillRequirements: { intelligence: 700, technical: 650, charisma: 600 },
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 40,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Public Health Manager',
        salary: 90000,
        description: 'Manage public health programs, develop health policies, and lead health intervention efforts.',
        skillRequirements: { intelligence: 800, technical: 750, charisma: 700, leadership: 650 },
        happinessImpact: 12,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Public Health Director',
        salary: 120000,
        description: 'Lead local health department, develop comprehensive health strategies, and manage health crises.',
        skillRequirements: { intelligence: 850, leadership: 800, charisma: 750, technical: 800 },
        happinessImpact: 15,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Health Commissioner',
        salary: 160000,
        description: 'Shape health policy at regional or state level, lead major health initiatives, and coordinate emergency response.',
        skillRequirements: { intelligence: 900, leadership: 850, charisma: 800, technical: 850 },
        happinessImpact: 18,
        prestigeImpact: 45,
        timeCommitment: 55,
        experience: 96
      }
    ]
  },
  
  // Tax Assessor
  {
    id: 'tax-assessor',
    name: 'Tax Assessor',
    category: 'government',
    description: 'Determine property values, apply tax rates, and ensure fair and accurate tax assessments.',
    careerPath: [
      {
        level: 'entry',
        title: 'Assessment Clerk',
        salary: 45000,
        description: 'Process property records, assist with property inspections, and maintain tax assessment data.',
        skillRequirements: { },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Assessment Specialist',
        salary: 60000,
        description: 'Conduct property assessments, review property data, and determine property values.',
        skillRequirements: { intelligence: 650, technical: 700 },
        happinessImpact: 6,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Senior Assessor',
        salary: 75000,
        description: 'Handle complex property valuations, manage assessment appeals, and train assessment staff.',
        skillRequirements: { intelligence: 750, technical: 800, leadership: 600 },
        happinessImpact: 7,
        prestigeImpact: 20,
        timeCommitment: 40,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Assessment Manager',
        salary: 95000,
        description: 'Oversee assessment operations, develop valuation methodologies, and ensure assessment quality.',
        skillRequirements: { intelligence: 800, technical: 850, leadership: 700 },
        happinessImpact: 8,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 72
      },
      {
        level: 'executive',
        title: 'County Assessor',
        salary: 120000,
        description: 'Direct assessment office, establish assessment policies, and ensure fair taxation practices.',
        skillRequirements: { intelligence: 850, technical: 900, leadership: 800, charisma: 700 },
        happinessImpact: 9,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 96
      }
    ]
  },
  
  // Environmental Regulator
  {
    id: 'environmental-regulator',
    name: 'Environmental Regulator',
    category: 'government',
    description: 'Develop and enforce environmental regulations to protect natural resources and public health.',
    careerPath: [
      {
        level: 'entry',
        title: 'Environmental Technician',
        salary: 48000,
        description: 'Collect environmental samples, conduct field inspections, and monitor compliance with regulations.',
        skillRequirements: { },
        happinessImpact: 7,
        prestigeImpact: 15,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Environmental Specialist',
        salary: 65000,
        description: 'Review permit applications, investigate complaints, and ensure regulatory compliance.',
        skillRequirements: { technical: 700, intelligence: 650 },
        happinessImpact: 9,
        prestigeImpact: 20,
        timeCommitment: 40,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Environmental Program Manager',
        salary: 85000,
        description: 'Develop environmental programs, coordinate enforcement activities, and engage with stakeholders.',
        skillRequirements: { technical: 800, intelligence: 750, leadership: 650, charisma: 600 },
        happinessImpact: 11,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'senior',
        title: 'Environmental Division Director',
        salary: 110000,
        description: 'Lead environmental divisions, develop regulatory frameworks, and manage environmental initiatives.',
        skillRequirements: { technical: 850, intelligence: 800, leadership: 750, charisma: 700 },
        happinessImpact: 13,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Environmental Protection Director',
        salary: 150000,
        description: 'Shape environmental policy, direct major environmental initiatives, and lead regulatory agency.',
        skillRequirements: { technical: 900, intelligence: 850, leadership: 800, charisma: 750 },
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 96
      }
    ]
  },
  
  // Skilled Trades Professions
  {
    id: 'electrician',
    name: 'Electrician',
    category: 'trade',
    description: 'Install, maintain, and repair electrical systems in homes, businesses, and industrial facilities.',
    careerPath: [
      {
        level: 'entry',
        title: 'Apprentice Electrician',
        salary: 40000,
        description: 'Learn electrical work by assisting journeyman electricians with installations and repairs.',
        skillRequirements: { },
        happinessImpact: 5,
        prestigeImpact: 5,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Journeyman Electrician',
        salary: 60000,
        description: 'Perform electrical installations and repairs independently with general supervision.',
        skillRequirements: { technical: 650 },
        happinessImpact: 7,
        prestigeImpact: 10,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'mid',
        title: 'Master Electrician',
        salary: 80000,
        description: 'Design electrical systems, obtain permits, and supervise other electricians.',
        skillRequirements: { technical: 800, leadership: 600 },
        happinessImpact: 9,
        prestigeImpact: 20,
        timeCommitment: 50,
        experience: 60
      },
      {
        level: 'senior',
        title: 'Electrical Contractor',
        salary: 110000,
        description: 'Run an electrical contracting business, manage client relationships, and lead project teams.',
        skillRequirements: { technical: 850, leadership: 700, charisma: 650 },
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 55,
        experience: 72
      },
      {
        level: 'executive',
        title: 'Electrical Engineering Firm Owner',
        salary: 150000,
        description: 'Own and operate a successful electrical engineering and contracting company.',
        skillRequirements: { technical: 900, leadership: 800, charisma: 750, intelligence: 750 },
        happinessImpact: 12,
        prestigeImpact: 30,
        timeCommitment: 60,
        experience: 84
      }
    ]
  },
  // Additional Skilled Trades Professions
  {
    id: 'plumber',
    name: 'Plumber',
    category: 'trade',
    description: 'Install, repair, and maintain plumbing systems in residential and commercial buildings.',
    careerPath: [
      {
        level: 'entry',
        title: 'Plumber Helper',
        salary: 38000,
        description: 'Learn plumbing skills by assisting experienced plumbers on various jobs.',
        skillRequirements: {},
        happinessImpact: 0,
        prestigeImpact: 0,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Apprentice Plumber',
        salary: 55000,
        description: 'Perform routine plumbing installation and repair work with supervision.',
        skillRequirements: {
          technical: 250,
          physical: 300
        },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Licensed Plumber',
        salary: 75000,
        description: 'Handle complex plumbing projects independently and mentor apprentices.',
        skillRequirements: {
          technical: 450,
          physical: 450,
          leadership: 150
        },
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Master Plumber',
        salary: 95000,
        description: 'Design plumbing systems for buildings and oversee large installation projects.',
        skillRequirements: {
          technical: 700,
          leadership: 350,
          physical: 600
        },
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Plumbing Contractor',
        salary: 120000,
        description: 'Run a plumbing business handling residential and commercial contracts.',
        skillRequirements: {
          technical: 750,
          leadership: 650,
          charisma: 500,
          physical: 600
        },
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 60
      }
    ]
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    category: 'trade',
    description: 'Construct, install, and repair structures made of wood and other materials.',
    careerPath: [
      {
        level: 'entry',
        title: 'Carpenter Helper',
        salary: 35000,
        description: 'Assist experienced carpenters by preparing work sites and materials.',
        skillRequirements: {},
        happinessImpact: 0,
        prestigeImpact: 0,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Apprentice Carpenter',
        salary: 50000,
        description: 'Build basic structures and perform routine carpentry tasks with guidance.',
        skillRequirements: {
          technical: 250,
          physical: 350
        },
        happinessImpact: 10,
        prestigeImpact: 10,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Journeyman Carpenter',
        salary: 70000,
        description: 'Specialize in detailed woodwork and complex installations for interior spaces.',
        skillRequirements: {
          technical: 500,
          physical: 500,
          creativity: 300
        },
        happinessImpact: 15,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Master Carpenter',
        salary: 90000,
        description: 'Design and create custom woodwork while leading teams on large construction projects.',
        skillRequirements: {
          technical: 650,
          leadership: 400,
          physical: 600,
          creativity: 450
        },
        happinessImpact: 20,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'executive',
        title: 'General Contractor',
        salary: 130000,
        description: 'Run a construction business specializing in custom building and renovation projects.',
        skillRequirements: {
          technical: 700,
          leadership: 650,
          physical: 550,
          creativity: 500
        },
        happinessImpact: 15,
        prestigeImpact: 45,
        timeCommitment: 50,
        experience: 60
      }
    ]
  },
  {
    id: 'hvac-technician',
    name: 'HVAC Technician',
    category: 'trade',
    description: 'Install, maintain, and repair heating, ventilation, air conditioning, and refrigeration systems.',
    careerPath: [
      {
        level: 'entry',
        title: 'HVAC Helper',
        salary: 38000,
        description: 'Assist licensed technicians by preparing tools and materials for HVAC installations.',
        skillRequirements: {},
        happinessImpact: 0,
        prestigeImpact: 0,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'HVAC Installer',
        salary: 58000,
        description: 'Install basic heating and cooling systems under supervision.',
        skillRequirements: {
          technical: 300,
          physical: 250
        },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'HVAC Technician',
        salary: 78000,
        description: 'Diagnose and repair complex HVAC systems independently.',
        skillRequirements: {
          technical: 550,
          physical: 400
        },
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Senior HVAC Specialist',
        salary: 95000,
        description: 'Design HVAC systems for commercial buildings and lead installation teams.',
        skillRequirements: {
          technical: 750,
          leadership: 350,
          physical: 500
        },
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'executive',
        title: 'HVAC Contractor',
        salary: 135000,
        description: 'Manage an HVAC company handling major commercial and industrial contracts.',
        skillRequirements: {
          technical: 800,
          leadership: 650,
          physical: 500
        },
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 50,
        experience: 60
      }
    ]
  },
  {
    id: 'welder',
    name: 'Welder',
    category: 'trade',
    description: 'Join metal components using high heat to melt and fuse materials together.',
    careerPath: [
      {
        level: 'entry',
        title: 'Welder Assistant',
        salary: 36000,
        description: 'Prepare materials and equipment for welding operations and learn basic techniques.',
        skillRequirements: {},
        happinessImpact: 0,
        prestigeImpact: 0,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Production Welder',
        salary: 52000,
        description: 'Perform routine welding tasks following established patterns and procedures.',
        skillRequirements: {
          technical: 250,
          physical: 350
        },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Certified Welder',
        salary: 70000,
        description: 'Perform complex welding operations using multiple techniques and materials.',
        skillRequirements: {
          technical: 500,
          physical: 550
        },
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Welding Specialist',
        salary: 85000,
        description: 'Handle specialized welding projects and supervise other welders on critical applications.',
        skillRequirements: {
          technical: 700,
          leadership: 300,
          physical: 650
        },
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Welding Inspector/Contractor',
        salary: 110000,
        description: 'Either inspect welding quality for large industrial projects or run a specialized welding business.',
        skillRequirements: {
          technical: 850,
          leadership: 550,
          physical: 700
        },
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 50,
        experience: 60
      }
    ]
  },
  {
    id: 'auto-mechanic',
    name: 'Auto Mechanic',
    category: 'trade',
    description: 'Diagnose, adjust, repair, and overhaul automotive vehicles.',
    careerPath: [
      {
        level: 'entry',
        title: 'Mechanic Helper',
        salary: 34000,
        description: 'Assist mechanics with basic maintenance tasks like oil changes and tire rotations.',
        skillRequirements: {},
        happinessImpact: 0,
        prestigeImpact: 0,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Service Technician',
        salary: 48000,
        description: 'Perform routine maintenance and basic repairs on vehicles.',
        skillRequirements: {
          technical: 250,
          physical: 200
        },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Automotive Technician',
        salary: 65000,
        description: 'Diagnose and repair complex automotive issues across multiple vehicle systems.',
        skillRequirements: {
          technical: 500,
          physical: 350
        },
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Master Technician',
        salary: 85000,
        description: 'Handle the most complex automotive repairs and diagnose difficult problems.',
        skillRequirements: {
          technical: 750,
          leadership: 200,
          physical: 450
        },
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Shop Manager/Owner',
        salary: 120000,
        description: 'Manage or own an automotive repair shop with multiple technicians.',
        skillRequirements: {
          technical: 800,
          leadership: 600,
          physical: 400
        },
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 50,
        experience: 60
      }
    ]
  },
  {
    id: 'masonry-worker',
    name: 'Masonry Worker',
    category: 'trade',
    description: 'Build structures with brick, stone, concrete blocks, and other materials.',
    careerPath: [
      {
        level: 'entry',
        title: 'Mason Helper',
        salary: 35000,
        description: 'Mix mortar, carry materials, and assist skilled masons on construction sites.',
        skillRequirements: {},
        happinessImpact: 0,
        prestigeImpact: 0,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Apprentice Mason',
        salary: 48000,
        description: 'Lay bricks and blocks for simple structures under supervision.',
        skillRequirements: {
          technical: 200,
          physical: 400
        },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 45,
        experience: 24
      },
      {
        level: 'mid',
        title: 'Journeyman Mason',
        salary: 65000,
        description: 'Build complex masonry structures independently and direct helpers.',
        skillRequirements: {
          technical: 400,
          physical: 600,
          leadership: 150
        },
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Master Mason',
        salary: 80000,
        description: 'Construct decorative and complex masonry works while leading teams on large projects.',
        skillRequirements: {
          technical: 600,
          leadership: 350,
          physical: 750,
          creativity: 300
        },
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Masonry Contractor',
        salary: 110000,
        description: 'Run a masonry business managing multiple crews for commercial and residential projects.',
        skillRequirements: {
          technical: 650,
          leadership: 600,
          physical: 700
        },
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 50,
        experience: 60
      }
    ]
  },
  {
    id: 'construction-worker',
    name: 'Construction Worker',
    category: 'trade',
    description: 'Build, repair, and maintain buildings, roads, and other structures.',
    careerPath: [
      {
        level: 'entry',
        title: 'Construction Laborer',
        salary: 32000,
        description: 'Perform basic tasks on construction sites like loading materials and cleaning areas.',
        skillRequirements: {},
        happinessImpact: 0,
        prestigeImpact: 0,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Construction Worker',
        salary: 45000,
        description: 'Handle specific construction tasks like framing, roofing, or concrete work.',
        skillRequirements: {
          technical: 150,
          physical: 400
        },
        happinessImpact: 5,
        prestigeImpact: 5,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Skilled Construction Worker',
        salary: 60000,
        description: 'Perform multiple specialized construction tasks and coordinate with other trades.',
        skillRequirements: {
          technical: 350,
          physical: 600,
          leadership: 150
        },
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Construction Foreman',
        salary: 75000,
        description: 'Supervise workers on construction sites and ensure projects meet specifications.',
        skillRequirements: {
          technical: 500,
          leadership: 500,
          physical: 650
        },
        happinessImpact: 10,
        prestigeImpact: 25,
        timeCommitment: 50,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Construction Superintendent',
        salary: 105000,
        description: 'Oversee entire construction projects, coordinating multiple teams and trades.',
        skillRequirements: {
          technical: 600,
          leadership: 750,
          physical: 550
        },
        happinessImpact: 15,
        prestigeImpact: 40,
        timeCommitment: 55,
        experience: 60
      }
    ]
  },
  {
    id: 'landscaper',
    name: 'Landscaper',
    category: 'trade',
    description: 'Create and maintain outdoor spaces through planting, maintenance, and hardscaping.',
    careerPath: [
      {
        level: 'entry',
        title: 'Landscape Laborer',
        salary: 30000,
        description: 'Perform basic landscaping tasks like mowing, planting, and general maintenance.',
        skillRequirements: {},
        happinessImpact: 5,
        prestigeImpact: 0,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Landscape Technician',
        salary: 42000,
        description: 'Install plants, irrigation systems, and small hardscape features.',
        skillRequirements: {
          technical: 200,
          physical: 350,
          creativity: 150
        },
        happinessImpact: 10,
        prestigeImpact: 10,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Landscape Specialist',
        salary: 55000,
        description: 'Design and implement complex landscape features and manage maintenance schedules.',
        skillRequirements: {
          technical: 400,
          physical: 450,
          creativity: 350
        },
        happinessImpact: 15,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Landscape Designer',
        salary: 70000,
        description: 'Create comprehensive landscape designs for residential and commercial properties.',
        skillRequirements: {
          technical: 500,
          leadership: 300,
          physical: 400,
          creativity: 600
        },
        happinessImpact: 20,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Landscape Architect/Contractor',
        salary: 95000,
        description: 'Either design large-scale landscape projects or run a landscape contracting business.',
        skillRequirements: {
          technical: 600,
          leadership: 550,
          physical: 350,
          creativity: 700
        },
        happinessImpact: 20,
        prestigeImpact: 40,
        timeCommitment: 50,
        experience: 60
      }
    ]
  },
  {
    id: 'painter',
    name: 'Painter',
    category: 'trade',
    description: 'Apply paint, stain, and coatings to interior and exterior surfaces.',
    careerPath: [
      {
        level: 'entry',
        title: 'Painter Helper',
        salary: 32000,
        description: 'Prepare surfaces, mix paint, and assist with basic painting tasks.',
        skillRequirements: {},
        happinessImpact: 0,
        prestigeImpact: 0,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Painter',
        salary: 42000,
        description: 'Paint walls, ceilings, and trim in residential settings.',
        skillRequirements: {
          technical: 150,
          physical: 300
        },
        happinessImpact: 5,
        prestigeImpact: 5,
        timeCommitment: 40,
        experience: 12
      },
      {
        level: 'mid',
        title: 'Commercial Painter',
        salary: 55000,
        description: 'Handle larger commercial painting projects and specialized finishes.',
        skillRequirements: {
          technical: 350,
          physical: 450,
          creativity: 200
        },
        happinessImpact: 10,
        prestigeImpact: 15,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Master Painter',
        salary: 70000,
        description: 'Apply complex decorative finishes and lead teams on large painting projects.',
        skillRequirements: {
          technical: 500,
          leadership: 350,
          physical: 500,
          creativity: 400
        },
        happinessImpact: 15,
        prestigeImpact: 25,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Painting Contractor',
        salary: 95000,
        description: 'Manage a painting company with multiple crews handling residential and commercial projects.',
        skillRequirements: {
          technical: 550,
          leadership: 600,
          physical: 400,
          creativity: 350
        },
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 50,
        experience: 60
      }
    ]
  },
  {
    id: 'equipment-operator',
    name: 'Heavy Equipment Operator',
    category: 'trade',
    description: 'Operate heavy machinery for construction, excavation, and material moving.',
    careerPath: [
      {
        level: 'entry',
        title: 'Equipment Operator Trainee',
        salary: 36000,
        description: 'Learn to operate basic construction equipment under close supervision.',
        skillRequirements: {},
        happinessImpact: 0,
        prestigeImpact: 0,
        timeCommitment: 40,
        experience: 0
      },
      {
        level: 'junior',
        title: 'Equipment Operator',
        salary: 50000,
        description: 'Operate medium-sized equipment on construction sites with limited supervision.',
        skillRequirements: {
          technical: 300,
          physical: 350
        },
        happinessImpact: 5,
        prestigeImpact: 10,
        timeCommitment: 45,
        experience: 18
      },
      {
        level: 'mid',
        title: 'Advanced Equipment Operator',
        salary: 65000,
        description: 'Operate multiple types of heavy machinery for complex construction tasks.',
        skillRequirements: {
          technical: 550,
          physical: 450
        },
        happinessImpact: 10,
        prestigeImpact: 20,
        timeCommitment: 45,
        experience: 36
      },
      {
        level: 'senior',
        title: 'Heavy Equipment Specialist',
        salary: 85000,
        description: 'Handle the most complex and dangerous equipment operations and train junior operators.',
        skillRequirements: {
          technical: 750,
          leadership: 300,
          physical: 550
        },
        happinessImpact: 15,
        prestigeImpact: 30,
        timeCommitment: 45,
        experience: 48
      },
      {
        level: 'executive',
        title: 'Equipment Operations Manager',
        salary: 105000,
        description: 'Manage equipment fleets and operations for large construction companies.',
        skillRequirements: {
          technical: 800,
          leadership: 650,
          physical: 500
        },
        happinessImpact: 15,
        prestigeImpact: 35,
        timeCommitment: 50,
        experience: 60
      }
    ]
  }
];

// Helper functions for working with professions and jobs

// Get a specific profession by ID
export const getProfession = (id: string): Profession | undefined => {
  return professions.find(p => p.id === id);
};

// Get a specific job level within a profession
export const getJobByLevelInProfession = (professionId: string, level: JobLevel): CareerPath | undefined => {
  const profession = getProfession(professionId);
  if (!profession) return undefined;
  
  return profession.careerPath.find(path => path.level === level);
};

// Get the next job level in a career path
export const getNextJobInCareerPath = (professionId: string, currentLevel: JobLevel): CareerPath | undefined => {
  const profession = getProfession(professionId);
  if (!profession) return undefined;
  
  const levelOrder: JobLevel[] = ['entry', 'junior', 'mid', 'senior', 'executive'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  
  if (currentIndex < 0 || currentIndex >= levelOrder.length - 1) {
    return undefined; // Either invalid level or already at the highest level
  }
  
  const nextLevel = levelOrder[currentIndex + 1];
  return profession.careerPath.find(path => path.level === nextLevel);
};

// Get all professions in a specific category
export const getProfessionsByCategory = (category: JobCategory): Profession[] => {
  return professions.filter(p => p.category === category);
};

// Get all profession categories
export const getAllProfessionCategories = (): JobCategory[] => {
  return Array.from(new Set(professions.map(p => p.category)));
};

// Get user-friendly category labels
export const getCategoryLabel = (category: JobCategory): string => {
  const labels: Record<JobCategory, string> = {
    'technology': 'Technology',
    'finance': 'Finance & Banking',
    'healthcare': 'Healthcare',
    'education': 'Education',
    'creative': 'Creative Arts',
    'business': 'Business',
    'legal': 'Legal',
    'science': 'Science & Research',
    'government': 'Government & Public Sector',
    'trade': 'Skilled Trades'
  };
  
  return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

// Get user-friendly job level labels
export const getJobLevelLabel = (level: JobLevel): string => {
  const labels: Record<JobLevel, string> = {
    'entry': 'Entry Level',
    'junior': 'Junior',
    'mid': 'Mid-Level',
    'senior': 'Senior',
    'executive': 'Executive'
  };
  
  return labels[level] || level.charAt(0).toUpperCase() + level.slice(1);
};

// Check if character meets skill requirements for a job
export const meetsSkillRequirements = (
  skills: CharacterSkills, 
  requirements: Partial<CharacterSkills>
): boolean => {
  for (const [skill, minLevel] of Object.entries(requirements)) {
    const typedSkill = skill as keyof CharacterSkills;
    if (skills[typedSkill] < minLevel) {
      return false;
    }
  }
  
  return true;
};

// Calculate months needed to meet skill requirements at current improvement rate
export const calculateMonthsToSkillRequirements = (
  skills: CharacterSkills,
  requirements: Partial<CharacterSkills>,
  improvementRate: Partial<CharacterSkills>
): number => {
  let maxMonths = 0;
  
  for (const [skill, minLevel] of Object.entries(requirements)) {
    const typedSkill = skill as keyof CharacterSkills;
    const currentLevel = skills[typedSkill];
    const monthlyImprovement = improvementRate[typedSkill] || 1; // Default to 1 point per month
    
    if (currentLevel < minLevel) {
      const deficit = minLevel - currentLevel;
      const monthsNeeded = Math.ceil(deficit / monthlyImprovement);
      maxMonths = Math.max(maxMonths, monthsNeeded);
    }
  }
  
  return maxMonths;
};