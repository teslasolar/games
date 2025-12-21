// Story Part 1: Introduction pages

STORY.start = {
    page: 1,
    title: "Welcome to GitPhuckt",
    icon: "🚀",
    concept: {
        term: "GitHub Pages",
        definition: "Free static hosting directly from your GitHub repo. Not just for READMEs - you can host fully interactive JavaScript apps, games, tools, and more."
    },
    text: `<p>Your terminal flickers to life. A message appears:</p>
    <div class="code-block">
        <span class="command">$</span> <span class="string">Welcome, developer.</span><br>
        <span class="command">$</span> You've been using GitHub for storage.<br>
        <span class="command">$</span> Time to learn it can be so much more.<br>
        <span class="command">$</span> <span class="keyword">GitHub Pages</span> awaits...
    </div>
    <p>Most devs think GitHub Pages is for documentation. They're missing out. You can host entire web applications - games, tools, portfolios - for FREE.</p>`,
    choices: [
        { text: "Show me how to enable GitHub Pages", goto: "enable_pages", page: 2 },
        { text: "What can I actually build with this?", goto: "what_to_build", page: 3 }
    ]
};

STORY.enable_pages = {
    page: 2,
    title: "Enabling GitHub Pages",
    icon: "⚙️",
    concept: {
        term: "Enabling Pages",
        definition: "Settings → Pages → Source. Choose your branch (usually 'main') and folder. Your site goes live at username.github.io/repo-name."
    },
    text: `<p>Let's get your repo live on the internet:</p>
    <div class="code-block">
        <span class="comment"># In your GitHub repo:</span><br>
        1. Click <span class="keyword">Settings</span> (top menu)<br>
        2. Click <span class="keyword">Pages</span> (left sidebar)<br>
        3. Under "Source", select:<br>
        &nbsp;&nbsp;&nbsp;Branch: <span class="string">main</span><br>
        &nbsp;&nbsp;&nbsp;Folder: <span class="string">/ (root)</span><br>
        4. Click <span class="keyword">Save</span><br><br>
        <span class="comment"># Your site will be live at:</span><br>
        <span class="tag">https://USERNAME.github.io/REPO-NAME/</span>
    </div>
    <div class="pro-tip">
        <strong>Pro Tip:</strong> It takes 1-2 minutes to deploy. Check the "Actions" tab to see progress.
    </div>`,
    choices: [
        { text: "What file structure do I need?", goto: "file_structure", page: 4 },
        { text: "Show me a real working app example", goto: "single_file_app", page: 5 }
    ]
};

STORY.what_to_build = {
    page: 3,
    title: "What You Can Build",
    icon: "🎮",
    concept: {
        term: "Static Site Capabilities",
        definition: "Anything client-side: games, data visualizers, calculators, portfolios, blogs, interactive art, music apps, AI demos, and full SPAs."
    },
    text: `<p>GitHub Pages hosts <em>static</em> files - but "static" doesn't mean "boring":</p>
    <div class="code-block">
        <span class="comment"># What you CAN build:</span><br>
        ✓ <span class="tag">Interactive games</span> (Three.js, Phaser)<br>
        ✓ <span class="tag">Data visualizations</span> (D3.js, Chart.js)<br>
        ✓ <span class="tag">Music/Audio apps</span> (Web Audio API)<br>
        ✓ <span class="tag">AI demos</span> (TensorFlow.js, API calls)<br>
        ✓ <span class="tag">Full React/Vue/Svelte apps</span><br><br>
        <span class="comment"># What you CAN'T (server required):</span><br>
        ✗ Databases (use Firebase, Supabase)<br>
        ✗ Server-side code (use Vercel, Netlify)
    </div>
    <p>The game you're playing RIGHT NOW is hosted on GitHub Pages!</p>`,
    choices: [
        { text: "Let's set up my first Pages site", goto: "enable_pages", page: 2 },
        { text: "Show me the simplest working app", goto: "single_file_app", page: 5 }
    ]
};

STORY.file_structure = {
    page: 4,
    title: "Project Structure",
    icon: "📁",
    concept: {
        term: "File Organization",
        definition: "GitHub Pages serves index.html from your chosen root. Each folder with index.html gets its own clean URL."
    },
    text: `<p>You have options for organizing your project:</p>
    <div class="file-tree">
        <span class="folder">my-project/</span><br>
        ├── <span class="file html">index.html</span> → yoursite.github.io/my-project/<br>
        ├── <span class="file css">style.css</span><br>
        ├── <span class="file js">app.js</span><br>
        ├── <span class="folder">game1/</span><br>
        │&nbsp;&nbsp;&nbsp;└── <span class="file html">index.html</span> → /my-project/game1/<br>
        └── <span class="file json">games.json</span>
    </div>
    <div class="pro-tip">
        <strong>Pro Tip:</strong> Each folder with an index.html becomes its own clean URL!
    </div>`,
    choices: [
        { text: "Show me a single-file app approach", goto: "single_file_app", page: 5 },
        { text: "How do I use external libraries?", goto: "using_cdns", page: 6 }
    ]
};
