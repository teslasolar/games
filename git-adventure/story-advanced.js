// Story Part 3: Advanced topics (pages 9-12)

STORY.branches = {
    page: 9,
    title: "Branch Previews",
    icon: "🌿",
    concept: {
        term: "Branch Strategy",
        definition: "Develop on feature branches, preview locally, merge to main to deploy."
    },
    text: `<p>Safe development without breaking production:</p>
    <div class="code-block">
<span class="comment"># Create a feature branch</span>
<span class="command">$</span> git checkout -b <span class="string">new-feature</span>

<span class="comment"># Test locally</span>
<span class="command">$</span> python -m http.server 8000
<span class="comment"># Visit localhost:8000 to preview</span>

<span class="comment"># When ready, merge to main</span>
<span class="command">$</span> git checkout main
<span class="command">$</span> git merge new-feature
<span class="command">$</span> git push
    </div>
    <div class="warning">
        <strong>Local Testing:</strong> Always test locally first! Open index.html or use a local server.
    </div>`,
    choices: [
        { text: "Show me advanced patterns", goto: "advanced", page: 10 },
        { text: "I'm ready to build something real", goto: "project_ideas", page: 11 }
    ]
};

STORY.advanced = {
    page: 10,
    title: "Advanced Patterns",
    icon: "🔧",
    concept: {
        term: "Advanced GitHub Pages",
        definition: "JSON as database, localStorage for persistence, Web Workers, PWA for offline support."
    },
    text: `<p>Level up your GitHub Pages game:</p>
    <div class="code-block">
<span class="comment">// JSON as a "database"</span>
fetch(<span class="string">'data.json'</span>)
  .then(r => r.json())
  .then(data => renderApp(data));

<span class="comment">// localStorage for user data</span>
localStorage.setItem(<span class="string">'score'</span>, <span class="string">'100'</span>);

<span class="comment">// Service Worker for PWA</span>
navigator.serviceWorker.register(<span class="string">'sw.js'</span>);

<span class="comment">// Web Workers for heavy compute</span>
<span class="keyword">const</span> worker = <span class="keyword">new</span> Worker(<span class="string">'compute.js'</span>);
    </div>
    <div class="pro-tip">
        <strong>GitHub Actions:</strong> Add .github/workflows/deploy.yml for TypeScript/Sass builds.
    </div>`,
    choices: [
        { text: "Give me project ideas", goto: "project_ideas", page: 11 },
        { text: "I want to master this", goto: "mastery", page: 12 }
    ]
};

STORY.project_ideas = {
    page: 11,
    title: "Project Ideas",
    icon: "💡",
    concept: {
        term: "Starter Projects",
        definition: "Game galleries, interactive resumes, data dashboards, creative coding, web tools."
    },
    text: `<p>Ready to build? Proven project ideas:</p>
    <div class="code-block">
<span class="comment"># Beginner</span>
├── Interactive resume/portfolio
├── Calculator or converter tool
├── Countdown timer / clock

<span class="comment"># Intermediate</span>
├── 2D game (Canvas API)
├── Music visualizer (Web Audio)
├── Weather dashboard (API calls)

<span class="comment"># Advanced</span>
├── 3D experiences (Three.js)
├── Multi-game gallery (like this site!)
├── AI-powered tools (API integration)
    </div>
    <p>Start simple. Ship fast. Iterate.</p>`,
    choices: [
        { text: "I want to become a Pages master", goto: "mastery", page: 12 },
        { text: "I'm ready to start building!", goto: "ending_builder", page: 13 }
    ]
};

STORY.mastery = {
    page: 12,
    title: "The Path to Mastery",
    icon: "🏆",
    concept: {
        term: "Mastery Mindset",
        definition: "Master fundamentals. Understand the browser. Ship constantly. Study the greats."
    },
    text: `<p>The secret to mastering GitHub Pages? Ship relentlessly.</p>
    <div class="code-block">
<span class="comment"># The Mastery Path</span>

<span class="keyword">1.</span> Master fundamentals
   └── HTML, CSS, JavaScript

<span class="keyword">2.</span> Understand the browser
   └── DevTools, rendering, caching

<span class="keyword">3.</span> Ship constantly
   └── Start ugly, deploy immediately

<span class="keyword">4.</span> Study great examples
   └── View source on sites you admire
    </div>
    <div class="pro-tip">
        <strong>The Ultimate Hack:</strong> Build something every week. Shipping beats perfection.
    </div>`,
    choices: [
        { text: "Give me the hacker ending", goto: "ending_hacker", page: 14 },
        { text: "I want to be a master builder", goto: "ending_master", page: 15 }
    ]
};
