export const workstreams = [
  { owner: 'Sandeep', role: 'Foundation & integration', area: 'Routing, layout, shared types, reviews', branch: 'feature/sandeep-foundation-integration', status: 'Foundation preview' },
  { owner: 'Swapnil', role: 'Candidate flow', area: 'Resume upload, job description, analysis', branch: 'feature/swapnil-candidate-flow', status: 'Ready for implementation' },
  { owner: 'Ammar', role: 'Practice & feedback', area: 'Questions, answers, evaluation, history', branch: 'feature/ammar-practice-feedback', status: 'Ready for implementation' },
  { owner: 'Santosh', role: 'Supabase backend', area: 'Auth, migrations, RLS, storage, persistence', branch: 'feature/santosh-supabase-backend', status: 'Not connected' },
  { owner: 'Rishikesh', role: 'AI engine', area: 'Analysis, generation, answer evaluation', branch: 'feature/rishikesh-ai-engine', status: 'Not connected' },
  { owner: 'Nirmal Kumar', role: 'Quality assurance', area: 'Critical journey, regression, bug reports', branch: 'feature/nirmal-qa', status: 'Ready for implementation' },
  { owner: 'Vikram', role: 'Vercel & DevOps', area: 'Git integration, previews, environment scopes', branch: 'feature/vikram-vercel-deployment', status: 'Preview verification needed' },
  { owner: 'Shraddha', role: 'Product, UX & docs', area: 'Acceptance criteria, accessibility, demo', branch: 'feature/shraddha-product-ux-docs', status: 'Ready for implementation' },
] as const

export const journey = [
  { number: '01', title: 'Add your context', description: 'A resume and a target role. Preparation that starts with you.', owner: 'Swapnil', to: '/start', action: 'Candidate intake', icon: '↥' },
  { number: '02', title: 'Understand the match', description: 'See relevant evidence and skills that need more context.', owner: 'Swapnil + Rishikesh', to: '/preview/analysis', action: 'Match analysis', icon: '◎' },
  { number: '03', title: 'Practise with purpose', description: 'Work through questions grounded in your experience.', owner: 'Ammar + Rishikesh', to: '/preview/practice', action: 'Interview practice', icon: '⌘' },
  { number: '04', title: 'Know what to improve', description: 'Get structured feedback, then build on your next answer.', owner: 'Ammar + Rishikesh', to: '/preview/feedback', action: 'Answer feedback', icon: '↗' },
] as const
