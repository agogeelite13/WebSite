/**
 * AGOGE ELITE - Tactical Particles Background
 * A subtle, interactive particle system for glassmorphism aesthetics.
 */

export const initBackground = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Boundary check
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            // Mouse interaction (subtle repel)
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                const angle = Math.atan2(dy, dx);
                const force = (150 - distance) / 1500;
                this.x -= Math.cos(angle) * force;
                this.y -= Math.sin(angle) * force;
            }
        }

        draw() {
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`; // Gold particles
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const initParticles = () => {
        particles = [];
        const count = Math.min(Math.floor((width * height) / 15000), 100);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    };

    initParticles();

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    };

    animate();
};
