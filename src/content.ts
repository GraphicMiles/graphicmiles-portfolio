export type ProjectId = 'forgeai' | 'nearspace' | 'chan'

export type Project = {
  id: ProjectId
  number: string
  title: string
  status: string
  summary: string
  description: string
  stack: string
  role: string
  platform: string
  link: string
  tags: string[]
}

export const profile = {
  name: 'Raji Farouq Adewunmi',
  alias: 'Graphic Miles',
  email: 'rfarouq69@gmail.com',
  github: 'https://github.com/GraphicMiles',
  location: 'Lagos, NG',
}

export const projects: Project[] = [
  {
    id: 'forgeai',
    number: '01',
    title: 'Toddler / ForgeAI',
    status: 'Live',
    summary: 'A local-first coding assistant that keeps the model on the device.',
    description: 'Direct CPU llama.cpp inference via JNI, token streaming, CodeMirror editor, SAF workspace, SKILL.md import, and approval-gated patches. No cloud dependency.',
    stack: 'React · Capacitor · JNI · llama.cpp · CodeMirror',
    role: 'Product design · mobile engineering',
    platform: 'Android · local-first',
    link: 'https://toddler-kappa.vercel.app',
    tags: ['On-device LLM', 'GGUF', 'JNI', 'RAG'],
  },
  {
    id: 'nearspace',
    number: '02',
    title: 'Nearspace',
    status: 'Live',
    summary: 'A proximity-first network for finding the right people, nearby.',
    description: 'A professional network for Nigerian creators with nearby map and grid, feed, bounties, orbits, footprints, and groups. Built for mobile-first use on Nigerian networks.',
    stack: 'React · Firebase · Leaflet · Geohash · PWA',
    role: 'Product design · frontend · architecture',
    platform: 'Installable PWA · mobile first',
    link: 'https://nearspace.com.ng',
    tags: ['Proximity', 'Geohash', 'Realtime DB', 'Offline'],
  },
  {
    id: 'chan',
    number: '03',
    title: 'Chan — Watch Together',
    status: 'Live',
    summary: 'A watch party where playback, presence, and conversation stay in one room.',
    description: 'Realtime synchronized watch parties around YouTube with chat, LiveKit screen share, and moderator controls. Packaged for Android with Capacitor.',
    stack: 'React · Firebase · LiveKit · Capacitor',
    role: 'Product design · realtime engineering',
    platform: 'Web app · Android APK',
    link: 'https://chan-yz3p.vercel.app',
    tags: ['Realtime', 'LiveKit', 'Presence', 'Android'],
  },
]

export const principles = [
  'Make it correct. Then fast. Then beautiful.',
  'Offline-first beats online-only when the context demands it.',
  'Realtime is a feature, not a demo.',
  'The best abstraction is the one you can delete.',
  'Ship to one user before pitching to one hundred.',
]

export const tools = ['React', 'TypeScript', 'Firebase', 'Supabase', 'LiveKit', 'Leaflet', 'Capacitor', 'Three.js', 'GSAP']

export const process = [
  ['01', 'Frame the problem', 'Understand the context, constraints, and the person who needs the product to work.'],
  ['02', 'Make the system legible', 'Prototype the interaction, model the data, and make trade-offs visible early.'],
  ['03', 'Ship a useful loop', 'Build a small version, test it on real devices, then earn the next release.'],
] as const
