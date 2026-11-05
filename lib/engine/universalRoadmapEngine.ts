import { query, queryOne } from '../db.js';
import type { CareerRole, Skill, Roadmap, RoadmapTask } from '../types.js';

export interface DomainMethodConfig {
  method: string;
  badge: string;
  deliverable_type: string;
  practice_label: string;
  simulation_label: string;
  eval_label: string;
}

export const DOMAIN_METHOD_CONFIG: Record<string, DomainMethodConfig> = {
  'Technology and IT': {
    method: 'coding',
    badge: 'Code Implementation',
    deliverable_type: 'Git Repository / Script',
    practice_label: 'Coding Exercises & Unit Tests',
    simulation_label: 'Software Architecture Build',
    eval_label: 'Code Execution & Test Cases',
  },
  'Artificial Intelligence & Machine Learning': {
    method: 'coding',
    badge: 'Model & Pipeline Dev',
    deliverable_type: 'Jupyter Notebook & Weights',
    practice_label: 'Tensor / Data Wrangling Drills',
    simulation_label: 'Predictive Pipeline Deployment',
    eval_label: 'Model Accuracy & Validation',
  },
  'Data Science & Analytics': {
    method: 'coding',
    badge: 'SQL & Data Pipeline',
    deliverable_type: 'SQL Script & Tableau Dashboard',
    practice_label: 'Statistical SQL Queries',
    simulation_label: 'Exploratory Dataset Investigation',
    eval_label: 'Query Performance & Insights',
  },
  'Commerce, Finance & Banking': {
    method: 'financial_model',
    badge: 'Financial Modeling & Audit',
    deliverable_type: 'Excel Workbook / Financial Model',
    practice_label: 'Ledger Balancing & Ratio Drills',
    simulation_label: '3-Statement Valuation Model',
    eval_label: 'Formula Integrity & Financial Ratios',
  },
  'Arts, Humanities & Social Sciences': {
    method: 'research_essay',
    badge: 'Scholarly Research & Analysis',
    deliverable_type: 'Analytical Monograph / Editorial',
    practice_label: 'Source Critique & Historiography',
    simulation_label: 'Investigative Research Report',
    eval_label: 'Argumentative Rigor & Source Citation',
  },
  'Business, Management & Consulting': {
    method: 'business_case',
    badge: 'Case Study & Strategy Deck',
    deliverable_type: 'PRD / Strategic Executive Deck',
    practice_label: 'Market Sizing & 5 Forces Analysis',
    simulation_label: 'Consulting Case Bottleneck Audit',
    eval_label: 'Business Logic & Unit Economics',
  },
  'Healthcare, Medicine & Life Sciences': {
    method: 'clinical_case',
    badge: 'Biomedical Case Analysis',
    deliverable_type: 'Clinical Protocol / Data Paper',
    practice_label: 'Diagnostic Heuristics & Ethics',
    simulation_label: 'Epidemiological Protocol Simulation',
    eval_label: 'Scientific Validity & Ethical Standards',
  },
  'Core Engineering': {
    method: 'engineering_calc',
    badge: 'Technical Calculations & CAD',
    deliverable_type: 'Engineering Calculation Sheet / CAD',
    practice_label: 'Thermodynamic & Stress Calculations',
    simulation_label: 'Component Parametric Design',
    eval_label: 'Tolerance & Factor of Safety Check',
  },
  'Cybersecurity & Information Security': {
    method: 'security_audit',
    badge: 'Threat Hunting & Defense',
    deliverable_type: 'Vulnerability Assessment Report',
    practice_label: 'Log Parsing & Packet Analysis',
    simulation_label: 'Zero-Trust Penetration Audit',
    eval_label: 'Threat Identification & Remediation',
  },
  'Cloud, DevOps & Systems Engineering': {
    method: 'cloud_infra',
    badge: 'Infrastructure as Code',
    deliverable_type: 'Terraform / Kubernetes Manifest',
    practice_label: 'CI/CD Pipeline Configurations',
    simulation_label: 'High-Availability Cluster Deployment',
    eval_label: 'Manifest Validation & Reliability',
  },
  'Law & Legal Services': {
    method: 'legal_draft',
    badge: 'Statutory Analysis & Drafting',
    deliverable_type: 'Contract Clause / Appellate Brief',
    practice_label: 'IRAC Case Briefing Exercises',
    simulation_label: 'Commercial Contract Negotiation Brief',
    eval_label: 'Precedent Alignment & Statutory Rigor',
  },
  'Education, Teaching & Academic Research': {
    method: 'curriculum_plan',
    badge: 'Pedagogy & Curriculum Design',
    deliverable_type: 'Instructional Unit Plan',
    practice_label: "Bloom's Taxonomy Rubric Design",
    simulation_label: 'Multi-Week Curriculum Framework',
    eval_label: 'Pedagogical Clarity & Rubric Balance',
  },
  'Government, Civil Services & Public Policy': {
    method: 'syllabus_prep',
    badge: 'Public Policy & GS Syllabus',
    deliverable_type: 'Policy Brief & Examination Script',
    practice_label: 'General Studies Essay Structuring',
    simulation_label: 'District Governance Action Plan',
    eval_label: 'Constitutional Compliance & Feasibility',
  },
  'Psychology & Behavioral Sciences': {
    method: 'psychology_case',
    badge: 'Behavioral Assessment & Nudge',
    deliverable_type: 'Case Conceptualization Protocol',
    practice_label: 'Cognitive Heuristic Diagnostics',
    simulation_label: 'Organizational Culture Intervention',
    eval_label: 'Evidence-Based Rationale & Ethics',
  },
  'Design, Media & Creative Arts': {
    method: 'design_brief',
    badge: 'Design Brief & Prototype',
    deliverable_type: 'Figma Prototype & Design Spec',
    practice_label: 'Typography & Auto-Layout Drills',
    simulation_label: 'Multi-Screen Design System',
    eval_label: 'Accessibility, Usability & Hierarchy',
  },
  'Hospitality, Tourism & Event Management': {
    method: 'hospitality_ops',
    badge: 'Operations & Guest Experience',
    deliverable_type: 'Standard Operating Procedure (SOP)',
    practice_label: 'Yield Management Rate Calculations',
    simulation_label: 'Luxury Resort Conference Run of Show',
    eval_label: 'Operational Efficiency & Hospitality SLA',
  },
  'Agriculture, Environment & Sustainability': {
    method: 'field_analysis',
    badge: 'Agro-Ecological & ESG Audit',
    deliverable_type: 'GHG Protocol Audit & Soil Plan',
    practice_label: 'Nutrient Balance & Carbon Ledger',
    simulation_label: 'Regenerative Farm Transition Plan',
    eval_label: 'Scientific Accuracy & Sustainability ROI',
  },
  'Entrepreneurship & Startups': {
    method: 'startup_pitch',
    badge: 'Venture Model & MVP Brief',
    deliverable_type: 'Investor Deck & Unit Economics',
    practice_label: 'Customer Interview Synthesis',
    simulation_label: 'Go-to-Market Strategy & Financial Plan',
    eval_label: 'Problem-Solution Fit & Traction Model',
  },
};

export const DEFAULT_METHOD_CONFIG: DomainMethodConfig = {
  method: 'theory',
  badge: 'Core Professional Milestone',
  deliverable_type: 'Practical Deliverable Document',
  practice_label: 'Practical Application Exercises',
  simulation_label: 'Role Capstone Simulation',
  eval_label: 'Evaluation Rubrics',
};

export function getDomainConfig(domain: string = 'Technology'): DomainMethodConfig {
  const norm = domain.trim().toLowerCase();
  for (const [key, cfg] of Object.entries(DOMAIN_METHOD_CONFIG)) {
    if (key.toLowerCase() === norm || norm.includes(key.toLowerCase()) || key.toLowerCase().includes(norm)) {
      return cfg;
    }
  }
  return DEFAULT_METHOD_CONFIG;
}

export const DOMAIN_SPECIALIZATION_BRANCHES: Record<string, Array<{ id: string; title: string; focus: string }>> = {
  'Technology and IT': [
    { id: 'cloud_microservices', title: 'Cloud Microservices & Distributed Architecture', focus: 'Docker, Kubernetes, Event-Driven Architecture, High Availability' },
    { id: 'fullstack_modern', title: 'Full Stack Modern Systems & Real-time Web', focus: 'Modern Frontend Frameworks, WebSockets, REST/gRPC APIs, Database Indexing' },
    { id: 'qa_automation', title: 'Enterprise Quality Assurance & Chaos Engineering', focus: 'End-to-End Test Automation, Load Testing, CI/CD Integration' },
  ],
  'Commerce, Finance & Banking': [
    { id: 'corp_audit', title: 'Corporate Audit, Taxation & IFRS Reporting', focus: 'Ind AS / IFRS compliance, Statutory Audit Checklists, Corporate Tax Planning' },
    { id: 'investment_banking', title: 'Investment Banking, M&A & Private Equity', focus: 'Discounted Cash Flow, Comparable Companies, LBO Modeling, Pitch Decks' },
    { id: 'wealth_portfolio', title: 'Wealth Management & Algorithmic Trading', focus: 'Modern Portfolio Theory, Risk-Adjusted Returns (Sharpe/Sortino), Quantitative Screening' },
  ],
  'Design, Media & Creative Arts': [
    { id: 'design_systems', title: 'Enterprise Design Systems & UI Architecture', focus: 'Design Tokens, Component Libraries, Accessibility (WCAG AAA), Developer Handoff' },
    { id: 'user_research', title: 'Advanced User Research & Product Discovery', focus: 'Usability Lab Testing, Ethnographic Studies, Information Architecture, Heuristic Audits' },
    { id: 'motion_interaction', title: 'Micro-Interactions & 3D Visual Experience', focus: 'Framer Motion, Spline 3D, Micro-animations, Spatial Canvas Interaction' },
  ],
};

export function getSpecializationBranches(domain: string = 'Technology'): Array<{ id: string; title: string; focus: string }> {
  for (const [dName, branches] of Object.entries(DOMAIN_SPECIALIZATION_BRANCHES)) {
    if (dName.toLowerCase() === domain.toLowerCase() || domain.toLowerCase().includes(dName.toLowerCase())) {
      return branches;
    }
  }
  return [
    { id: 'core_specialization', title: 'Core Professional Mastery', focus: 'Foundational principles, execution standards, and industry requirements' },
    { id: 'advanced_analytics', title: 'Advanced Analytical & Strategic Execution', focus: 'High-leverage decision models, technical tooling, and optimization' },
  ];
}

export function synthesizeMilestoneWorkspace(params: {
  title: string;
  phaseNumber: number;
  phaseName: string;
  role: CareerRole;
  domainCfg: DomainMethodConfig;
  resources: any[];
  weekNumber: number;
}): Record<string, any> {
  const { title, phaseNumber, phaseName, role, domainCfg, resources, weekNumber } = params;

  return {
    method: domainCfg.method,
    badge: domainCfg.badge,
    deliverable_type: domainCfg.deliverable_type,
    study: {
      key_concepts: [
        `Core principles and standard architecture of ${title}`,
        `Industrial standards, toolchain conventions, and edge-case handling in ${role.domain || 'Technology'}`,
        `Quality assurance, reliability benchmarks, and maintainability metrics`,
      ],
      curated_reading: (resources || []).slice(0, 3).map((r: any) => ({
        title: r.title || 'Official Documentation Guide',
        url: r.url || 'https://developer.mozilla.org',
        provider: r.provider || 'RoadmapIQ Official Library',
        format: r.format || 'documentation',
      })),
      pro_tip: `Always document trade-offs and architectural assumptions when implementing ${title}.`,
    },
    practice: {
      beginner: `Write an introductory script or analysis verifying basic operations of ${title}.`,
      intermediate: `Implement an end-to-end workflow addressing edge-cases and boundary validations for ${title}.`,
      advanced: `Benchmark, stress-test, and deploy a production-ready module demonstrating mastery of ${title}.`,
    },
    build: {
      simulation_title: `${role.title} Milestone Project #${weekNumber}`,
      description: `Synthesize ${title} concepts into a verified artifact ready for your professional portfolio.`,
      deliverable: `${title} ${domainCfg.deliverable_type}`,
      acceptance_criteria: [
        'All automated test cases or calculation rubrics pass without warnings',
        'Repository or document is clearly structured with descriptive README or executive summary',
        'Demonstrates clean separation of concerns and industry-standard design principles',
      ],
    },
    evaluate: {
      rubric: [
        { criterion: 'Foundational Accuracy', weight: 40, description: 'Core principles correctly implemented without conceptual flaws.' },
        { criterion: 'Execution Quality', weight: 35, description: 'Readable, well-documented, and resilient architecture.' },
        { criterion: 'Portfolio Readiness', weight: 25, description: 'Clear deliverable suitable for interview verification.' },
      ],
      checkpoint_quiz: [
        {
          question: `What is the primary architectural purpose of ${title}?`,
          options: [
            `To deliver scalable, resilient, and verifiable outcomes in ${role.title}`,
            'To bypass standard industry quality verification',
            'To increase complexity without operational benefit',
            'To replace all team collaboration',
          ],
          correct: 0,
        },
      ],
    },
  };
}

/**
 * Universal 6-Phase Roadmap Generator
 * Creates personalized roadmaps across all 259+ careers and 18 domains with ZERO assessment gate.
 */
export async function generateUniversalCareerRoadmap(params: {
  roleId: number;
  profileId: number;
  weeklyHours?: number;
  targetDurationWeeks?: number;
  preferredFormat?: string;
}): Promise<Roadmap> {
  const { roleId, profileId, weeklyHours = 12, targetDurationWeeks = 12, preferredFormat = 'mixed' } = params;

  // 1. Fetch Role
  const role = await queryOne('SELECT * FROM career_roles WHERE id = $1', [roleId]);
  if (!role) {
    throw new Error(`Career role #${roleId} not found`);
  }

  // 2. Fetch Skills required for role
  let requirements = (await query('SELECT r.*, s.name, s.slug, s.category FROM role_skill_requirements r JOIN skills s ON r.skill_id = s.id WHERE r.role_id = $1 ORDER BY r.required_proficiency ASC', [roleId])).rows;

  if (requirements.length === 0) {
    // Fallback: pick general domain skills
    requirements = (await query('SELECT id as skill_id, name, slug, category, 1 as min_proficiency, \'core\' as importance FROM skills LIMIT 8')).rows;
  }

  const domainCfg = getDomainConfig(role.domain || 'Technology');
  const specializations = getSpecializationBranches(role.domain || 'Technology');
  const activeBranch = specializations[0]?.id || 'core';

  // 3. Insert Roadmap
  const now = new Date().toISOString();
  const summaryText = `Personalized ${targetDurationWeeks}-week ${role.title} learning journey in ${role.domain || 'Technology'}. Structured across 6 progressive phases from foundations to practical capstone deliverables.`;

  const rmInsertSql = `
    INSERT INTO roadmaps (
      profile_id, role_id, target_duration_weeks, weekly_hours,
      readiness_score, total_estimated_hours, is_over_capacity, capacity_warning, summary, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `;

  await query(rmInsertSql, [
    profileId,
    roleId,
    targetDurationWeeks,
    weeklyHours,
    50, // Initial base readiness
    targetDurationWeeks * weeklyHours,
    false,
    null,
    summaryText,
    now,
    now,
  ]);

  const newRoadmap = await queryOne('SELECT * FROM roadmaps WHERE profile_id = $1 AND role_id = $2 ORDER BY id DESC LIMIT 1', [profileId, roleId]);

  // 4. Generate Structured 6-Phase Tasks
  const phases = [
    { num: 1, name: 'Phase 1: Foundation', category: 'LEARN', quest: 'skill_quest' },
    { num: 2, name: 'Phase 2: Core Knowledge', category: 'LEARN', quest: 'skill_quest' },
    { num: 3, name: 'Phase 3: Skill Development', category: 'PRACTICE', quest: 'skill_quest' },
    { num: 4, name: 'Phase 4: Practical Application', category: 'BUILD', quest: 'weekly_mission' },
    { num: 5, name: `Phase 5: Advanced Specialization (${activeBranch.replace(/_/g, ' ').toUpperCase()})`, category: 'BUILD', quest: 'epic_project' },
    { num: 6, name: 'Phase 6: Career Preparation', category: 'PREPARE', quest: 'boss' },
  ];

  const totalTasksNeeded = Math.max(8, Math.min(24, targetDurationWeeks * 2));
  const tasksPerPhase = Math.max(1, Math.floor(totalTasksNeeded / phases.length));
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  let currentTaskIdx = 0;

  for (const phase of phases) {
    const pNum = phase.num;
    const pName = phase.name;

    for (let pTaskIdx = 0; pTaskIdx < tasksPerPhase; pTaskIdx++) {
      const req = requirements[currentTaskIdx % requirements.length];
      currentTaskIdx++;

      const weekNum = Math.min(targetDurationWeeks, Math.ceil((currentTaskIdx / totalTasksNeeded) * targetDurationWeeks));
      const dayName = daysOfWeek[pTaskIdx % daysOfWeek.length];

      let taskTitle = `${req?.name || role.title} Mastery`;
      if (pNum === 4) taskTitle = `${role.title} Practical Application Project`;
      if (pNum === 5) taskTitle = `${role.title} Advanced Specialization Milestone`;
      if (pNum === 6) taskTitle = `${role.title} Interview & Career Placement Preparation`;

      const workspace = synthesizeMilestoneWorkspace({
        title: taskTitle,
        phaseNumber: pNum,
        phaseName: pName,
        role,
        domainCfg,
        resources: [],
        weekNumber: weekNum,
      });

      const taskInsertSql = `
        INSERT INTO roadmap_tasks (
          roadmap_id, skill_id, phase_number, phase_name, week_number, order_in_week,
          day_of_week, day_number, activity_category, quest_type, title, skill_category,
          task_type, description, estimated_hours, actual_hours_spent, priority, status,
          is_completed, completion_criteria, deliverable, xp_reward, mission_title,
          activity_method, specialization_branch, workspace_data, practice_exercises, quiz_data
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
        )
      `;

      await query(taskInsertSql, [
        newRoadmap.id,
        req?.skill_id || null,
        pNum,
        pName,
        weekNum,
        pTaskIdx + 1,
        dayName,
        (pTaskIdx % 5) + 1,
        phase.category,
        phase.quest,
        taskTitle,
        req?.category || role.domain || 'Technology',
        pNum >= 4 ? 'project' : 'theory',
        `Master ${taskTitle} using domain-tailored ${domainCfg.badge} methods. Build practical artifacts and verify competency.`,
        Math.max(2, Math.floor(weeklyHours / tasksPerPhase)),
        0.0,
        pNum === 1 || pNum === 4 ? 'High' : 'Medium',
        'not_started',
        false,
        `Complete recommended study materials, practice exercises, and verify the ${domainCfg.deliverable_type}.`,
        `${taskTitle} ${domainCfg.deliverable_type}`,
        pNum >= 4 ? 100 : 50,
        `${pName} • Mission #${currentTaskIdx}`,
        domainCfg.method,
        activeBranch,
        workspace,
        [workspace.practice.beginner, workspace.practice.intermediate, workspace.practice.advanced],
        workspace.evaluate.checkpoint_quiz,
      ]);
    }
  }

  // Record initial ProgressSnapshot
  const todayStr = new Date().toISOString().split('T')[0];
  await query(
    `INSERT INTO progress_snapshots (
      profile_id, roadmap_id, recorded_date, completed_tasks_count, total_tasks_count,
      completion_percentage, readiness_score, hours_spent
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [profileId, newRoadmap.id, todayStr, 0, currentTaskIdx, 0.0, 50.0, 0.0]
  );

  return newRoadmap;
}
