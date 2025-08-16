// Features Carousel - Splide + YouTube + Lightbox (FULL FILE)
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('featuresSplide');
  const list = root?.querySelector('.splide__list');
  if (!root || !list) return;

  /* ----------------- helpers ----------------- */
  function getYouTubeVideoId(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) return u.pathname.split('/')[1] || null;
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || u.pathname.split('/')[1] || null;
      const v = u.searchParams.get('v'); if (v) return v;
      const parts = u.pathname.split('/');
      const idx = parts.findIndex(p => ['embed','v','e'].includes(p));
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    } catch (_) {}
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|v\/|.*[?&]v=))([^"&?\/]{11})/);
    return m ? m[1] : null;
  }

  function buildEmbedUrl(id) {
    const q = new URLSearchParams({
      autoplay: '1', mute: '1', loop: '1', playlist: id,
      controls: '0', rel: '0', modestbranding: '1', playsinline: '1',
      iv_load_policy: '3', enablejsapi: '1'
    });
    return `https://www.youtube.com/embed/${id}?${q.toString()}`;
  }

  /* ----------------- data ----------------- */
  const videoUrls = [
    'https://youtu.be/Kwq1rLGE7qw',
    'https://www.youtube.com/shorts/tEOsOxK1w68?feature=share',
    'https://youtu.be/jmkT7g_DO58',
    'https://youtu.be/NRljH9gI2BQ',
    'https://youtu.be/FcSa4InQg6c',
    'https://youtu.be/RjbswDa40RQ',
    'https://youtu.be/RppLn3AcXcY',
  ];

  const features = [
    {
      type: 'text',
      title: 'Boosts Immunity Naturally',
      description: "Flavo Mix is packed with antioxidants and essential vitamins that support your body's defenses.",
    },
    // insert videos
    ...videoUrls.map((u) => ({ type: 'video', title: 'See Flavo Mix in Action', videoUrl: u })),
    {
      type: 'text',
      title: 'Enhances Energy & Focus',
      description: 'Experience steady energy and improved clarity throughout your day.',
    },
    {
      type: 'certification',
      title: 'Certified Quality for Your Peace of Mind',
      description: 'Flavo Mix is rigorously tested and certified by FDA and Halal authorities.',
      images: [
        { src: 'assets/images/fda.jpg',   alt: 'FDA Approved Certificate' },
        { src: 'assets/images/halal.png', alt: 'Halal Certified Certificate' },
      ],
    },
  ];

  /* ----------------- render ----------------- */
  list.innerHTML = '';
  features.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'splide__slide';

    if (item.type === 'video') {
      const id = getYouTubeVideoId(item.videoUrl);
      const embed = id ? buildEmbedUrl(id) : null;
      li.innerHTML = embed ? `
        <div class="features-carousel-content features-carousel-video-content">
          <div class="video-container">
            <iframe src="${embed}" frameborder="0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen loading="lazy"></iframe>
          </div>
          <div class="video-text-overlay">
            <h3 class="feature-title">${item.title || 'Flavo Mix'}</h3>
          </div>
        </div>
      ` : `
        <div class="features-carousel-content">
          <h3 class="feature-title">Video Error</h3>
          <p class="feature-description">Invalid YouTube URL.</p>
        </div>
      `;
    }

    if (item.type === 'text') {
      li.innerHTML = `
        <div class="features-carousel-content">
          <div class="feature-number">${String(idx + 1).padStart(2,'0')}</div>
          <h3 class="feature-title">${item.title}</h3>
          <p class="feature-description">${item.description}</p>
        </div>
      `;
    }

    if (item.type === 'certification') {
      li.innerHTML = `
        <div class="features-carousel-content">
          <h3 class="feature-title">${item.title}</h3>
          <p class="feature-description">${item.description}</p>
          <div class="certifications-area-carousel">
            <h4 class="text-light">Our Certifications</h4>
            <div class="cert-logos">
              ${item.images.map(i => `<img class="cert-logo lightboxable" src="${i.src}" alt="${i.alt}">`).join('')}
            </div>
            <p class="small text-light mt-2">These certifications ensure our products meet strict quality and safety standards.</p>
          </div>
        </div>
      `;
    }

    list.appendChild(li);
  });

  /* ----------------- Splide init ----------------- */
  if (typeof Splide === 'undefined') { console.error('Splide not loaded'); return; }

  const DEFAULT_INTERVAL = 8000;   // 8s for non-video
  const VIDEO_INTERVAL   = 30000;  // 30s for video

  const splide = new Splide(root, {
    type: 'loop',
    autoplay: true,
    interval: DEFAULT_INTERVAL,    // base interval; we adjust per slide below
    pauseOnHover: true,
    perPage: 1,
    arrows: true,
    pagination: true,
    drag: true,
    speed: 800,
    heightRatio: 0.62,
    breakpoints: {
      1200: { heightRatio: 0.58 },
      992:  { heightRatio: 0.60 },
      768:  { heightRatio: 0.68 },
      480:  { heightRatio: 0.78 },
    },
  });

  // Adjust interval based on slide type + manage YT playback
  splide.on('active', (slide) => {
    // pause all videos
    document.querySelectorAll('#featuresSplide iframe').forEach((f) => {
      f.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    });

    const iframe = slide.slide.querySelector('iframe');
    const isVideo = !!iframe;

    // longer time for videos
    splide.options = { interval: isVideo ? VIDEO_INTERVAL : DEFAULT_INTERVAL };

    // play active video
    if (iframe) {
      iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }
  });

  splide.mount();

  /* ----------------- simple lightbox ----------------- */
  function ensureLightbox() {
    let box = document.querySelector('.fm-lightbox');
    if (box) return box;
    box = document.createElement('div');
    box.className = 'fm-lightbox';
    box.innerHTML = `
      <button class="fm-close" aria-label="Close">✕</button>
      <img alt="">
    `;
    document.body.appendChild(box);
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target.classList.contains('fm-close')) {
        box.classList.remove('show');
      }
    });
    return box;
  }

  function openLightbox(src, alt='') {
    const box = ensureLightbox();
    const img = box.querySelector('img');
    img.src = src; img.alt = alt;
    box.classList.add('show');
  }

  document.addEventListener('click', (e) => {
    const target = e.target.closest('.lightboxable');
    if (!target) return;
    openLightbox(target.getAttribute('src'), target.getAttribute('alt') || '');
  });
});
