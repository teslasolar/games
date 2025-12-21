// HTML Hero - Challenge definitions
const CHALLENGES = [
    {
        id: 1,
        title: "Hello, World!",
        desc: "Every hero starts somewhere. Create a heading that says 'Hello, World!'",
        difficulty: "NEWBIE",
        hint: "Use the &lt;h1&gt; tag to create a main heading.",
        starter: "<!-- Your first HTML! -->\n\n",
        check: (doc) => {
            const h1 = doc.querySelector('h1');
            return h1 && h1.textContent.toLowerCase().includes('hello');
        },
        xp: 10
    },
    {
        id: 2,
        title: "Paragraph Power",
        desc: "Add a paragraph below your heading. Write anything you want!",
        difficulty: "NEWBIE",
        hint: "Use the &lt;p&gt; tag for paragraphs.",
        starter: "<h1>My Page</h1>\n\n<!-- Add a paragraph here -->\n",
        check: (doc) => {
            return doc.querySelector('h1') && doc.querySelector('p');
        },
        xp: 10
    },
    {
        id: 3,
        title: "Link Up!",
        desc: "Create a link that goes to https://example.com with the text 'Click me!'",
        difficulty: "NEWBIE",
        hint: "Use &lt;a href=\"url\"&gt;text&lt;/a&gt; to create links.",
        starter: "<!-- Create a link below -->\n\n",
        check: (doc) => {
            const a = doc.querySelector('a');
            return a && a.href.includes('example.com') && a.textContent.trim().length > 0;
        },
        xp: 15
    },
    {
        id: 4,
        title: "Picture Perfect",
        desc: "Add an image using any URL. Don't forget the alt text!",
        difficulty: "NEWBIE",
        hint: "Use &lt;img src=\"url\" alt=\"description\"&gt;",
        starter: "<!-- Add an image -->\n\n",
        check: (doc) => {
            const img = doc.querySelector('img');
            return img && img.src && img.alt;
        },
        xp: 15
    },
    {
        id: 5,
        title: "List It Out",
        desc: "Create an unordered list with at least 3 items.",
        difficulty: "INTERMEDIATE",
        hint: "Use &lt;ul&gt; with &lt;li&gt; items inside.",
        starter: "<!-- Create a shopping list or any list! -->\n\n",
        check: (doc) => {
            const ul = doc.querySelector('ul');
            const items = ul ? ul.querySelectorAll('li') : [];
            return items.length >= 3;
        },
        xp: 20
    },
    {
        id: 6,
        title: "Style It Up",
        desc: "Make a heading with red text using inline styles.",
        difficulty: "INTERMEDIATE",
        hint: "Use style=\"color: red\" inside your tag.",
        starter: "<!-- Make a red heading -->\n\n",
        check: (doc) => {
            const el = doc.querySelector('[style*=\"color\"]');
            if (!el) return false;
            const style = el.getAttribute('style').toLowerCase();
            return style.includes('red') || style.includes('#f') || style.includes('rgb');
        },
        xp: 20
    },
    {
        id: 7,
        title: "Div Master",
        desc: "Create a div with a blue background and white text. Put some content inside!",
        difficulty: "INTERMEDIATE",
        hint: "Use style=\"background: blue; color: white; padding: 20px\"",
        starter: "<!-- Create a styled div container -->\n\n",
        check: (doc) => {
            const div = doc.querySelector('div[style]');
            if (!div) return false;
            const style = div.getAttribute('style').toLowerCase();
            return style.includes('background') && style.includes('color');
        },
        xp: 25
    },
    {
        id: 8,
        title: "Button Hero",
        desc: "Create a button that shows an alert when clicked!",
        difficulty: "ADVANCED",
        hint: "Use &lt;button onclick=\"alert('Hi!')\"&gt;Click me&lt;/button&gt;",
        starter: "<!-- Create an interactive button -->\n\n",
        check: (doc) => {
            const btn = doc.querySelector('button[onclick]');
            return btn && btn.getAttribute('onclick').includes('alert');
        },
        xp: 30
    },
    {
        id: 9,
        title: "Form Builder",
        desc: "Create a form with an input field and a submit button.",
        difficulty: "ADVANCED",
        hint: "Use &lt;form&gt;, &lt;input type=\"text\"&gt; and &lt;button&gt;",
        starter: "<!-- Build a simple form -->\n\n",
        check: (doc) => {
            const form = doc.querySelector('form');
            const input = doc.querySelector('input');
            const btn = doc.querySelector('button') || doc.querySelector('input[type=\"submit\"]');
            return form && input && btn;
        },
        xp: 35
    },
    {
        id: 10,
        title: "Table Time",
        desc: "Create a table with headers and at least 2 rows of data.",
        difficulty: "ADVANCED",
        hint: "Use &lt;table&gt;, &lt;tr&gt;, &lt;th&gt; for headers, &lt;td&gt; for cells.",
        starter: "<!-- Create a data table -->\n\n",
        check: (doc) => {
            const table = doc.querySelector('table');
            const headers = doc.querySelectorAll('th');
            const rows = doc.querySelectorAll('tr');
            return table && headers.length > 0 && rows.length >= 3;
        },
        xp: 40
    },
    {
        id: 11,
        title: "Flexbox Warrior",
        desc: "Create 3 boxes in a row using flexbox. Make them evenly spaced!",
        difficulty: "HERO",
        hint: "Parent needs display:flex; justify-content:space-between",
        starter: "<div style=\"\">\n  <div>Box 1</div>\n  <div>Box 2</div>\n  <div>Box 3</div>\n</div>",
        check: (doc) => {
            const flex = doc.querySelector('[style*=\"flex\"]');
            return flex && flex.children.length >= 3;
        },
        xp: 50
    },
    {
        id: 12,
        title: "Animation Station",
        desc: "Create an element that changes color on hover!",
        difficulty: "HERO",
        hint: "Use onmouseover and onmouseout events to change style.background",
        starter: "<!-- Make something interactive! -->\n\n",
        check: (doc) => {
            const el = doc.querySelector('[onmouseover]');
            return el && el.getAttribute('onmouseout');
        },
        xp: 50
    }
];

const DIFFICULTY_COLORS = {
    'NEWBIE': '#ff6b6b',
    'INTERMEDIATE': '#feca57',
    'ADVANCED': '#5f27cd',
    'HERO': 'linear-gradient(90deg, #ff6b6b, #feca57)'
};
