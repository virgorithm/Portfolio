// Static data for now. Later, replace these with fetch() calls to your database/API.

export const skills = [
  { group: 'Design', items: ['UI design', 'Wireframing', 'Prototyping', 'Design systems', 'Visual hierarchy', 'Typography'] },
  { group: 'Research', items: ['User interviews', 'User flows', 'Personas', 'Usability testing'] },
  { group: 'Tools', items: ['Figma', 'FigJam', 'Canva', 'Notion'] },
  { group: 'Handoff', items: ['HTML & CSS basics', 'React basics', 'Responsive layouts'] },
]

export const projects = [
  {
    id: 1,
    title: 'Campus Canteen App',
    type: 'Mobile app',
    description: 'A pre-order app that lets students skip the lunch line. Covers the ordering flow, menu browsing, and pickup tracking.',
    tags: ['Figma', 'Prototype', 'User flows'],
  },
  {
    id: 2,
    title: 'Study Buddy Dashboard',
    type: 'Web app',
    description: 'A planner that puts deadlines, notes, and study sessions on one screen so nothing slips.',
    tags: ['Figma', 'Dashboard', 'Design system'],
  },
  {
    id: 3,
    title: 'Local Bakery Website',
    type: 'Landing page',
    description: 'A responsive site for a neighborhood bakery with an easy-to-scan menu and a clear order button.',
    tags: ['Figma', 'Responsive', 'Branding'],
  },
  {
    id: 4,
    title: 'Budget Tracker Redesign',
    type: 'Case study',
    description: 'A redesign of a budgeting app based on five user interviews, focused on making first-time setup shorter.',
    tags: ['Research', 'Usability testing', 'UI design'],
  },
]

export const contact = {
  email: 'hello@example.com',
  location: 'Philippines',
  links: [
    { label: 'Figma', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'Instagram', href: '#' },
  ],
}
