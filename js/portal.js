/**
 * PORTAL REVEAL ANIMATION MODULE
 * GPU-ACCELERATED VERSION (Zero Reflow / Maximum Smoothness)
 */

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('portal-overlay');
    const ring = document.getElementById('portal-ring');
    const siteWrapper = document.getElementById('site-wrapper');
    
    if (!overlay || !ring || typeof gsap === 'undefined') {
        document.body.classList.remove('portal-loading');
        return;
    }

    // 1. Initial State Setup (Instant)
    document.body.classList.add('portal-loading');
    gsap.set([overlay, ring], { 
        scale: 0, 
        xPercent: -50, 
        yPercent: -50, 
        top: "50%", 
        left: "50%",
        force3D: true 
    });
    
    // El sitio ya debe estar visible detrás, el overlay negro se encarga de taparlo
    if (siteWrapper) gsap.set(siteWrapper, { scale: 1.04, opacity: 1 });

    // 2. The Timeline
    const tl = gsap.timeline({
        delay: 0.3, 
        onComplete: () => {
            document.body.classList.remove('portal-loading');
            document.body.classList.add('portal-finished');
        }
    });

    // Anillo inicial (aparición sutil)
    tl.to(ring, {
        duration: 0.7,
        opacity: 1,
        scale: 4, // El anillo crece un poco para marcar el inicio
        ease: "back.out(1.7)"
    });

    // Expansión del Portal (Hole)
    // Calculamos el factor de escala necesario para cubrir cualquier pantalla
    const expansionScale = Math.max(window.innerWidth, window.innerHeight) / 2;

    tl.to([overlay, ring], {
        duration: 2.2,
        scale: expansionScale,
        ease: "expo.inOut" // Curva premium pesada
    }, "-=0.2");

    // Efecto Zoom-Out del contenido (Sincronizado)
    if (siteWrapper) {
        tl.to(siteWrapper, {
            duration: 2.5,
            scale: 1,
            ease: "power3.out"
        }, "-=2.2");
    }

    // Desvanecimiento final del anillo
    tl.to(ring, {
        duration: 1,
        opacity: 0,
        ease: "power2.out"
    }, "-=0.8");

});
