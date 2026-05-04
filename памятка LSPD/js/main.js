// HEADER PROGRESS BAR
const headerProgress = document.createElement('div');
headerProgress.className = 'header-progress';
document.querySelector('.header').appendChild(headerProgress);
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    headerProgress.style.width = progress + '%';
}, { passive: true });

// SCROLL OBSERVER
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('animate-in'); sectionObserver.unobserve(entry.target); }
    });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.section').forEach(s => sectionObserver.observe(s));

// ACTIVE LINK OBSERVER
let currentObserver = null;
function initObserver() {
    if (currentObserver) currentObserver.disconnect();
    const visibleSections = Array.from(document.querySelectorAll('.section')).filter(el => {
        if (el.classList.contains('lawyer-only') && document.body.classList.contains('lawyer-mode')) return true;
        if (el.classList.contains('lawyer-only') || el.classList.contains('prosecutor-only')) return false;
        return true;
    });
    currentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                document.querySelectorAll('.sidebar-link').forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-80px 0px -70% 0px' });
    visibleSections.forEach(s => currentObserver.observe(s));
}
initObserver();

// SIDEBAR COLLAPSIBLE
document.querySelectorAll('.sidebar-group-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => toggle.closest('.sidebar-group').classList.toggle('collapsed'));
});

// BACK TO TOP
const backToTop = document.createElement('div');
backToTop.className = 'back-to-top';
backToTop.innerHTML = '&#9650;';
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
document.body.appendChild(backToTop);
window.addEventListener('scroll', () => backToTop.classList.toggle('visible', window.scrollY > 400), { passive: true });

// SMOOTH SCROLL
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// SEARCH
const searchInput = document.getElementById('searchInput');
const searchNav = document.getElementById('searchNav');
const searchCount = document.getElementById('searchCount');
const searchPrev = document.getElementById('searchPrev');
const searchNext = document.getElementById('searchNext');
const searchClose = document.getElementById('searchClose');
const headerSearch = document.getElementById('headerSearch');
const content = document.querySelector('.content');
let highlights = [], currentIndex = -1;

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchInput.focus(); searchInput.select(); }
    if (e.key === 'Escape') { clearSearch(); searchInput.blur(); }
    if (highlights.length > 0 && e.key === 'Enter') { e.preventDefault(); navigateSearch(e.shiftKey ? -1 : 1); }
});

let debounceTimer;
searchInput.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => performSearch(searchInput.value), 150); });
searchPrev.addEventListener('click', () => navigateSearch(-1));
searchNext.addEventListener('click', () => navigateSearch(1));
searchClose.addEventListener('click', () => { clearSearch(); searchInput.blur(); });

function clearSearch() {
    clearHighlights(); clearDimming(); highlights = []; currentIndex = -1;
    searchNav.classList.remove('visible'); headerSearch.classList.remove('has-results');
    searchInput.value = ''; searchCount.textContent = '0 / 0';
}
function clearHighlights() {
    content.querySelectorAll('mark.search-highlight, mark.search-current').forEach(mark => {
        mark.parentNode.replaceChild(document.createTextNode(mark.textContent), mark); mark.parentNode.normalize();
    });
}
function clearDimming() {
    content.querySelectorAll('.search-dim').forEach(el => el.classList.remove('search-dim'));
    content.querySelectorAll('.search-section-match').forEach(el => el.classList.remove('search-section-match'));
}
function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function performSearch(query) {
    clearHighlights(); clearDimming(); highlights = []; currentIndex = -1;
    if (!query || query.trim().length < 2) {
        searchNav.classList.remove('visible'); headerSearch.classList.remove('has-results');
        searchCount.textContent = '0 / 0'; return;
    }
    const term = query.trim().toLowerCase();
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    const searchables = Array.from(content.querySelectorAll('.section, details, .card, .scenario, .alert, .miranda'));
    let hasAny = false;
    searchables.forEach(el => { if (el.textContent.toLowerCase().includes(term)) hasAny = true; });
    if (!hasAny) {
        searchNav.classList.remove('visible'); headerSearch.classList.remove('has-results');
        searchCount.textContent = '0 / 0';
        searchables.forEach(el => el.classList.add('search-dim')); return;
    }
    searchables.forEach(el => {
        if (!el.textContent.toLowerCase().includes(term)) { el.classList.add('search-dim'); }
        else { if (el.classList.contains('section') || el.tagName === 'DETAILS') el.classList.add('search-section-match'); highlightText(el, regex); }
    });
    highlights = Array.from(content.querySelectorAll('mark.search-highlight'));
    if (highlights.length > 0) {
        currentIndex = 0; updateCurrentHighlight(); updateCount();
        searchNav.classList.add('visible'); headerSearch.classList.add('has-results');
        highlights[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function highlightText(element, regex) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            if (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE' || node.parentElement.tagName === 'MARK') return NodeFilter.FILTER_REJECT;
            return regex.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
        const span = document.createElement('span');
        span.innerHTML = node.textContent.replace(regex, '<mark class="search-highlight">$1</mark>');
        node.parentNode.replaceChild(span, node);
        span.querySelectorAll('mark.search-highlight').forEach(mark => highlights.push(mark));
        while (span.childNodes.length > 0) span.parentNode.insertBefore(span.childNodes[0], span);
        span.parentNode.removeChild(span);
    });
}

function navigateSearch(direction) {
    if (highlights.length === 0) return;
    currentIndex = (currentIndex + direction + highlights.length) % highlights.length;
    updateCurrentHighlight(); updateCount();
    highlights[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    const parentDetails = highlights[currentIndex].closest('details');
    if (parentDetails && !parentDetails.open) parentDetails.open = true;
}
function updateCurrentHighlight() {
    highlights.forEach((h, i) => { h.className = i === currentIndex ? 'search-current' : 'search-highlight'; });
}
function updateCount() { searchCount.textContent = `${currentIndex + 1} / ${highlights.length}`; }
