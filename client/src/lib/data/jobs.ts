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