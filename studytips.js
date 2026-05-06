// ── TIP DATA () ──────
const TIPS = [
  // FOCUS
  {
    id:1, cat:'focus', color:'blue', icon:'fa-brain', title:'Deep Focus Mode',
    short:'Eliminate distractions and study with full concentration for longer sessions.',
    detail:`<p><strong>Deep work</strong> means pushing your cognitive capabilities to their limit in a distraction-free environment.</p>
    <ul>
      <li>Turn off all notifications before you start.</li>
      <li>Use website blockers like Cold Turkey or Freedom.</li>
      <li>Set a specific start and end time for every session.</li>
      <li>Tell people around you that you're in a focus block.</li>
      <li>Aim for at least one 90-minute deep work block daily.</li>
    </ul>
    <p>Research shows it takes an average of <strong>23 minutes</strong> to regain focus after an interruption.</p>`
  },
  {
    id:2, cat:'focus', color:'purple', icon:'fa-mobile-screen', title:'Phone-Free Study',
    short:'Keep your phone in another room while studying to eliminate temptation.',
    detail:`<p>Your phone is the #1 enemy of deep focus. Even having it face-down on your desk reduces your cognitive capacity.</p>
    <ul>
      <li>Put your phone in a different room or drawer.</li>
      <li>Use apps like Forest or Flipd to lock your screen.</li>
      <li>Enable Do Not Disturb and tell contacts your study hours.</li>
      <li>Check messages only during scheduled breaks.</li>
    </ul>
    <p>Studies show students who studied without phones scored <strong>26% higher</strong> on tests.</p>`
  },
  {
    id:3, cat:'focus', color:'rose', icon:'fa-headphones', title:'Focus Music',
    short:'Use instrumental or lo-fi music to block noise and improve concentration.',
    detail:`<p>The right music creates a mental environment that reduces distraction and boosts mood.</p>
    <ul>
      <li>Try lo-fi hip hop, classical piano, or binaural beats.</li>
      <li>Avoid music with lyrics — your brain processes words and competes with reading.</li>
      <li>YouTube channels like "ChilledCow" or Spotify's "Deep Focus" playlist are great.</li>
      <li>Keep volume low — it should be background, not performance.</li>
    </ul>`
  },
  {
    id:4, cat:'focus', color:'green', icon:'fa-eye-slash', title:'Single-Tasking',
    short:'Focus on one task at a time — multitasking reduces quality and speed.',
    detail:`<p>Multitasking is a myth. Your brain switches rapidly between tasks, reducing efficiency by up to <strong>40%</strong>.</p>
    <ul>
      <li>Close all browser tabs unrelated to your current task.</li>
      <li>Write down distracting thoughts to address later.</li>
      <li>Use a physical "capture list" for ideas that pop up mid-session.</li>
      <li>Finish one topic completely before switching subjects.</li>
    </ul>`
  },
  // TIME
  {
    id:5, cat:'time', color:'blue', icon:'fa-clock', title:'Pomodoro Technique',
    short:'Study for 25 minutes, then take a 5-minute break. Repeat 4 times, then rest longer.',
    detail:`<p>The Pomodoro Technique was developed by Francesco Cirillo and is one of the most research-backed productivity methods.</p>
    <ul>
      <li>Set a timer for exactly 25 minutes and work on one task only.</li>
      <li>When the timer rings, stop — even mid-sentence — and take 5 minutes off.</li>
      <li>After 4 rounds, take a longer break (15-30 minutes).</li>
      <li>Use the Focus Timer on your Dashboard to track sessions.</li>
    </ul>`
  },
  {
    id:6, cat:'time', color:'violet', icon:'fa-list-check', title:'Daily Study Plan',
    short:'Write your tasks the night before so you start your day with clear direction.',
    detail:`<p>Planning the night before reduces morning decision fatigue and helps you hit the ground running.</p>
    <ul>
      <li>List your top 3 most important study tasks for tomorrow.</li>
      <li>Assign each task a time slot — be realistic.</li>
      <li>Use your Tasks page to track and tick them off.</li>
      <li>Review your plan each morning and adjust if needed.</li>
    </ul>`
  },
  {
    id:7, cat:'time', color:'purple', icon:'fa-hourglass-half', title:'Set Deadlines',
    short:"Give yourself personal deadlines earlier than the real ones — Parkinson's Law says work expands to fill time.",
    detail:`<p><strong>Parkinson's Law:</strong> "Work expands to fill the time allotted."</p>
    <ul>
      <li>Set personal deadlines 1-2 days before the real deadline.</li>
      <li>Use countdown timers to create urgency.</li>
      <li>Break large tasks into smaller milestones with their own deadlines.</li>
      <li>Share your deadlines with a friend for accountability.</li>
    </ul>`
  },
  {
    id:8, cat:'time', color:'orange', icon:'fa-calendar-check', title:'Time Blocking',
    short:'Assign specific hours of the day to specific subjects — treat them like appointments.',
    detail:`<p>Time blocking prevents the feeling of "I studied all day but got nothing done."</p>
    <ul>
      <li>Block 9-11am for your hardest subject when your energy is highest.</li>
      <li>Reserve evenings for lighter review or reading.</li>
      <li>Include buffer blocks for unexpected tasks.</li>
      <li>Protect your blocked time fiercely — reschedule, don't cancel.</li>
    </ul>`
  },
  // MEMORY
  {
    id:9, cat:'memory', color:'rose', icon:'fa-layer-group', title:'Spaced Repetition',
    short:'Review material at increasing intervals — today, tomorrow, next week, next month.',
    detail:`<p>Spaced repetition exploits the "spacing effect" — information reviewed at increasing intervals is retained far longer.</p>
    <ul>
      <li>Review new material the same day you learn it.</li>
      <li>Review again after 1 day, then 3 days, then 7 days, then 30 days.</li>
      <li>Use flashcard apps like Anki that automate the spacing schedule.</li>
      <li>Don't cram — it creates short-term memory that fades quickly.</li>
    </ul>`
  },
  {
    id:10, cat:'memory', color:'violet', icon:'fa-lightbulb', title:'Active Recall',
    short:'Close your notes and test yourself. Retrieving information is far more powerful than rereading.',
    detail:`<p>Active recall forces your brain to reconstruct information, which dramatically strengthens memory pathways.</p>
    <ul>
      <li>After reading a section, close the book and write everything you remember.</li>
      <li>Use flashcards — hide the answer and guess before flipping.</li>
      <li>Try the "blank page method": write a topic at the top and dump everything you know.</li>
    </ul>`
  },
  {
    id:11, cat:'memory', color:'blue', icon:'fa-pen', title:'Handwrite Notes',
    short:'Writing by hand forces your brain to process and summarise — far better than typing.',
    detail:`<p>A Princeton study found that students who handwrote notes <strong>retained concepts far better</strong> than those who typed.</p>
    <ul>
      <li>Summarise in your own words — don't copy verbatim.</li>
      <li>Use diagrams, arrows, and mind maps alongside text.</li>
      <li>Keep a dedicated notebook per subject.</li>
      <li>Review and annotate your notes within 24 hours of writing them.</li>
    </ul>`
  },
  {
    id:12, cat:'memory', color:'green', icon:'fa-comments', title:'Teach It Out Loud',
    short:'Explain what you learned as if teaching a 10-year-old.',
    detail:`<p>Known as the <strong>Feynman Technique</strong>, teaching is one of the most powerful ways to identify and fix weak spots.</p>
    <ul>
      <li>Pick a concept and explain it aloud without looking at your notes.</li>
      <li>Wherever you stumble — that's what you need to restudy.</li>
      <li>Use simple language; if you can't simplify it, you don't understand it yet.</li>
      <li>Teach a friend, explain to a mirror, or record yourself.</li>
    </ul>`
  },
  // EXAMS
  {
    id:13, cat:'exams', color:'orange', icon:'fa-file-pen', title:'Past Papers First',
    short:'Do past exam papers as early as possible — they reveal what actually gets tested.',
    detail:`<p>Past papers are the closest thing to a cheat code for exams.</p>
    <ul>
      <li>Start past papers at least 3 weeks before your exam.</li>
      <li>Do them under timed, exam-condition settings.</li>
      <li>Mark your own paper using the official mark scheme.</li>
      <li>For every wrong answer, find the gap in your notes and fill it.</li>
    </ul>`
  },
  {
    id:14, cat:'exams', color:'purple', icon:'fa-brain', title:'Exam Mindset',
    short:"Manage exam anxiety by reframing nerves as excitement.",
    detail:`<p>Research by Harvard's Alison Wood Brooks shows that saying "I am excited" before a performance beats "I am calm."</p>
    <ul>
      <li>Before an exam, take 5 slow deep breaths.</li>
      <li>Write down your worries on paper before entering — it clears working memory.</li>
      <li>Start with the questions you know best to build confidence.</li>
      <li>If you blank on a question, skip and return — don't freeze.</li>
    </ul>`
  },
  {
    id:15, cat:'exams', color:'rose', icon:'fa-moon', title:'Sleep Before Exams',
    short:'An extra hour of sleep outperforms an extra hour of cramming.',
    detail:`<p>During sleep, your brain consolidates memories and transfers learning into long-term storage.</p>
    <ul>
      <li>Aim for 8 hours the night before an exam — non-negotiable.</li>
      <li>Avoid all-nighters; sleep-deprived performance drops 20-40%.</li>
      <li>Review key notes 30 minutes before bed — your brain processes them during sleep.</li>
    </ul>`
  },
  {
    id:16, cat:'exams', color:'blue', icon:'fa-pen-to-square', title:'Answer Planning',
    short:'Spend 2 minutes planning your answer structure before writing.',
    detail:`<p>Structured answers score higher because markers follow a clear logical flow.</p>
    <ul>
      <li>Jot a quick bullet plan before writing any long answer.</li>
      <li>Use PEEL structure: Point, Evidence, Explain, Link.</li>
      <li>For science: state formula → substitute values → calculate → unit.</li>
      <li>Always re-read the question after writing your answer.</li>
    </ul>`
  },
  // MOTIVATION
  {
    id:17, cat:'motivation', color:'orange', icon:'fa-fire', title:'Find Your Why',
    short:'Know exactly why you are studying. A strong reason creates unstoppable motivation.',
    detail:`<p>Motivation follows meaning. When your "why" is strong, the "how" becomes easier.</p>
    <ul>
      <li>Write your goal somewhere you'll see it every day.</li>
      <li>Ask: what does passing this exam unlock for your future?</li>
      <li>Connect today's boring topic to your long-term vision.</li>
    </ul>`
  },
  {
    id:18, cat:'motivation', color:'green', icon:'fa-trophy', title:'Reward Yourself',
    short:'Set up a small reward for completing study goals.',
    detail:`<p>Dopamine-driven reward loops are powerful. Used correctly, they make studying feel less painful over time.</p>
    <ul>
      <li>Decide the reward before you start: "After 2 hours of study, I'll watch one episode."</li>
      <li>Only give the reward if you genuinely complete the goal.</li>
      <li>Track your streak — a simple tick on a calendar is surprisingly motivating.</li>
    </ul>`
  },
  {
    id:19, cat:'motivation', color:'violet', icon:'fa-users', title:'Study With Others',
    short:'Group study sessions create accountability and expose you to different explanations.',
    detail:`<p>The right study group can dramatically accelerate learning.</p>
    <ul>
      <li>Set a clear agenda before every group session.</li>
      <li>Assign each person a topic to teach the others.</li>
      <li>Quiz each other — it's more effective than discussing notes.</li>
      <li>Limit social chat to break times only.</li>
    </ul>`
  },
  {
    id:20, cat:'motivation', color:'rose', icon:'fa-chart-line', title:'Track Progress',
    short:'Seeing your progress visually releases dopamine and reinforces the habit of studying.',
    detail:`<p>Progress visibility is one of the most underrated motivation tools.</p>
    <ul>
      <li>Use your Analytics page to see completed tasks and weekly activity.</li>
      <li>Keep a habit tracker — mark off every day you study.</li>
      <li>Celebrate milestones: finishing a chapter, completing a past paper.</li>
    </ul>`
  }
];

const SECTION_META = {
    focus:      { emoji:'🧠', label:'Focus & Concentration' },
    time:       { emoji:'⏳', label:'Time Management' },
    memory:     { emoji:'💡', label:'Memory Techniques' },
    exams:      { emoji:'📝', label:'Exam Strategies' },
    motivation: { emoji:'🔥', label:'Motivation & Mindset' }
};

// ── FAVOURITES STATE ───────────────────────────────────────────
// Loaded from DB on init, kept in memory for instant UI response
let favSet = new Set();

async function loadFavs() {
    const res = await Tips.getFavs();
    if (res && res.success) {
        favSet = new Set(res.favourites);
    }
    updateFavCounter();
}

function isFav(id)      { return favSet.has(id); }

async function toggleFav(id) {
    if (favSet.has(id)) {
        favSet.delete(id);
        await Tips.unsave(id);
    } else {
        favSet.add(id);
        await Tips.save(id);
    }
    updateFavCounter();
}

function updateFavCounter() {
    document.getElementById('favCount').textContent = favSet.size;
}

// ── TIP OF THE DAY ─────────────────────────────────────────────
function setTipOfDay() {
    const idx = Math.floor(Date.now() / 86400000) % TIPS.length;
    const tip = TIPS[idx];
    document.getElementById('todayTipTitle').textContent = tip.title;
    document.getElementById('todayTipBody').textContent  = tip.short;
}

// ── FILTER STATE ───────────────────────────────────────────────
let activeCategory = 'all';

document.getElementById('filters').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.cat;
    applyFilters();
});

function filterFavourites() {
    document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
    document.getElementById('favFilterBtn').classList.add('active');
    activeCategory = 'favourites';
    applyFilters();
}

// ── RENDER TIPS ────────────────────────────────────────────────
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();

    let filtered = TIPS.filter(tip => {
        const matchSearch = tip.title.toLowerCase().includes(search) || tip.short.toLowerCase().includes(search);
        const matchCat    =
            activeCategory === 'all'        ? true :
            activeCategory === 'favourites' ? favSet.has(tip.id) :
            tip.cat === activeCategory;
        return matchSearch && matchCat;
    });

    const container  = document.getElementById('tipsContainer');
    const emptyState = document.getElementById('emptyState');

    if (!filtered.length) {
        container.innerHTML     = '';
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    const catOrder = ['focus','time','memory','exams','motivation'];
    const grouped  = {};
    filtered.forEach(tip => {
        if (!grouped[tip.cat]) grouped[tip.cat] = [];
        grouped[tip.cat].push(tip);
    });

    const showHeaders = activeCategory === 'all' || activeCategory === 'favourites';

    container.innerHTML = catOrder
        .filter(cat => grouped[cat])
        .map(cat => {
            const meta  = SECTION_META[cat];
            const cards = grouped[cat].map(tip => renderCard(tip)).join('');
            const header = showHeaders ? `<h2 class="section-title">${meta.emoji} ${meta.label}</h2>` : '';
            return `${header}<div class="tips-grid">${cards}</div>`;
        }).join('');
}

function renderCard(tip) {
    const saved = favSet.has(tip.id);
    return `
        <div class="tip-card ${tip.color}" onclick="openModal(${tip.id})">
            <i class="fa-solid ${tip.icon} card-icon"></i>
            <h3>${tip.title}</h3>
            <p>${tip.short}</p>
            <div class="card-actions">
                <button class="card-btn ${saved ? 'fav-active' : ''}"
                    onclick="event.stopPropagation(); toggleFavCard(${tip.id}, this)"
                    title="${saved ? 'Remove from saved' : 'Save tip'}">
                    <i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark"></i>
                </button>
                <button class="card-btn" onclick="event.stopPropagation(); openModal(${tip.id})" title="Read more">
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>`;
}

async function toggleFavCard(id, btn) {
    await toggleFav(id);
    const saved = favSet.has(id);
    btn.classList.toggle('fav-active', saved);
    btn.innerHTML = `<i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark"></i>`;
    if (activeCategory === 'favourites' && !saved) applyFilters();
}

// ── EXPAND MODAL ───────────────────────────────────────────────
let openTipId = null;

function openModal(id) {
    const tip = TIPS.find(t => t.id === id);
    if (!tip) return;
    openTipId = id;

    const meta = SECTION_META[tip.cat];
    document.getElementById('modalTag').textContent  = `${meta.emoji} ${meta.label}`;
    document.getElementById('modalIcon').innerHTML   = `<i class="fa-solid ${tip.icon}" style="color:#4a6cf7;"></i>`;
    document.getElementById('modalTitle').textContent = tip.title;
    document.getElementById('modalShort').textContent = tip.short;
    document.getElementById('modalDetail').innerHTML  = tip.detail;

    const saved   = favSet.has(id);
    const favBtn  = document.getElementById('modalFavBtn');
    favBtn.className = 'modal-fav-btn' + (saved ? ' fav-saved' : '');
    document.getElementById('modalFavLabel').textContent = saved ? 'Saved ✓' : 'Save Tip';

    document.getElementById('expandModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeExpandModal() {
    document.getElementById('expandModal').style.display = 'none';
    document.body.style.overflow = '';
}
function closeModal(e) {
    if (e.target === document.getElementById('expandModal')) closeExpandModal();
}

async function toggleFavFromModal() {
    if (openTipId === null) return;
    await toggleFav(openTipId);
    const saved  = favSet.has(openTipId);
    const favBtn = document.getElementById('modalFavBtn');
    favBtn.className = 'modal-fav-btn' + (saved ? ' fav-saved' : '');
    document.getElementById('modalFavLabel').textContent = saved ? 'Saved ✓' : 'Save Tip';
    applyFilters();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeExpandModal(); });

// ── INIT ───────────────────────────────────────────────────────
async function init() {
    setTipOfDay();
    await loadFavs();   // load saved tips from DB first
    applyFilters();     // then render with correct bookmark states
}

init();

