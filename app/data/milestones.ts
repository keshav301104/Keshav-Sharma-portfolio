/* ------------------------------------------------------------------ *
 * Milestones, for Chapter VII (Wormhole), and how to reach you, for
 * Chapter VIII (Transmission).
 *
 * Edit freely: the chapter shows the milestones in this order, one at
 * a time, while the camera closes in on the wormhole.
 * ------------------------------------------------------------------ */

export type Milestone = {
  kicker: string // small line above the title
  title: string
  when?: string
  body: string
  link?: { href: string; label: string }
}

export const MILESTONES: Milestone[] = [
  {
    kicker: 'NASA Space Apps Challenge · Andhra Pradesh',
    title: 'Winner, Best Use of Science',
    when: 'State-level award',
    body: 'SeismoSearch finds quakes hidden in raw seismic recordings from the Moon and Mars, using STA/LTA signal detection, and maps where they happen.',
    link: { href: 'https://github.com/keshav301104/SeismoSearch', label: 'SeismoSearch source' },
  },
  {
    kicker: 'SEDS Aurora · the space club of VIT-AP',
    title: 'President',
    when: 'Jul 2025 – Present',
    body: 'Leading the research, tech, outreach and design teams, and running the club’s engineering workshops and hackathons.',
  },
  {
    kicker: 'VIT-AP University',
    title: 'B.Tech, Computer Science',
    when: '2023 – 2027 · Data Analytics · CGPA 8.2',
    body: 'Where the fundamentals came from: algorithms, systems, statistics and machine learning, alongside everything above.',
  },
  {
    kicker: 'Paper trail',
    title: 'Certificates',
    body: 'Courses, hackathons and recognitions, collected in one file.',
    link: { href: '/certificates.pdf', label: 'Open certificates' },
  },
]

export const CONTACT = {
  email: 'Keshavprabhakar449@gmail.com',
  /** Your Google Calendar booking page. Until it's filled in, the button opens an email instead. */
  booking: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1xtE3z4LMcJ5x0-ma8dQSs-vD5jRPK44hqwoQWX4Lk0-rVI8XzaYUxEK_FQQabeO1-j4NCI8gb',
  resume: '/resume-ai.pdf',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/keshavsharma301104/' },
    { label: 'GitHub', href: 'https://github.com/keshav301104' },
  ],
}