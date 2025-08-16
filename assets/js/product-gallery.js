// assets/js/product-gallery.js

document.addEventListener('DOMContentLoaded', () => {
    const galleryProductCardsContainer = document.getElementById('galleryProductCards');
    const galleryProductSearchInput = document.getElementById('galleryProductSearch');
    const orderModalElement = document.getElementById('orderModal');
    const orderModal = new bootstrap.Modal(orderModalElement);

    let products = window.appProducts || [];
    let productQuantities = window.productQuantities || {};

    if (!products || products.length === 0) {
        console.warn("Product data not found or empty from order-modal.js. Please ensure order-modal.js loads and defines window.appProducts correctly.");
        products = [ /* Define a default set or show error */ ]; 
    }

    let isMobileView = window.innerWidth < 768; // Initial check for mobile view

    // --- Render Products for Gallery Section ---
    function renderGalleryProducts(filteredProducts = products) {
        // Only apply fade-out animation if on desktop view
        if (!isMobileView) { // Apply GSAP animation only on desktop
            const currentGalleryCards = Array.from(galleryProductCardsContainer.children);
            if (currentGalleryCards.length > 0 && !currentGalleryCards[0].classList.contains('text-muted')) {
                gsap.to(currentGalleryCards, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.15,
                    stagger: 0.03,
                    onComplete: () => {
                        galleryProductCardsContainer.innerHTML = '';
                        appendNewGalleryProducts(filteredProducts);
                    }
                });
            } else {
                galleryProductCardsContainer.innerHTML = '';
                appendNewGalleryProducts(filteredProducts);
            }
        } else { // Direct append on mobile to prevent conflict with scroll-snap
            galleryProductCardsContainer.innerHTML = '';
            appendNewGalleryProducts(filteredProducts);
        }
    }

    function appendNewGalleryProducts(filteredProducts) {
        if (filteredProducts.length === 0) {
            galleryProductCardsContainer.innerHTML = '<div class="col-12 text-center text-muted py-4">No products found matching your search.</div>';
            // Only animate "No products found" message on desktop
            if (!isMobileView) {
                gsap.fromTo(galleryProductCardsContainer.children, 
                    { opacity: 0, scale: 0.8 }, 
                    { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.7)" });
            }
            return;
        }

        filteredProducts.forEach(product => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-12 col-sm-6 col-lg-3 mb-4 product-gallery-card-col'; 

            const productCard = document.createElement('div');
            productCard.className = 'card product-card gallery-card h-100';
            productCard.dataset.productId = product.id;

            const img = document.createElement('img');
            img.src = product.imageUrl;
            img.alt = product.name;
            img.className = 'card-img-top product-thumbnail-lg';
            img.onerror = function() {
                this.classList.add('broken-image');
                this.src = '';
                this.alt = 'Image not found for ' + product.name;
            };
            productCard.appendChild(img);

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';

            const productNameLabel = document.createElement('h5'); 
            productNameLabel.className = 'card-title product-label mb-1';
            productNameLabel.textContent = product.name;
            cardBody.appendChild(productNameLabel);

            const descriptionElem = document.createElement('p');
            descriptionElem.className = 'card-text product-description text-muted mb-2 flex-grow-1';
            descriptionElem.textContent = product.description || "No description available."; 
            cardBody.appendChild(descriptionElem);

            const priceContainer = document.createElement('div');
            priceContainer.className = 'product-price-badges mb-2';

            if (product.isDiscounted) {
                const originalPriceSpan = document.createElement('span');
                originalPriceSpan.className = 'text-decoration-line-through original-price-strike me-1';
                originalPriceSpan.textContent = `₱${product.originalPrice.toFixed(2)}`;
                priceContainer.appendChild(originalPriceSpan);

                const discountedPriceSpan = document.createElement('span');
                discountedPriceSpan.className = 'badge bg-success me-1';
                discountedPriceSpan.textContent = `₱${product.discountedPrice.toFixed(2)}`;
                priceContainer.appendChild(discountedPriceSpan);

                const discountBadge = document.createElement('span');
                discountBadge.className = 'badge bg-warning text-dark';
                discountBadge.textContent = product.discountText;
                priceContainer.appendChild(discountBadge);
            } else {
                const regularPriceSpan = document.createElement('span');
                regularPriceSpan.textContent = `₱${product.price.toFixed(2)}`;
                priceContainer.appendChild(regularPriceSpan);
            }
            cardBody.appendChild(priceContainer);

            const quantityControls = document.createElement('div');
            quantityControls.className = 'quantity-controls mt-auto';

            const minusButton = document.createElement('button');
            minusButton.type = 'button';
            minusButton.className = 'btn quantity-btn minus-btn';
            minusButton.disabled = true;

            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.className = 'form-control quantity-input gallery-quantity-input';
            quantityInput.value = productQuantities[product.id];
            quantityInput.min = '0';
            quantityInput.dataset.productId = product.id;

            const plusButton = document.createElement('button');
            plusButton.type = 'button';
            plusButton.className = 'btn quantity-btn plus-btn';

            quantityControls.appendChild(minusButton);
            quantityControls.appendChild(quantityInput);
            quantityControls.appendChild(plusButton);
            cardBody.appendChild(quantityControls);

            const buyNowButton = document.createElement('button');
            buyNowButton.type = 'button';
            buyNowButton.className = 'btn btn-green mt-3 w-100 buy-now-btn';
            buyNowButton.textContent = 'Buy Now';
            cardBody.appendChild(buyNowButton);

            productCard.appendChild(cardBody);
            colDiv.appendChild(productCard);
            galleryProductCardsContainer.appendChild(colDiv);

            if (productQuantities[product.id] > 0) {
                productCard.classList.add('selected-product-card');
                minusButton.disabled = false;
            }

            const updateGalleryQuantity = (newQuantity) => {
                newQuantity = Math.floor(Math.max(0, newQuantity));
                productQuantities[product.id] = newQuantity;
                quantityInput.value = productQuantities[product.id];
                minusButton.disabled = productQuantities[product.id] === 0;

                if (productQuantities[product.id] > 0) {
                    productCard.classList.add('selected-product-card');
                } else {
                    productCard.classList.remove('selected-product-card');
                }
                const event = new CustomEvent('productQuantityChangedFromGallery', { detail: { productId: product.id, quantity: newQuantity } });
                window.dispatchEvent(event);
            };

            minusButton.addEventListener('click', () => {
                updateGalleryQuantity(productQuantities[product.id] - 1);
            });

            plusButton.addEventListener('click', () => {
                updateGalleryQuantity(productQuantities[product.id] + 1);
            });

            quantityInput.addEventListener('input', (event) => {
                let rawValue = event.target.value.replace(/[^0-9]/g, '');
                let newQuantity = parseInt(rawValue, 10);
                if (isNaN(newQuantity)) { newQuantity = 0; }
                event.target.value = newQuantity;
                updateGalleryQuantity(newQuantity);
            });

            productCard.addEventListener('click', (event) => {
                if (!event.target.closest('.quantity-controls') && !event.target.closest('.buy-now-btn')) {
                    if (productQuantities[product.id] === 0) {
                        updateGalleryQuantity(1);
                    }
                }
            });

            buyNowButton.addEventListener('click', () => {
                if (productQuantities[product.id] === 0) {
                    updateGalleryQuantity(1);
                }
                orderModal.show();
            });
        });

        // Only animate new products in if not in mobile view
        if (!isMobileView) {
            gsap.fromTo(galleryProductCardsContainer.children, 
                { opacity: 0, scale: 0.8 }, 
                { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: "back.out(1.7)" });
        }
    }

    // --- Search Functionality for Gallery ---
    galleryProductSearchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        const filteredProducts = products.filter(product => {
            const description = product.description || "";
            return product.name.toLowerCase().includes(searchTerm) ||
                   description.toLowerCase().includes(searchTerm);
        });
        renderGalleryProducts(filteredProducts);
    });

    window.addEventListener('modalHiddenAndQuantitiesReset', () => {
        renderGalleryProducts();
    });

    renderGalleryProducts();

    // --- Mobile Carousel Initialization for Gallery ---
    const updateMobileViewStatus = () => {
        isMobileView = window.innerWidth < 768; // Update mobile view status
    };

    // Apply on load
    updateMobileViewStatus();
    // Apply on window resize (with debounce for performance)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateMobileViewStatus();
            renderGalleryProducts(); // Re-render to apply correct GSAP/non-GSAP logic
        }, 250);
    });

});