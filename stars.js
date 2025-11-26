/* WARNING: This is a gimmick.
   It's distracting, unprofessional, and wastes CPU.
   DO NOT use this in a professional portfolio.
   I am providing this ONLY to show you why it's a bad idea.
*/

(() => {
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize canvas to device pixel ratio for sharpness
    function resize() {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        canvas.width = Math.floor(canvas.clientWidth * dpr);
        canvas.height = Math.floor(canvas.clientHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize);
    resize();

    // Particle system
    const particles = [];
    const MAX_PARTICLES = 600; // safety cap

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Create a single falling star particle at (x,y)
    function spawnStar(x, y) {
        const speed = random(80, 220); // px/sec
        const angle = random(80, 100) * (Math.PI / 180); // mostly downward
        const life = random(0.8, 1.8); // seconds
        const length = random(6, 18);
        const hue = random(40, 70); // warm-ish white/yellow tint

        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life,
            age: 0,
            length,
            hue,
            alpha: 1
        });
        // Trim if too many
        if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
    }

    // Mouse / touch handling
    let isPointerDown = false;
    let lastPointer = { x: canvas.width / 2, y: canvas.height / 2 };

    function getPointerPos(e) {
        if (e.touches && e.touches[0]) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    // If the pointer is over an interactive/content "box", return true to suppress star spawning.
    function isOverInteractive(x, y) {
        try {
            const el = document.elementFromPoint(Math.round(x), Math.round(y));
            if (!el) return false;
            // Elements where we don't want falling stars
            return !!el.closest(
                'a, button, input, textarea, select, .card, .project-thumb, .hero-links, .nav-dots, .goal-card, .cert-item, .imp-card, .skill-grid'
            );
        } catch (e) {
            return false;
        }
    }

    window.addEventListener('mousemove', (e) => {
        lastPointer = getPointerPos(e);
        // If pointer is over interactive element, do not spawn stars
        if (isOverInteractive(lastPointer.x, lastPointer.y)) return;
        // spawn a few per move for visible trail
        for (let i = 0; i < 2; i++) spawnStar(lastPointer.x + random(-6, 6), lastPointer.y + random(-6, 6));
    }, { passive: true });

    window.addEventListener('mousedown', (e) => {
        isPointerDown = true;
        lastPointer = getPointerPos(e);
        if (isOverInteractive(lastPointer.x, lastPointer.y)) return;
        for (let i = 0; i < 8; i++) spawnStar(lastPointer.x + random(-12, 12), lastPointer.y + random(-12, 12));
    });

    window.addEventListener('mouseup', () => { isPointerDown = false; });

    window.addEventListener('touchstart', (e) => {
        lastPointer = getPointerPos(e);
        if (isOverInteractive(lastPointer.x, lastPointer.y)) return;
        for (let i = 0; i < 6; i++) spawnStar(lastPointer.x + random(-10, 10), lastPointer.y + random(-10, 10));
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        lastPointer = getPointerPos(e);
        if (isOverInteractive(lastPointer.x, lastPointer.y)) return;
        for (let i = 0; i < 2; i++) spawnStar(lastPointer.x + random(-6, 6), lastPointer.y + random(-6, 6));
    }, { passive: true });

    // Animation loop
    let last = performance.now();
    function frame(now) {
        const dt = (now - last) / 1000; // seconds
        last = now;

        // Clear with slight alpha to create soft trails
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        // Update & draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.age += dt;
            if (p.age >= p.life) {
                particles.splice(i, 1);
                continue;
            }

            // integrate
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            // simple gravity
            p.vy += 300 * dt;

            // fade out
            p.alpha = 1 - (p.age / p.life);

            // draw as a short line (streak)
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,${230},${180},${p.alpha})`;
            ctx.lineWidth = Math.max(1, p.length / 8);
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 0.02, p.y - p.vy * 0.02);
            ctx.stroke();
        }

        // If idle (no recent pointer movement) reduce work: spawn subtle ambient stars slowly
        if (!isPointerDown && particles.length < 120 && Math.random() < 0.02) {
            spawnStar(random(0, canvas.clientWidth), -10);
        }

        requestAnimationFrame(frame);
    }

    // Start loop
    requestAnimationFrame(frame);

    // Ensure canvas CSS size is synced with actual drawing size on load
    window.addEventListener('load', resize);
})();

/* NOTE: custom cursor behavior removed from this file.
   Cursor is managed separately in `index.html` to keep responsibilities separated. */