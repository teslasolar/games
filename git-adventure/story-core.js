// Story Part 2: Core concepts (pages 5-8)

STORY.single_file_app = {
    page: 5,
    title: "Single-File Apps",
    icon: "📄",
    concept: {
        term: "Self-Contained HTML",
        definition: "Embed CSS in <style> and JS in <script>. One file = one complete app. No build step needed."
    },
    text: `<p>The simplest approach - everything in one HTML file:</p>
    <div class="code-block">
<span class="tag">&lt;!DOCTYPE html&gt;</span>
<span class="tag">&lt;html&gt;</span>
<span class="tag">&lt;head&gt;</span>
    <span class="tag">&lt;style&gt;</span>
        <span class="attr">body</span> { <span class="keyword">background</span>: <span class="string">#000</span>; }
    <span class="tag">&lt;/style&gt;</span>
<span class="tag">&lt;/head&gt;</span>
<span class="tag">&lt;body&gt;</span>
    <span class="tag">&lt;canvas</span> <span class="attr">id</span>=<span class="string">"game"</span><span class="tag">&gt;&lt;/canvas&gt;</span>
    <span class="tag">&lt;script&gt;</span>
        <span class="comment">// Your entire app here</span>
    <span class="tag">&lt;/script&gt;</span>
<span class="tag">&lt;/body&gt;</span>
<span class="tag">&lt;/html&gt;</span>
    </div>
    <div class="warning">
        <strong>Why single-file?</strong> No build tools, no bundler. Edit → Commit → Push → Live.
    </div>`,
    choices: [
        { text: "But I need libraries like Three.js...", goto: "using_cdns", page: 6 },
        { text: "How do I actually deploy changes?", goto: "workflow", page: 7 }
    ]
};

STORY.using_cdns = {
    page: 6,
    title: "Using CDN Libraries",
    icon: "📦",
    concept: {
        term: "CDN (Content Delivery Network)",
        definition: "Load libraries from external servers. Faster loads, no build step, works instantly."
    },
    text: `<p>Need Three.js? React? D3? Just link to a CDN:</p>
    <div class="code-block">
<span class="comment">&lt;!-- Three.js for 3D --&gt;</span>
<span class="tag">&lt;script</span> <span class="attr">src</span>=<span class="string">"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"</span><span class="tag">&gt;&lt;/script&gt;</span>

<span class="comment">&lt;!-- React --&gt;</span>
<span class="tag">&lt;script</span> <span class="attr">src</span>=<span class="string">"https://unpkg.com/react@18/umd/react.production.min.js"</span><span class="tag">&gt;&lt;/script&gt;</span>

<span class="comment">&lt;!-- D3 for data viz --&gt;</span>
<span class="tag">&lt;script</span> <span class="attr">src</span>=<span class="string">"https://d3js.org/d3.v7.min.js"</span><span class="tag">&gt;&lt;/script&gt;</span>
    </div>
    <div class="pro-tip">
        <strong>Best CDNs:</strong> cdnjs.cloudflare.com, unpkg.com, jsdelivr.net, esm.sh
    </div>`,
    choices: [
        { text: "What's the workflow for updating my site?", goto: "workflow", page: 7 },
        { text: "Can I use a custom domain?", goto: "custom_domain", page: 8 }
    ]
};

STORY.workflow = {
    page: 7,
    title: "The Deployment Workflow",
    icon: "🔄",
    concept: {
        term: "Git Push = Deploy",
        definition: "Every push to your branch triggers automatic deployment. Changes live in ~60 seconds."
    },
    text: `<p>The beautiful simplicity of GitHub Pages deployment:</p>
    <div class="code-block">
<span class="comment"># Make your changes locally</span>
<span class="command">$</span> code index.html

<span class="comment"># Stage and commit</span>
<span class="command">$</span> git add .
<span class="command">$</span> git commit -m <span class="string">"Add new feature"</span>

<span class="comment"># Push to GitHub</span>
<span class="command">$</span> git push

<span class="comment"># ✨ Site updates automatically!</span>
    </div>
    <div class="pro-tip">
        <strong>Pro Tip:</strong> Use branches for features. Only main deploys to live site.
    </div>`,
    choices: [
        { text: "Can I preview before going live?", goto: "branches", page: 9 },
        { text: "I want a custom domain", goto: "custom_domain", page: 8 }
    ]
};

STORY.custom_domain = {
    page: 8,
    title: "Custom Domains",
    icon: "🌐",
    concept: {
        term: "Custom Domain Setup",
        definition: "Point your own domain to GitHub Pages. Add a CNAME file and configure DNS. Free HTTPS!"
    },
    text: `<p>Want yourdomain.com instead of username.github.io?</p>
    <div class="code-block">
<span class="comment"># Add CNAME file to repo root</span>
<span class="command">$</span> echo <span class="string">"mysite.com"</span> > CNAME
<span class="command">$</span> git add CNAME && git commit -m <span class="string">"Add custom domain"</span>

<span class="comment"># Configure DNS at your registrar:</span>
A     @     185.199.108.153
A     @     185.199.109.153
CNAME www   USERNAME.github.io
    </div>
    <div class="pro-tip">
        <strong>Free HTTPS!</strong> GitHub automatically provisions SSL certificates.
    </div>`,
    choices: [
        { text: "How do I test before deploying?", goto: "branches", page: 9 },
        { text: "Show me advanced patterns", goto: "advanced", page: 10 }
    ]
};
