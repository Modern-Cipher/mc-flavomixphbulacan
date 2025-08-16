// assets/js/blog.js

document.addEventListener('DOMContentLoaded', () => {
    const blogPostsContainer = document.getElementById('blogPostsContainer');
    const blogSearchInput = document.getElementById('blogSearch');

    const blogPosts = [
        {
            id: 'blog1',
            type: 'video', 
            title: 'Flavo Mix: Your Daily Dose of Natural Wellness',
            description: 'Discover the amazing benefits of Flavo Mix and how it can boost your immunity and energy daily!',
            mediaUrl: 'https://www.youtube.com/embed/your_video_id_1', // REPLACE WITH YOUR ACTUAL EMBED URL
            date: 'July 20, 2025',
            keywords: 'wellness, immunity, energy, natural, health, benefits'
        },
        {
            id: 'blog2',
            type: 'image',
            title: 'Top 5 Superfoods in Flavo Mix',
            description: 'Learn about the powerful ingredients packed in every sachet of Flavo Mix and their incredible health benefits.',
            mediaUrl: 'https://content.pancake.vn/1/s750x750/fwebp/d7/32/b5/d7/1b28fafc71c3aed646e0f53f37d3af746e6c64caab4b8d3e9d7508f0.jpeg', // Replace with your image
            date: 'July 18, 2025',
            keywords: 'superfoods, ingredients, nutrition, healthy eating'
        },
        {
            id: 'blog3',
            type: 'video',
            title: 'Customer Journey: My Flavo Mix Story',
            description: 'Watch how Flavo Mix transformed my daily routine and helped me achieve a healthier lifestyle.',
            mediaUrl: 'https://www.youtube.com/embed/your_video_id_2', // REPLACE WITH ANOTHER ACTUAL EMBED URL
            date: 'July 15, 2025',
            keywords: 'customer story, testimonial, lifestyle, transformation'
        },
        {
            id: 'blog4',
            type: 'image',
            title: 'Behind the Scenes: Flavo Mix Quality Control',
            description: 'A sneak peek into our rigorous quality control process to ensure every Flavo Mix product is premium and safe.',
            mediaUrl: 'https://content.pancake.vn/1/s1444x908/fwebp/b5/c2/2b/34/f8b717d969f6d6d7e90687728a96dd1ba3aec78cf5d3d370ac745643.jpeg', // Replace with your image
            date: 'July 10, 2025',
            keywords: 'quality, production, safety, manufacturing'
        },
        {
            id: 'blog5',
            type: 'image',
            title: 'Hydration Tips for a Healthier You',
            description: 'Simple and effective tips to stay hydrated throughout the day, complementing your Flavo Mix intake.',
            mediaUrl: 'https://content.pancake.vn/1/s750x750/fwebp/b0/b6/5c/0a/989b07b447df4c9fcbf05abe6b826cf2829b46a901a01b6c83dd83a5.jpeg', // Replace with your image
            date: 'July 5, 2025',
            keywords: 'hydration, water, health tips, wellness'
        }
    ];

    let isMobileView = window.innerWidth < 768; // Initial check for mobile view

    // --- Render Blog Posts with GSAP animation on filter ---
    function renderBlogPosts(filteredPosts = blogPosts) {
        // Only apply fade-out animation if on desktop view
        if (!isMobileView) {
            const currentBlogCards = Array.from(blogPostsContainer.children);
            if (currentBlogCards.length > 0 && !currentBlogCards[0].classList.contains('text-muted')) {
                gsap.to(currentBlogCards, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.15,
                    stagger: 0.03,
                    onComplete: () => {
                        blogPostsContainer.innerHTML = '';
                        appendNewBlogPosts(filteredPosts);
                    }
                });
            } else {
                blogPostsContainer.innerHTML = '';
                appendNewBlogPosts(filteredPosts);
            }
        } else { // Direct append on mobile
            blogPostsContainer.innerHTML = '';
            appendNewBlogPosts(filteredPosts);
        }
    }

    function appendNewBlogPosts(filteredPosts) {
        if (filteredPosts.length === 0) {
            blogPostsContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">No blog posts found matching your search.</div>';
            // Only animate "No blog posts found" message on desktop
            if (!isMobileView) {
                gsap.fromTo(blogPostsContainer.children, 
                    { opacity: 0, scale: 0.8 }, 
                    { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.7)" });
            }
            return;
        }

        filteredPosts.forEach(post => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-12 col-sm-6 col-lg-4 mb-4 blog-card-col'; 

            const blogCard = document.createElement('div');
            blogCard.className = 'card blog-card h-100';
            blogCard.dataset.postId = post.id;

            let mediaHtml = '';
            if (post.type === 'video') {
                mediaHtml = `
                    <div class="video-wrapper">
                        <iframe src="${post.mediaUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                `;
            } else if (post.type === 'image') {
                mediaHtml = `
                    <img src="${post.mediaUrl}" class="card-img-top" alt="${post.title}" onerror="this.src='https://via.placeholder.com/600x400/FF0000/FFFFFF?text=Image+Not+Found';">
                `;
            }

            blogCard.innerHTML = `
                ${mediaHtml}
                <div class="card-body">
                    <h5 class="blog-title">${post.title}</h5>
                    <p class="blog-description">${post.description}</p>
                    <p class="blog-date mt-auto"><small>${post.date}</small></p>
                </div>
            `;
            
            colDiv.appendChild(blogCard);
            blogPostsContainer.appendChild(colDiv);
        });

        // Only animate new products in if not in mobile view
        if (!isMobileView) {
            gsap.fromTo(blogPostsContainer.children, 
                { opacity: 0, scale: 0.8 }, 
                { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: "back.out(1.7)" });
        }
    }

    // --- Search Functionality for Blog ---
    blogSearchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        const filteredPosts = blogPosts.filter(post => {
            const title = post.title.toLowerCase();
            const description = post.description.toLowerCase();
            const keywords = post.keywords ? post.keywords.toLowerCase() : ''; 
            
            return title.includes(searchTerm) ||
                   description.includes(searchTerm) ||
                   keywords.includes(searchTerm);
        });
        renderBlogPosts(filteredPosts);
    });

    renderBlogPosts();

    // --- Mobile Carousel Initialization for Blog ---
    const updateMobileViewStatus = () => {
        isMobileView = window.innerWidth < 768; // Update mobile view status
    };

    updateMobileViewStatus();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateMobileViewStatus();
            renderBlogPosts(); // Re-render to apply correct GSAP/non-GSAP logic
        }, 250);
    });
});