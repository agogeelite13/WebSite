const initPortal = () => {
    const hole = document.getElementById('portal-hole');
    const ring = document.getElementById('portal-ring');
    const svgOverlay = document.getElementById('portal-svg');
    
    if (!hole || !ring || typeof gsap === 'undefined') {
        document.body.classList.remove('portal-loading');
        document.body.style.background = ''; // Fallback
        return;
    }

    // 1. Initial State Setup
    document.body.classList.add('portal-loading');
    gsap.set(hole, { attr: { r: 0 } });
    gsap.set(ring, { width: 0, height: 0, opacity: 0 });

    // 2. The Timeline
    const tl = gsap.timeline({
        delay: 0.2, 
        onComplete: () => {
            document.body.classList.remove('portal-loading');
            document.body.classList.add('portal-finished');
            document.body.style.background = ''; // Safety
        }
    });

    // Anillo inicial
    tl.to(ring, {
        duration: 0.8,
        opacity: 1,
        width: '60px',
        height: '60px',
        ease: "power2.out"
    });

    // Expansión del Hueco (Portal)
    tl.to(hole, {
        duration: 2.2,
        attr: { r: 150 },
        ease: "expo.inOut"
    }, "-=0.2");

    // Sincronización del anillo
    tl.to(ring, {
        duration: 2.2,
        width: '300vw',
        height: '300vw',
        ease: "expo.inOut"
    }, "-=2.2");

    // Desvanecimiento del overlay e interacción
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
