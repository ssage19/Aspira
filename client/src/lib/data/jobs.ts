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
        skillRequirements: { technical: 40, intelligence: 50 },
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
        skillRequirements: { technical: 55, intelligence: 60 },
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
        skillRequirements: { technical: 70, intelligence: 70, leadership: 50 },
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
        skillRequirements: { technical: 80, intelligence: 75, leadership: 65 },
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
        skillRequirements: { technical: 90, intelligence: 85, leadership: 80 },
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
        skillRequirements: { intelligence: 60, technical: 40 },
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
        skillRequirements: { intelligence: 70, technical: 55 },
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
        skillRequirements: { intelligence: 80, technical: 70 },
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
        skillRequirements: { intelligence: 85, technical: 80, leadership: 60 },
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
        skillRequirements: { intelligence: 90, technical: 85, leadership: 80 },
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
        skillRequirements: { intelligence: 55, technical: 40 },
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
        skillRequirements: { intelligence: 65, technical: 50 },
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
        skillRequirements: { intelligence: 75, technical: 60, leadership: 40 },
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
        skillRequirements: { intelligence: 85, technical: 70, leadership: 60 },
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
        skillRequirements: { intelligence: 90, technical: 80, leadership: 80 },
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
        skillRequirements: { intelligence: 50, technical: 35 },
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
        skillRequirements: { intelligence: 60, technical: 45 },
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
        skillRequirements: { intelligence: 70, technical: 55, leadership: 40 },
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
        skillRequirements: { intelligence: 80, technical: 65, leadership: 60 },
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
        skillRequirements: { intelligence: 85, technical: 75, leadership: 80 },
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
        skillRequirements: { intelligence: 70, technical: 60 },
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
        skillRequirements: { intelligence: 80, technical: 70, charisma: 60 },
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
        skillRequirements: { intelligence: 85, technical: 80, charisma: 65 },
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
        skillRequirements: { intelligence: 90, technical: 85, leadership: 75, charisma: 70 },
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
        skillRequirements: { intelligence: 95, technical: 90, leadership: 85, charisma: 75 },
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
        skillRequirements: { technical: 50, charisma: 55 },
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
        skillRequirements: { technical: 60, charisma: 65, leadership: 50 },
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
        skillRequirements: { technical: 70, charisma: 70, intelligence: 65 },
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
        skillRequirements: { technical: 75, charisma: 75, leadership: 70, intelligence: 70 },
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
        skillRequirements: { technical: 80, charisma: 80, leadership: 80, intelligence: 75 },
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
        skillRequirements: { charisma: 50, intelligence: 40 },
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
        skillRequirements: { charisma: 60, intelligence: 55, creativity: 45 },
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
        skillRequirements: { charisma: 70, intelligence: 65, creativity: 55, leadership: 50 },
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
        skillRequirements: { charisma: 75, intelligence: 70, creativity: 60, leadership: 65 },
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
        skillRequirements: { charisma: 80, intelligence: 75, leadership: 80 },
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
        skillRequirements: { intelligence: 70, charisma: 50 },
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
        skillRequirements: { intelligence: 80, charisma: 60, creativity: 55 },
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
        skillRequirements: { intelligence: 85, charisma: 65, creativity: 70 },
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
        skillRequirements: { intelligence: 90, charisma: 70, creativity: 80, leadership: 60 },
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
        skillRequirements: { intelligence: 95, charisma: 75, leadership: 80 },
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
        skillRequirements: { creativity: 55, technical: 40 },
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
        skillRequirements: { creativity: 65, technical: 50, charisma: 45 },
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
        skillRequirements: { creativity: 75, technical: 60, charisma: 55 },
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
        skillRequirements: { creativity: 85, technical: 70, leadership: 60, charisma: 65 },
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
        skillRequirements: { creativity: 90, leadership: 75, charisma: 75 },
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
        skillRequirements: { creativity: 50, intelligence: 45 },
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
        skillRequirements: { creativity: 60, intelligence: 55 },
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
        skillRequirements: { creativity: 70, intelligence: 65, charisma: 50 },
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
        skillRequirements: { creativity: 80, intelligence: 75, leadership: 60 },
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
        skillRequirements: { creativity: 85, intelligence: 80, leadership: 75, charisma: 70 },
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
        skillRequirements: { charisma: 50, creativity: 45 },
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
        skillRequirements: { charisma: 60, creativity: 55, intelligence: 50 },
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
        skillRequirements: { charisma: 70, creativity: 65, intelligence: 60, leadership: 50 },
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
        skillRequirements: { charisma: 80, creativity: 75, leadership: 70 },
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
        skillRequirements: { charisma: 85, creativity: 80, leadership: 80, intelligence: 75 },
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
        skillRequirements: { intelligence: 60, charisma: 50 },
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
        skillRequirements: { intelligence: 70, charisma: 60, technical: 55 },
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
        skillRequirements: { intelligence: 80, charisma: 70, leadership: 60 },
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
        skillRequirements: { intelligence: 85, charisma: 80, leadership: 75 },
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
        skillRequirements: { intelligence: 90, charisma: 85, leadership: 85 },
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
        skillRequirements: { intelligence: 70, charisma: 55 },
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
        skillRequirements: { intelligence: 75, charisma: 65 },
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
        skillRequirements: { intelligence: 85, charisma: 75, leadership: 60 },
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
        skillRequirements: { intelligence: 90, charisma: 80, leadership: 75 },
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
        skillRequirements: { intelligence: 95, charisma: 85, leadership: 85 },
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
        skillRequirements: { intelligence: 65, technical: 50 },
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
        skillRequirements: { intelligence: 75, technical: 60 },
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
        skillRequirements: { intelligence: 85, technical: 70, leadership: 50 },
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
        skillRequirements: { intelligence: 90, technical: 80, leadership: 65 },
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
        skillRequirements: { intelligence: 95, technical: 85, leadership: 80 },
        happinessImpact: 18,
        prestigeImpact: 50,
        timeCommitment: 60,
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