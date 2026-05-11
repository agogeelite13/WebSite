/**
 * PORTAL REVEAL ANIMATION MODULE
 * Powered by GSAP for AAA Performance
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('portal-reveal-container');
    const ring = document.getElementById('portal-ring');
    
    if (!container || !ring || typeof gsap === 'undefined') {
        console.warn('Portal Reveal: Dependencies missing or elements not found.');
        document.body.classList.remove('portal-loading');
        return;
    }

    // 1. Initial State Setup
    gsap.set(container, { clipPath: 'circle(0% at 50% 50%)' });
    gsap.set(ring, { width: 0, height: 0, opacity: 0 });
    gsap.set("#portal-reveal-content", { scale: 1.1 });

    // 2. The Timeline
    const tl = gsap.timeline({
        onComplete: () => {
            document.body.classList.remove('portal-loading');
            document.body.classList.add('portal-finished');
        }
    });

    // Start delay for cinematic tension
    tl.to(ring, {
        duration: 1.2,
        opacity: 0.8,
        width: '40px',
        height: '40px',
        ease: "power2.out"
    }, "+=0.3");

    // The Expansion
    tl.to(container, {
        duration: 2.5,
        clipPath: 'circle(150% at 50% 50%)',
        ease: "power4.inOut"
    }, "-=0.6");

    tl.to("#portal-reveal-content", {
        duration: 2.8,
        scale: 1,
        ease: "power4.out"
    }, "-=2.5");

    tl.to(ring, {
        duration: 2.5,
        width: '300vw',
        height: '300vw',
        opacity: 0,
        ease: "power4.inOut"
    }, "-=2.5");

});
