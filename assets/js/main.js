document.addEventListener('DOMContentLoaded', function() {
    gsap.registerPlugin(ScrollTrigger);

    // --- ENTRANCE ANIMATION ---
    const tl = gsap.timeline({defaults: { ease: "power3.out" }});
    tl.from(".main-header-left, .main-header-right", { y: -30, opacity: 0, duration: 0.8, stagger: 0.2 })
      .from(".hero-title", { x: -50, opacity: 0, duration: 1 }, "-=0.5")
      .from(".hero-description", { x: -50, opacity: 0, duration: 1 }, "-=0.8")
      .from(".btn-secondary", { x: -50, opacity: 0, duration: 1 }, "-=0.8")
      .from(".hero-image-wrapper", { scale: 0.5, opacity: 0, duration: 1.2, ease: "elastic.out(1, 0.75)" }, "-=0.8")
      .from(".product-highlights", { x: 50, opacity: 0 }, "-=1");

    // --- FLOATING IMAGE ANIMATION ---
    gsap.to(".hero-image-wrapper", {
        y: -20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        duration: 3,
    });
    
    // --- SCROLL-TRIGGERED FADE-IN ---
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: "power3.out"
        });
    });
});