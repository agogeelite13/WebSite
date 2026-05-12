const initPortal = () => {
    const hole = document.getElementById('portal-hole');
    const ring = document.getElementById('portal-ring');
    const svgOverlay = document.getElementById('portal-svg');
    const overlayWrap = document.getElementById('portal-overlay-wrap');

    const cleanup = () => {
        document.body.classList.remove('portal-loading');
        document.body.classList.add('portal-finished');
        document.body.style.background = '';
        if (overlayWrap) overlayWrap.remove();
    };

    // Hard failsafe — remove overlay after 4 seconds no matter what
    setTimeout(cleanup, 4000);
    
    if (!hole || !ring || typeof gsap === 'undefined') {
        cleanup();
        return;
    }

    gsap.set(hole, { attr: { r: 0 } });
    gsap.set(ring, { width: 0, height: 0, opacity: 0 });

    const tl = gsap.timeline({
        delay: 0.2, 
        onComplete: cleanup
    });

    tl.to(ring, {
        duration: 0.8,
        opacity: 1,
        width: '60px',
        height: '60px',
        ease: "power2.out"
    });

    tl.to(hole, {
        duration: 2.2,
        attr: { r: 150 },
        ease: "expo.inOut"
    }, "-=0.2");

    tl.to(ring, {
        duration: 2.2,
        width: '300vw',
        height: '300vw',
        ease: "expo.inOut"
    }, "-=2.2");

    tl.to(svgOverlay, {
        duration: 0.5,
        opacity: 0,
        ease: "power2.out"
    }, "-=0.5");

    tl.to(ring, {
        duration: 0.8,
        opacity: 0,
        ease: "power2.out"
    }, "-=0.8");
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortal);
} else {
    initPortal();
}
