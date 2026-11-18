let grammarEntries = [];

async function init() {
    try {
        const response = await fetch('index.json');
        if (!response.ok) throw new Error('Failed to load grammar index');
        grammarEntries = await response.json();
    } catch (error) {
        console.error('Error loading grammar index:', error);
        document.getElementById('grammar-menu').innerHTML = '<p class="menu-error">Failed to load topics.</p>';
        return;
    }

    buildMenu(grammarEntries);

    const hash = window.location.hash.slice(1);
    if (hash && grammarEntries.some(e => e.id === hash)) {
        navigateTo(hash);
    } else if (grammarEntries.length > 0) {
        navigateTo(grammarEntries[0].id);
    }

    window.addEventListener('hashchange', () => {
        const h = window.location.hash.slice(1);
        if (h && grammarEntries.some(e => e.id === h)) {
            navigateTo(h);
        }
    });
}

function buildMenu(entries) {
    const menu = document.getElementById('grammar-menu');
    menu.innerHTML = '';
    entries.forEach(entry => {
        const btn = document.createElement('button');
        btn.className = 'menu-btn';
        btn.dataset.id = entry.id;
        btn.textContent = entry.title;
        btn.addEventListener('click', () => {
            window.location.hash = entry.id;
        });
        menu.appendChild(btn);
    });
}

async function navigateTo(id) {
    const entry = grammarEntries.find(e => e.id === id);
    if (!entry) return;

    highlightMenu(id);

    const content = document.getElementById('grammar-content');

    try {
        const response = await fetch(entry.file);
        if (!response.ok) throw new Error(`Failed to load ${entry.file}`);
        const markdown = await response.text();
        const html = marked.parse(markdown);
        content.innerHTML = html.trim() ? html : `<p>This topic doesn't have any content yet.</p>`;
    } catch (error) {
        console.error('Error loading grammar file:', error);
        content.innerHTML = `<p>Failed to load this topic.</p>`;
    }
}

function highlightMenu(activeId) {
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.id === activeId);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    document.getElementById('current-year').textContent = new Date().getFullYear();
});