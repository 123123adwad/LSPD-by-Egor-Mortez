(function() {
    const intro = document.getElementById('cinematicIntro');
    const skipBtn = document.getElementById('introSkip');
    const enterBtn = document.getElementById('enterBtn');
    const particlesContainer = document.getElementById('introParticles');
    const terminal = document.getElementById('initTerminal');

    let dismissed = false;

    const initLines = [
        { label: '> ', text: 'CONNECTING TO LSPD MAINFRAME', type: 'text' },
        { label: '> ', text: 'VERIFYING OFFICER CREDENTIALS', type: 'text' },
        { label: '> ', text: 'LOADING CRIMINAL CODE DATABASE', type: 'progress' },
        { label: '> ', text: 'SYNCING PROCEDURE MANUAL', type: 'progress' },
        { label: '> ', text: 'ACCESS GRANTED', type: 'ok' },
    ];

    function createParticles() {
        for (let i = 0; i < 35; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (4 + Math.random() * 8) + 's';
            p.style.animationDelay = Math.random() * 6 + 's';
            p.style.width = p.style.height = (1 + Math.random() * 2.5) + 'px';
            particlesContainer.appendChild(p);
        }
    }

    function runTerminal(callback) {
        let i = 0;
        function nextLine() {
            if (dismissed || i >= initLines.length) {
                if (callback) callback();
                return;
            }
            const line = initLines[i];
            const el = document.createElement('div');
            el.className = 'init-line';
            if (line.type === 'progress') {
                el.innerHTML = `<span class="label">${line.label}</span><span class="value">${line.text}</span><span class="progress-bar"><span class="progress-fill"></span></span>`;
            } else if (line.type === 'ok') {
                el.innerHTML = `<span class="ok">[OK]</span> <span class="value">${line.text}</span>`;
            } else {
                el.innerHTML = `<span class="label">${line.label}</span><span class="value">${line.text}</span>`;
            }
            terminal.appendChild(el);

            requestAnimationFrame(() => {
                el.classList.add('visible');
            });

            if (line.type === 'progress') {
                requestAnimationFrame(() => {
                    el.classList.add('complete');
                });
            }

            i++;
            const delay = line.type === 'progress' ? 900 : 700;
            setTimeout(nextLine, delay);
        }
        nextLine();
    }

    function showPhase(num) {
        document.querySelectorAll('.intro-phase').forEach((phase, i) => {
            phase.classList.remove('active', 'exit');
            if (i + 1 < num) phase.classList.add('exit');
            if (i + 1 === num) phase.classList.add('active');
        });
    }

    function dismissIntro() {
        if (dismissed) return;
        dismissed = true;
        intro.classList.add('dismissed');
        setTimeout(() => {
            if (intro.parentNode) intro.parentNode.removeChild(intro);
        }, 700);
    }

    createParticles();

    showPhase(1);
    runTerminal(() => {
        setTimeout(() => {
            if (!dismissed) showPhase(2);
        }, 600);
    });
    setTimeout(() => { if (!dismissed) showPhase(3); }, 5500);
    setTimeout(() => { if (!dismissed) showPhase(4); }, 7200);

    skipBtn.addEventListener('click', dismissIntro);
    enterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dismissIntro();
        setTimeout(() => {
            window.location.href = enterBtn.href;
        }, 400);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dismissIntro();
        }
    });
})();
