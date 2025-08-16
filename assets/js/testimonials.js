// assets/js/testimonials.js

document.addEventListener('DOMContentLoaded', () => {
    const testimonialsContainer = document.getElementById('testimonialsContainer');

    const testimonials = [
        {
            id: 'testi1',
            type: 'text', 
            quote: "Flavo Mix truly boosted my energy levels! I feel more active throughout the day.",
            author: 'Maria S.',
            source: 'Bulacan',
            avatar: 'https://content.pancake.vn/web-media/cf/82/68/e6/8ba3381cbd9a7f15f5a1f4a72af563c96794e0959c37ee88c32d9be7-w:0-h:0-l:14849-t:image/avif.avif', // Replace with actual avatar image
            rating: 5
        },
        {
            id: 'testi2',
            type: 'video',
            quote: "I used to feel sluggish, but Flavo Mix changed that. Highly recommended!",
            author: 'Juan D.',
            source: 'Manila',
            mediaUrl: 'https://www.youtube.com/embed/your_video_id_3', // REPLACE WITH ACTUAL EMBED URL
            rating: 5
        },
        {
            id: 'testi3',
            type: 'text',
            quote: "My digestion has significantly improved since I started drinking Flavo Mix. It's a game-changer!",
            author: 'Karen V.',
            source: 'Cebu',
            avatar: 'https://content.pancake.vn/1/s639x933/fwebp/2a/c7/2f/49/28d84858ebd243b2c79ea69aa636749aa59e25c8b43f09314f863b93-w:1176-h:1717-l:1344905-t:image/png.png', // Replace with actual avatar image
            rating: 4
        },
        {
            id: 'testi4',
            type: 'video',
            quote: "Getting my daily vitamins was never this easy and delicious. Flavo Mix is now my go-to wellness drink.",
            author: 'Mark A.',
            source: 'Davao',
            mediaUrl: 'https://www.youtube.com/embed/your_video_id_4', // REPLACE WITH ACTUAL EMBED URL
            rating: 5
        },
        {
            id: 'testi5',
            type: 'text',
            quote: "I love that it's all-natural. No jitters, just pure sustained energy.",
            author: 'Sophia L.',
            source: 'Pampanga',
            avatar: 'https://content.pancake.vn/1/s750x750/fwebp/04/6f/dd/06/90623a573c150c672effcb24150984545ff1b059fc419e9c811c0797.jpeg', // Replace with actual avatar image
            rating: 5
        }
    ];

    let isMobileView = window.innerWidth < 768; // Initial check for mobile view

    function getStarRatingHtml(rating) {
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                starsHtml += '<i class="fas fa-star"></i>'; // Filled star
            } else {
                starsHtml += '<i class="far fa-star"></i>'; // Empty star (outline)
            }
        }
        return `<div class="testimonial-stars">${starsHtml}</div>`;
    }

    // --- Render Testimonials ---
    function renderTestimonials(testimonialsToRender = testimonials) {
        // Only apply fade-out animation if on desktop view
        if (!isMobileView) {
            const currentTestimonialsCards = Array.from(testimonialsContainer.children);
            if (currentTestimonialsCards.length > 0 && !currentTestimonialsCards[0].classList.contains('text-muted')) {
                gsap.to(currentTestimonialsCards, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.15,
                    stagger: 0.03,
                    onComplete: () => {
                        testimonialsContainer.innerHTML = '';
                        appendNewTestimonials(testimonialsToRender);
                    }
                });
            } else {
                testimonialsContainer.innerHTML = '';
                appendNewTestimonials(testimonialsToRender);
            }
        } else { // Direct append on mobile
            testimonialsContainer.innerHTML = '';
            appendNewTestimonials(testimonialsToRender);
        }
    }

    function appendNewTestimonials(testimonialsToRender) {
        if (testimonialsToRender.length === 0) {
            testimonialsContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">No testimonials available at the moment.</div>';
            // Only animate "No testimonials found" message on desktop
            if (!isMobileView) {
                gsap.fromTo(testimonialsContainer.children, 
                    { opacity: 0, scale: 0.8 }, 
                    { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.7)" });
            }
            return;
        }

        testimonialsToRender.forEach(testi => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-12 col-sm-6 col-lg-4 mb-4 testimonial-card-col'; 

            const testimonialCard = document.createElement('div');
            testimonialCard.className = 'card testimonial-card h-100'; 
            testimonialCard.dataset.testiId = testi.id;

            let mediaHtml = '';
            if (testi.type === 'video') {
                mediaHtml = `
                    <div class="video-wrapper">
                        <iframe src="${testi.mediaUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                `;
            } else if (testi.type === 'text') {
                mediaHtml = `
                    <img src="${testi.avatar}" class="testimonial-avatar" alt="${testi.author} Avatar" onerror="this.src='#';">
                `;
            }

            testimonialCard.innerHTML = `
                ${mediaHtml}
                ${getStarRatingHtml(testi.rating)}
                <p class="testimonial-quote">"${testi.quote}"</p>
                <p class="testimonial-author">${testi.author}</p>
                <p class="testimonial-source">${testi.source}</p>
            `;
            
            colDiv.appendChild(testimonialCard);
            testimonialsContainer.appendChild(colDiv);
        });
        
        // Only animate new items in if not in mobile view
        if (!isMobileView) {
            gsap.fromTo(testimonialsContainer.children, 
                { opacity: 0, scale: 0.8 }, 
                { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: "back.out(1.7)" });
        }
    }

    renderTestimonials();

    // --- Mobile Carousel Initialization for Testimonials ---
    const updateMobileViewStatus = () => {
        isMobileView = window.innerWidth < 768; // Update mobile view status
    };

    updateMobileViewStatus();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateMobileViewStatus();
            renderTestimonials(); // Re-render to apply correct GSAP/non-GSAP logic
        }, 250);
    });
});