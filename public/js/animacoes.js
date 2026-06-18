document.addEventListener('DOMContentLoaded', () => {

    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.gsap-fade-up').forEach((el) => {
        gsap.from(el, {
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        });
    });

    gsap.utils.toArray('.gsap-fade-down').forEach((el) => {
        gsap.from(el, {
            y: -40,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    gsap.utils.toArray('.gsap-fade-left').forEach((el) => {
        gsap.from(el, {
            x: -60,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    gsap.utils.toArray('.gsap-fade-right').forEach((el) => {
        gsap.from(el, {
            x: 60,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    gsap.utils.toArray('.gsap-scale').forEach((el) => {
        gsap.from(el, {
            scale: 0.8,
            opacity: 0,
            duration: 0.7,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    const staggerContainers = document.querySelectorAll('.gsap-stagger');
    staggerContainers.forEach(container => {
        const children = container.children;
        if (children.length === 0) return;
        gsap.from(children, {
            y: 50,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: container,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        });
    });

});
