// Game logic and rendering

// Game State
let currentPage = 'start';
let visitedPages = new Set();
let xp = 0;

function renderPage(pageId) {
    const page = STORY[pageId];
    if (!page) {
        console.error('Page not found:', pageId);
        return;
    }

    currentPage = pageId;

    // Award XP for new pages
    if (!visitedPages.has(pageId)) {
        visitedPages.add(pageId);
        xp = Math.min(100, xp + 8);
    }

    updateStats(page);
    flashCommits();

    const html = buildPageHTML(page);
    document.getElementById('terminal-body').innerHTML = html;
    document.querySelector('.terminal').scrollTop = 0;
    window.scrollTo(0, 0);
}

function updateStats(page) {
    const level = getLevel(xp);
    document.getElementById('xp').textContent = xp;
    document.getElementById('xp-fill').style.width = xp + '%';
    document.getElementById('level').textContent = LEVELS[level];
    document.getElementById('branch').textContent = page.ending ? 'shipped!' : 'main';
}

function buildPageHTML(page) {
    let html = `<div class="page-indicator">Page ${page.page} of 15</div>`;
    html += `<h2 class="chapter-title"><span class="icon">${page.icon}</span>${page.title}</h2>`;

    if (page.concept) {
        html += buildConceptBox(page.concept);
    }

    html += `<div class="story-text">${page.text}</div>`;

    if (page.ending) {
        html += buildEndingHTML(page);
    } else {
        html += buildChoicesHTML(page.choices);
    }

    return html;
}

function buildConceptBox(concept) {
    return `<div class="concept-box">
        <div class="label">Key Concept</div>
        <div class="term">${concept.term}</div>
        <div class="definition">${concept.definition}</div>
    </div>`;
}

function buildChoicesHTML(choices) {
    const buttons = choices.map(choice =>
        `<button class="choice-btn" onclick="renderPage('${choice.goto}')">
            <span class="prompt">$</span>${choice.text}
            <span class="page-ref">→ pg ${choice.page}</span>
        </button>`
    ).join('');

    return `<div class="choices">
        <div class="choices-header">Choose Your Path</div>
        ${buttons}
    </div>`;
}

function buildEndingHTML(page) {
    const skillsList = page.skills.map(s => `<li>${s}</li>`).join('');

    return `<div class="ending ${page.endingType}">
        <div class="badge ${page.endingType}">
            <div class="badge-title">${page.title}</div>
            <div class="badge-subtitle">Achievement Unlocked</div>
        </div>
        <div class="skills-learned">
            <h3>Skills Acquired:</h3>
            <ul>${skillsList}</ul>
        </div>
        <button class="restart-btn" onclick="restartGame()">New Journey</button>
    </div>`;
}

function restartGame() {
    visitedPages.clear();
    xp = 0;
    renderPage('start');
}

// Initialize game
initBackground();
renderPage('start');
