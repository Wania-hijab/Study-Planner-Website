// ===== Data =====
const skillGroups = [
  {
    icon: 'code',
    title: 'Programming',
    items: [
      ['Java', 85],
      ['C++', 80],
      ['Python', 75],
      ['JavaScript', 70]
    ]
  },

  {
    icon: 'palette',
    title: 'Web & Design',
    items: [
      ['HTML / CSS', 90],
      ['Responsive UI', 80],
      ['Tailwind', 70],
      ['UI Basics', 65]
    ]
  },

  {
    icon: 'database',
    title: 'Tools & Concepts',
    items: [
      ['MySQL', 75],
      ['Git & GitHub', 80],
      ['DSA', 78],
      ['OOP', 85]
    ]
  },
];

const services = [
  {
    n:'01',
    icon:'code',
    title:'Web Development',
    desc:'Clean, responsive websites built with modern HTML, CSS, and JavaScript.'
  },

  {
    n:'02',
    icon:'palette',
    title:'UI / UX Design',
    desc:'Simple, intuitive user experiences that look great on any device.'
  },

  {
    n:'03',
    icon:'database',
    title:'Software Development',
    desc:'Desktop and console apps in Java, C++ and Python with clean architecture.'
  },

  {
    n:'04',
    icon:'brain',
    title:'Problem Solving',
    desc:'DSA-driven thinking applied to real algorithmic challenges.'
  },

  {
    n:'05',
    icon:'wrench',
    title:'Database Design',
    desc:'Schema design, queries and integrations using MySQL.'
  },

  {
    n:'06',
    icon:'users',
    title:'Team Collaboration',
    desc:'Comfortable working with Git, GitHub and agile workflows.'
  },
];

const projects = [
  {
    title:'Library Management System',
    tech:'Java • Swing • MySQL',
    desc:'Desktop GUI to manage books, members and borrowing records with file handling.',
    github:'https://github.com/mahnoorahmer'
  },

  {
    title:'Student Management System',
    tech:'C++ • OOP • File I/O',
    desc:'Console app to add, update, search and delete student records efficiently.',
    github:'https://github.com/mahnoorahmer'
  },

  {
    title:'Personal Portfolio Website',
    tech:'HTML • CSS • JS',
    desc:'Responsive portfolio site to showcase projects and skills with a clean design.',
    github:'https://github.com/mahnoorahmer'
  },

  {
    title:'To-Do List Web App',
    tech:'JavaScript • LocalStorage',
    desc:'Interactive task manager with persistent storage and a polished UI.',
    github:'https://github.com/mahnoorahmer'
  },
];

const experience = [
  {
    date:'2024 — Present',
    title:'Freelance Projects',
    org:'Self · Remote'
  },

  {
    date:'2023 — 2024',
    title:'University Programming Contest',
    org:'Participant'
  },

  {
    date:'2023',
    title:'Web Development Practice',
    org:'Personal Projects'
  },
];

const education = [
  {
    date:'2022 — Present',
    title:'BS Computer Science',
    org:'University, Lahore, Pakistan'
  },

  {
    date:'Fall 2022',
    title:"Dean's Merit List",
    org:'Academic Achievement'
  },

  {
    date:'2022',
    title:'Higher Secondary (Pre-Engineering)',
    org:'Lahore, Pakistan'
  },
];

const certs = [
  {
    title:'Python Programming',
    org:'Online Certification · 2024'
  },

  {
    title:'Responsive Web Design',
    org:'freeCodeCamp · 2023'
  },

  {
    title:'Database & SQL',
    org:'Coursework · 2024'
  },

  {
    title:'Data Structures & Algorithms',
    org:'University · 2024'
  },
];

// ===== Helper =====
const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

// ===== Skills =====
const skillsGrid = document.getElementById('skillsGrid');

skillGroups.forEach(g => {

  const rows = g.items.map(([n,l]) => `
    <div class="skill-row">
      <div class="top">
        <span>${n}</span>
        <span>${l}%</span>
      </div>

      <div class="bar">
        <div data-w="${l}" style="width:0"></div>
      </div>
    </div>
  `).join('');

  skillsGrid.appendChild(el(`
    <div class="skill-card">

      <div class="skill-card-head">
        <div class="skill-icon">
          <i class="icon-${g.icon}"></i>
        </div>

        <h3>${g.title}</h3>
      </div>

      ${rows}

    </div>
  `));
});

// ===== Services =====
const servicesGrid = document.getElementById('servicesGrid');

services.forEach((s, i) => {

  servicesGrid.appendChild(el(`
    <div class="service-card ${i===0 ? 'featured' : ''}">

      <div class="num">${s.n}</div>

      <i class="svc-icon icon-${s.icon}"></i>

      <h3>${s.title}</h3>

      <p>${s.desc}</p>

      <div class="arrow">
        <i class="icon-arrow-up-right"></i>
      </div>

    </div>
  `));

});

// ===== Projects =====
const projectsGrid = document.getElementById('projectsGrid');

projects.forEach(p => {

  projectsGrid.appendChild(el(`
    <article class="project-card">

      <p class="project-tech">${p.tech}</p>

      <h3>${p.title}</h3>

      <p>${p.desc}</p>

      <a class="project-link" href="${p.github}" target="_blank">
        View on GitHub
        <i class="icon-external-link"></i>
      </a>

    </article>
  `));

});

// ===== Resume =====
const resumeGrid = document.getElementById('resumeGrid');

[
  {
    heading:'Experience',
    icon:'briefcase',
    items:experience
  },

  {
    heading:'Education',
    icon:'graduation-cap',
    items:education
  },
]

.forEach(b => {

  const items = b.items.map(t => `
    <div class="tl-item">

      <p class="tl-date">${t.date}</p>

      <h4>${t.title}</h4>

      <p>${t.org}</p>

    </div>
  `).join('');

  resumeGrid.appendChild(el(`
    <div class="resume-card">

      <div class="resume-head">

        <div class="skill-icon">
          <i class="icon-${b.icon}"></i>
        </div>

        <h3>${b.heading}</h3>

      </div>

      <div class="timeline">
        ${items}
      </div>

    </div>
  `));

});

// ===== Certificates =====
const certGrid = document.getElementById('certGrid');

certs.forEach(c => {

  certGrid.appendChild(el(`
    <div class="cert-card">

      <i class="icon-award"></i>

      <h4>${c.title}</h4>

      <p class="org">${c.org}</p>

    </div>
  `));

});

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');

const stored = localStorage.getItem('theme');

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

let dark = stored ? stored === 'dark' : prefersDark;

applyTheme();

themeToggle.addEventListener('click', () => {

  dark = !dark;

  applyTheme();

  localStorage.setItem('theme', dark ? 'dark' : 'light');

});

function applyTheme() {

  document.documentElement.classList.toggle('dark', dark);

  themeToggle.innerHTML = dark
    ? '<i class="icon-sun"></i>'
    : '<i class="icon-moon"></i>';
}

// ===== Reveal on Scroll =====
const io = new IntersectionObserver((entries) => {

  entries.forEach(e => {

    if (e.isIntersecting) {

      e.target.classList.add('visible');

      e.target
        .querySelectorAll('.bar > div[data-w]')
        .forEach(b => b.style.width = b.dataset.w + '%');

      io.unobserve(e.target);
    }

  });

}, {
  threshold: 0.1
});

document
  .querySelectorAll('.reveal')
  .forEach(s => io.observe(s));