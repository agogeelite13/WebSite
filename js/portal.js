/**
 * PORTAL REVEAL ANIMATION MODULE
 * Inverted Mask Approach for Maximum Performance & Zero Flicker
 */

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('portal-overlay');
    const ring = document.getElementById('portal-ring');
    const siteWrapper = document.getElementById('site-wrapper');
    
    if (!overlay || !ring || typeof gsap === 'undefined') {
        document.body.classList.remove('portal-loading');
        return;
    }

    // 1. Initial State Setup
    document.body.classList.add('portal-loading');
    gsap.set(overlay, { width: 0, height: 0 });
    gsap.set(ring, { width: 0, height: 0, opacity: 0 });
    if (siteWrapper) gsap.set(siteWrapper, { scale: 1.08, opacity: 0 });

    // 2. The Timeline
    const tl = gsap.timeline({
        onComplete: () => {
            document.body.classList.remove('portal-loading');
            document.body.classList.add('portal-finished');
        }
    });

    // Start delay for cinematic tension
    tl.to(ring, {
        duration: 1.0,
        opacity: 1,
        width: '60px',
        height: '60px',
        ease: "power2.out"
    }, "+=0.2");

    tl.to(siteWrapper, {
        duration: 0.8,
        opacity: 1,
        ease: "power1.inOut"
    }, "-=0.5");

    // The Expansion (Opening the hole)
    const expansionDuration = 2.4;
    const finalSize = Math.max(window.innerWidth, window.innerHeight) * 3;

    tl.to([overlay, ring], {
        duration: expansionDuration,
        width: finalSize,
        height: finalSize,
        ease: "expo.inOut" // Heavy, cinematic curve
    }, "-=0.3");

    // Smooth reveal of site content
    if (siteWrapper) {
        tl.to(siteWrapper, {
            duration: expansionDuration + 0.5,
            scale: 1,
            ease: "power4.out"
        }, "-=" + expansionDuration);
    }

    // Fade out the ring at the end
    tl.to(ring, {
        duration: 0.8,
        opacity: 0,
        ease: "power2.out"
    }, "-=0.8");

});
