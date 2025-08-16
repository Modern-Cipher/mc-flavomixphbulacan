// assets/js/order-modal.js

import { db } from "./firebase-init.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Define products here (same as before)
const products = [
    {
        id: 'flavomix-1',
        name: 'Flavo Mix (1 box)',
        price: 499,
        isDiscounted: false,
        description: "Perfect for daily wellness.",
        imageUrl: 'https://content.pancake.vn/1/s554x1186/fwebp/b4/46/68/a9/624d62d2c16697e272135f5d5efc29c41d8d481e6ec09c1928268ae7-w:1440-h:3081-l:2793131-t:image/png.png'
    },
    {
        id: 'flavomix-3plus1',
        name: 'Flavo Mix (3 boxes + 1 Free)',
        originalPrice: 1996,
        discountedPrice: 1497,
        isDiscounted: true,
        discountText: 'Special Bundle!',
        description: "Buy 3, get 1 FREE! Great value!",
        imageUrl: 'https://content.pancake.vn/1/s462x462/fwebp/b3/18/35/5a/5de6ba7c9cd9414b2ec7acd29db2f1fca06cf6fad38fff7065ae108f.png'
    },
    {
        id: 'flavomix-5plus1',
        name: 'Flavo Mix (5 boxes + 1 Free)',
        originalPrice: 2994,
        discountedPrice: 2495,
        isDiscounted: true,
        discountText: 'Bestseller Bundle!',
        description: "Get more for less!", // Added description to prevent TypeError
        imageUrl: 'https://content.pancake.vn/1/s462x462/fwebp/d9/fa/94/d6/4033d1213ce234778880d885d2fbecc1455b279a7725885bb4c5653e.png'
    },
    {
        id: 'flavomix-single-sachet',
         name: 'Flavo Mix Coffee',
        price: 4999,
        isDiscounted: false,
        description: "Perfect for on-the-go wellness.",
        imageUrl: 'https://content.pancake.vn/1/s750x750/fwebp/2a/e4/07/82/3982fa2dfff7f8e7d933bf6a10c7281bd03971c32272541ce1f17af5-w:2048-h:2048-l:1460339-t:image/jpeg.jpg'
    },
    {
        id: 'flavomix-sample-pack',
        name: 'Flavo Mix (Sample Pack)',
        price: 150,
        isDiscounted: false,
        description: "Try out our popular blend.",
        imageUrl: 'https://content.pancake.vn/1/s750x750/fwebp/1e/32/0f/57/1d9e8c41a79d6a17d0c574cbbcfc7fb05d8b47e42c3e1022807a9d14-w:1080-h:1080-l:567136-t:image/png.png'
    },
    {
        id: 'flavomix-promo-a',
        name: 'Flavo Mix (Promo A)',
        originalPrice: 14999,
        discountedPrice: 23619,
        isDiscounted: true,
        discountText: 'Limited Offer!',
        description: "Special deal for new customers.",
        imageUrl: 'https://content.pancake.vn/1/s750x750/fwebp/aa/37/08/b0/f0ea240a88e8f10c684c70f26e9f37d57df5c6d20eaee40b1862f2e1-w:2048-h:2048-l:1886158-t:image/jpeg.jpg'
    },
    {
        id: 'flavomix-promo-b',
        name: 'Flavo Mix (Promo B)',
        originalPrice: 2495,
        discountedPrice: 2199,
        isDiscounted: true,
        discountText: 'Bulk Buy!',
        description: "Save more with this bulk discount.",
        imageUrl: 'https://content.pancake.vn/1/s462x462/fwebp/57/9a/63/ab/877ce2ffb71c4db27af554a6ddf1fb039f57a55b41ef58fdfaa2b638.png'
    }
];

// Expose products and productQuantities to the global scope or via a custom event
// This allows product-gallery.js to access this data.
window.appProducts = products;
window.productQuantities = {}; // Will be managed by this modal script, but exposed for initial sync

document.addEventListener('DOMContentLoaded', () => {
    const orderModalElement = document.getElementById('orderModal');
    const orderModal = new bootstrap.Modal(orderModalElement);
    
    const productSelectionSection = document.getElementById('productSelectionSection');
    const shippingInfoSection = document.getElementById('shippingInfoSection');
    const modalContentWrapper = document.querySelector('.modal-content-wrapper'); // Get the wrapper
    const orderForm = document.getElementById('orderForm'); 

    const mobileNumberInput = document.getElementById('mobileNumber');
    const emailAddressInput = document.getElementById('emailAddress');
    const provinceSelect = document.getElementById('provinceSelect');
    const citySelect = document.getElementById('citySelect');
    const barangaySelect = document.getElementById('barangaySelect');
    const productSelectionRow = document.getElementById('productSelection');
    const orderTotalSpan = document.getElementById('orderTotal');
    const pageContainer = document.querySelector('.page-container');
    const productSearchInput = document.getElementById('productSearch');
    const productCardsContainer = document.getElementById('productCardsContainer');

    // Buttons
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const shippingDetailsBtn = document.getElementById('shippingDetailsBtn');
    const backToProductsBtn = document.getElementById('backToProductsBtn');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    const firestoreDb = db;
    const firestoreCollection = collection;
    const firestoreAddDoc = addDoc;

    if (!firestoreDb) {
        console.error("Firebase Firestore instance not available. Check firebase-init.js and its import.");
        Swal.fire({
            icon: 'error',
            title: 'Firebase Error',
            text: 'Firestore not initialized. Please check console for details.',
            confirmButtonColor: '#4CAF50'
        });
        return;
    }

    let allProvincesData = [];
    let allCitiesMunicipalitiesData = {};
    let allBarangaysData = {};

    let currentTotal = 0;
    let isProvincesLoaded = false;
    let currentModalStage = 'products'; // 'products' or 'shipping'

    // productQuantities is now `window.productQuantities`
    // Initialize quantities to 0 for all products
    products.forEach(product => {
        window.productQuantities[product.id] = 0;
    });

    // --- Modal Stage Management with GSAP Animation ---
    function setModalStage(stage) {
        currentModalStage = stage;
        if (stage === 'products') {
            gsap.to(modalContentWrapper, {
                x: '0%', // Slide to show product section
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    // Show/Hide buttons for product selection stage
                    cancelOrderBtn.classList.remove('d-none');
                    shippingDetailsBtn.classList.remove('d-none');
                    backToProductsBtn.classList.add('d-none');
                    placeOrderBtn.classList.add('d-none');
                    // Ensure search bar is visible
                    productSearchInput.closest('.mb-3').classList.remove('d-none');
                    // Scroll to top of product section
                    productCardsContainer.scrollTop = 0;
                    // Remove validation feedback when going back to products
                    orderForm.classList.remove('was-validated');
                }
            });
        } else if (stage === 'shipping') {
            gsap.to(modalContentWrapper, {
                x: '-50%', // Slide to show shipping section
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    // Show/Hide buttons for shipping stage
                    cancelOrderBtn.classList.add('d-none'); 
                    shippingDetailsBtn.classList.add('d-none');
                    backToProductsBtn.classList.remove('d-none');
                    placeOrderBtn.classList.remove('d-none');
                    // Hide search bar
                    productSearchInput.closest('.mb-3').classList.add('d-none');
                    // Scroll to top of shipping form
                    shippingInfoSection.scrollTop = 0;
                    // Focus on the first input field in shipping form for accessibility
                    document.getElementById('firstName').focus();
                }
            });
        }
    }

    // --- Fetch Location Data from PSGC Cloud API (unchanged) ---
    async function fetchProvinces() {
        if (isProvincesLoaded && allProvincesData.length > 0) {
            console.log('Provinces already loaded, skipping fetch.');
            populateProvincesDropdown();
            return;
        }

        try {
            console.log('Fetching all provinces from PSGC Cloud API...');
            provinceSelect.innerHTML = '<option value="">Loading Provinces...</option>';
            provinceSelect.disabled = true;

            const response = await fetch('https://psgc.cloud/api/provinces');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
            }
            allProvincesData = await response.json();
            allProvincesData.sort((a, b) => a.name.localeCompare(b.name));
            isProvincesLoaded = true;
            console.log(`Successfully fetched ${allProvincesData.length} provinces.`);
            populateProvincesDropdown();
        } catch (error) {
            console.error('Error fetching provinces:', error);
            provinceSelect.innerHTML = '<option value="">Failed to load Provinces</option>';
            provinceSelect.disabled = true;
        }
    }

    async function fetchCitiesMunicipalities(provinceCode) {
        if (allCitiesMunicipalitiesData[provinceCode]) {
            populateCitiesDropdown(provinceCode);
            return;
        }
        try {
            console.log(`Fetching cities/municipalities for province ${provinceCode} from PSGC Cloud API...`);
            citySelect.innerHTML = '<option value="">Loading Cities/Municipalities...</option>';
            citySelect.disabled = true;

            const response = await fetch(`https://psgc.cloud/api/provinces/${provinceCode}/cities-municipalities`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
            }
            const data = await response.json();
            data.sort((a, b) => a.name.localeCompare(b.name));
            allCitiesMunicipalitiesData[provinceCode] = data;
            console.log(`Successfully fetched ${data.length} cities/municipalities for ${provinceCode}.`);
            populateCitiesDropdown(provinceCode);
        } catch (error) {
            console.error(`Error fetching cities/municipalities for ${provinceCode}:`, error);
            citySelect.innerHTML = '<option value="">Failed to load Cities/Municipalities</option>';
            citySelect.disabled = true;
            barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
            barangaySelect.disabled = true;
        }
    }

    async function fetchBarangays(cityOrMunicipalityCode) {
        if (allBarangaysData[cityOrMunicipalityCode]) {
            populateBarangaysDropdown(cityOrMunicipalityCode);
            return;
        }
        try {
            console.log(`Fetching barangays for city/municipality ${cityOrMunicipalityCode} from PSGC Cloud API...`);
            barangaySelect.innerHTML = '<option value="">Loading Barangays...</option>';
            barangaySelect.disabled = true;

            const response = await fetch(`https://psgc.cloud/api/cities-municipalities/${cityOrMunicipalityCode}/barangays`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
            }
            const data = await response.json();
            data.sort((a, b) => a.name.localeCompare(b.name));
            allBarangaysData[cityOrMunicipalityCode] = data;
            console.log(`Successfully fetched ${data.length} barangays for ${cityOrMunicipalityCode}.`);
            populateBarangaysDropdown(cityOrMunicipalityCode);
        } catch (error) {
            console.error(`Error fetching barangays for ${cityOrMunicipalityCode}:`, error);
            barangaySelect.innerHTML = '<option value="">Failed to load Barangays</option>';
            barangaySelect.disabled = true;
        }
    }

    function populateProvincesDropdown() {
        provinceSelect.innerHTML = '<option value="">Select Province</option>';
        provinceSelect.disabled = false;
        allProvincesData.forEach(province => {
            const option = document.createElement('option');
            option.value = province.code;
            option.textContent = province.name;
            provinceSelect.appendChild(option);
        });
    }

    function populateCitiesDropdown(provinceCode) {
        citySelect.innerHTML = '<option value="">Select City / Municipality</option>';
        citySelect.disabled = true;
        barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
        barangaySelect.disabled = true;

        const cities = allCitiesMunicipalitiesData[provinceCode];
        if (cities && cities.length > 0) {
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.code;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
            citySelect.disabled = false;
        }
    }

    function populateBarangaysDropdown(cityCode) {
        barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
        barangaySelect.disabled = true;

        const barangays = allBarangaysData[cityCode];
        if (barangays && barangays.length > 0) {
            barangays.forEach(barangay => {
                const option = document.createElement('option');
                option.value = barangay.code;
                option.textContent = barangay.name;
                barangaySelect.appendChild(option);
            });
            barangaySelect.disabled = false;
        }
    }

    // --- Render Products with GSAP animation on filter ---
    function renderProducts(filteredProducts = products) {
        // First, fade out current products with animation
        const currentProductCards = Array.from(productSelectionRow.children);
        // Check if there are actual product cards, not just "No products found" message
        if (currentProductCards.length > 0 && !currentProductCards[0].classList.contains('text-muted')) {
            gsap.to(currentProductCards, {
                opacity: 0,
                scale: 0.8,
                duration: 0.15, // Faster fade out
                stagger: 0.03, // Slight stagger effect
                onComplete: () => {
                    productSelectionRow.innerHTML = ''; // Clear existing products after fade out
                    appendNewProducts(filteredProducts);
                }
            });
        } else {
            // If no existing cards or if it's the "No products found" message, just append new ones
            productSelectionRow.innerHTML = ''; 
            appendNewProducts(filteredProducts);
        }
    }

    function appendNewProducts(filteredProducts) {
        if (filteredProducts.length === 0) {
            productSelectionRow.innerHTML = '<div class="col-12 text-center text-muted py-4">No products found matching your search.</div>';
            gsap.fromTo(productSelectionRow.children, 
                { opacity: 0, scale: 0.8 }, 
                { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.7)" });
            return;
        }

        filteredProducts.forEach(product => {
            const colDiv = document.createElement('div');
            // Updated: col-12 for mobile (1 column), col-sm-6 for small devices (2 columns), col-lg-3 for large devices (4 columns)
            colDiv.className = 'col-12 col-sm-6 col-lg-3 mb-3 product-card-col'; 

            const productCard = document.createElement('div');
            productCard.className = 'card product-card h-100';
            productCard.dataset.productId = product.id;

            // Thumbnail Image (on top)
            const img = document.createElement('img');
            img.src = product.imageUrl;
            img.alt = product.name;
            img.className = 'card-img-top product-thumbnail-lg';
            img.onerror = function() {
                this.classList.add('broken-image');
                this.src = ''; // Clear src to stop trying to load
                this.alt = 'Image not found for ' + product.name;
            };
            productCard.appendChild(img);

            // Card Body (for details)
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';

            const productNameLabel = document.createElement('h6');
            productNameLabel.className = 'card-title product-label mb-1';
            productNameLabel.textContent = product.name;
            cardBody.appendChild(productNameLabel);

            const descriptionElem = document.createElement('p');
            descriptionElem.className = 'card-text product-description text-muted mb-2 flex-grow-1';
            descriptionElem.textContent = product.description || "No description available."; 
            cardBody.appendChild(descriptionElem);

            // Price Badges Container
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

            // Quantity Controls
            const quantityControls = document.createElement('div');
            quantityControls.className = 'quantity-controls mt-auto';

            const minusButton = document.createElement('button');
            minusButton.type = 'button';
            minusButton.className = 'btn quantity-btn minus-btn';
            minusButton.disabled = true;

            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.className = 'form-control quantity-input';
            quantityInput.value = window.productQuantities[product.id]; // Use window.productQuantities
            quantityInput.min = '0';
            quantityInput.dataset.productId = product.id;

            const plusButton = document.createElement('button');
            plusButton.type = 'button';
            plusButton.className = 'btn quantity-btn plus-btn';

            quantityControls.appendChild(minusButton);
            quantityControls.appendChild(quantityInput);
            quantityControls.appendChild(plusButton);
            cardBody.appendChild(quantityControls);


            productCard.appendChild(cardBody);
            colDiv.appendChild(productCard);
            productSelectionRow.appendChild(colDiv);

            // Update card selection style based on initial quantity
            if (window.productQuantities[product.id] > 0) { // Use window.productQuantities
                productCard.classList.add('selected-product-card');
                minusButton.disabled = false;
            }


            // --- Event Listeners for Quantity Controls ---
            const updateQuantityAndTotal = (newQuantity) => {
                newQuantity = Math.floor(Math.max(0, newQuantity)); // Ensure whole number and non-negative

                window.productQuantities[product.id] = newQuantity; // Use window.productQuantities
                quantityInput.value = window.productQuantities[product.id];

                minusButton.disabled = window.productQuantities[product.id] === 0;

                if (window.productQuantities[product.id] > 0) {
                    productCard.classList.add('selected-product-card');
                } else {
                    productCard.classList.remove('selected-product-card');
                }

                updateOrderTotal(); // Recalculate total
                // Trigger an event to notify product-gallery.js about quantity change
                const event = new CustomEvent('productQuantityChanged', { detail: { productId: product.id, quantity: newQuantity } });
                window.dispatchEvent(event);
            };

            minusButton.addEventListener('click', () => {
                updateQuantityAndTotal(window.productQuantities[product.id] - 1);
            });

            plusButton.addEventListener('click', () => {
                updateQuantityAndTotal(window.productQuantities[product.id] + 1);
            });

            quantityInput.addEventListener('input', (event) => {
                let rawValue = event.target.value.replace(/[^0-9]/g, '');
                let newQuantity = parseInt(rawValue, 10);

                if (isNaN(newQuantity)) {
                    newQuantity = 0;
                }
                
                event.target.value = newQuantity;
                updateQuantityAndTotal(newQuantity);
            });
            
            productCard.addEventListener('click', (event) => {
                // Only increment if click is not on quantity controls itself
                if (!event.target.closest('.quantity-controls')) {
                    if (window.productQuantities[product.id] === 0) {
                        updateQuantityAndTotal(1);
                    }
                }
            });
        });
        // Animate new products in
        gsap.fromTo(productSelectionRow.children, 
            { opacity: 0, scale: 0.8 }, 
            { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: "back.out(1.7)" });
    }

    // --- Search Functionality ---
    productSearchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        const filteredProducts = products.filter(product => {
            const description = product.description || ""; 
            return product.name.toLowerCase().includes(searchTerm) ||
                   description.toLowerCase().includes(searchTerm);
        });
        renderProducts(filteredProducts);
    });

    function updateOrderTotal() {
        currentTotal = 0;
        products.forEach(product => {
            const quantity = window.productQuantities[product.id] || 0; // Use window.productQuantities
            if (quantity > 0) {
                const pricePerItem = product.isDiscounted ? product.discountedPrice : product.price;
                currentTotal += (pricePerItem * quantity);
            }
        });
        orderTotalSpan.textContent = `₱${currentTotal.toFixed(2)}`;
    }

    // --- Event Listeners for Location Dropdowns ---
    async function fetchProvincesAndPopulate() { // Moved to a separate function for clarity
        if (isProvincesLoaded && allProvincesData.length > 0) {
            populateProvincesDropdown();
            return;
        }
        try {
            provinceSelect.innerHTML = '<option value="">Loading Provinces...</option>';
            provinceSelect.disabled = true;
            const response = await fetch('https://psgc.cloud/api/provinces');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Response: ${errorText}`);
            }
            allProvincesData = await response.json();
            allProvincesData.sort((a, b) => a.name.localeCompare(b.name));
            isProvincesLoaded = true;
            populateProvincesDropdown();
        } catch (error) {
            console.error('Error fetching provinces:', error);
            provinceSelect.innerHTML = '<option value="">Failed to load Provinces</option>';
            provinceSelect.disabled = true;
        }
    }

    provinceSelect.addEventListener('change', (event) => {
        const selectedProvinceCode = event.target.value;
        if (selectedProvinceCode) {
            fetchCitiesMunicipalities(selectedProvinceCode);
        } else {
            citySelect.innerHTML = '<option value="">Select City / Municipality</option>';
            citySelect.disabled = true;
            barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
            barangaySelect.disabled = true;
        }
    });

    citySelect.addEventListener('change', (event) => {
        const selectedCityCode = event.target.value;
        if (selectedCityCode) {
            fetchBarangays(selectedCityCode);
        } else {
            barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
            barangaySelect.disabled = true;
        }
    });

    mobileNumberInput.addEventListener('input', (event) => {
        event.target.value = event.target.value.replace(/\D/g, '').substring(0, 10);
    });

    // --- Button Actions ---
    shippingDetailsBtn.addEventListener('click', () => {
        const selectedProductsWithQuantity = products.filter(p => window.productQuantities[p.id] > 0);
        if (selectedProductsWithQuantity.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'No Product Selected',
                text: 'Please select at least one product and specify a quantity to proceed.',
                confirmButtonColor: '#4CAF50'
            });
            return;
        }
        setModalStage('shipping');
    });

    backToProductsBtn.addEventListener('click', () => {
        setModalStage('products');
    });

    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const selectedProductsWithQuantity = products.filter(p => window.productQuantities[p.id] > 0);

        if (selectedProductsWithQuantity.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'No Product Selected',
                text: 'Please select at least one product and specify a quantity to place an order.',
                confirmButtonColor: '#4CAF50'
            });
            return;
        }

        if (mobileNumberInput.value.length !== 10) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Mobile Number',
                text: 'Please enter a valid 10-digit mobile number (e.g., 917xxxxxxx).',
                confirmButtonColor: '#4CAF50'
            });
            mobileNumberInput.focus();
            orderForm.classList.add('was-validated'); 
            return;
        }

        if (!provinceSelect.value || !citySelect.value || !barangaySelect.value) {
            Swal.fire({
                icon: 'error',
                title: 'Incomplete Address',
                text: 'Please select your Province, City/Municipality, and Barangay.',
                confirmButtonColor: '#4CAF50'
            });
            orderForm.classList.add('was-validated'); 
            return;
        }

        if (!orderForm.checkValidity()) {
            event.stopPropagation();
            orderForm.classList.add('was-validated');
            return;
        }

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            mobileNumber: '+63' + mobileNumberInput.value,
            emailAddress: emailAddressInput.value,
            streetAddress: document.getElementById('streetAddress').value,
            province: provinceSelect.options[provinceSelect.selectedIndex].textContent,
            city: citySelect.options[citySelect.selectedIndex].textContent,
            barangay: barangaySelect.options[barangaySelect.selectedIndex].textContent,
            selectedProducts: selectedProductsWithQuantity.map(product => {
                const quantity = window.productQuantities[product.id];
                return {
                    id: product.id,
                    name: product.name,
                    price: product.isDiscounted ? product.discountedPrice : product.price,
                    imageUrl: product.imageUrl || '',
                    quantity: quantity
                };
            }),
            totalAmount: currentTotal,
            timestamp: serverTimestamp(),
            status: 'New Order'
        };

        let productSummaryHtml = formData.selectedProducts.map(p =>
            `<li><img src="${p.imageUrl}" alt="${p.name}" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 8px; border-radius: 4px;"> ${p.name} (x${p.quantity}) - ₱${(p.price * p.quantity).toFixed(2)}</li>`
        ).join('');

        Swal.fire({
            title: 'Confirm Your Order Details',
            html: `
                <div style="text-align: left;">
                    <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
                    <p><strong>Mobile:</strong> ${formData.mobileNumber}</p>
                    ${formData.emailAddress ? `<p><strong>Email:</strong> ${formData.emailAddress}</p>` : ''}
                    <p><strong>Address:</strong> ${formData.streetAddress}, ${formData.barangay}, ${formData.city}, ${formData.province}</p>
                    <p><strong>Products:</strong></p>
                    <ul style="list-style-type: none; padding-left: 0;">
                        ${productSummaryHtml}
                    </ul>
                    <p><strong>Total Amount:</strong> <span style="font-size: 1.2em; font-weight: bold; color: var(--accent-green-default);">₱${formData.totalAmount.toFixed(2)}</span></p>
                    </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Confirm Order',
            cancelButtonText: 'Edit Order',
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#d33',
            reverseButtons: true,
            allowOutsideClick: false,
            customClass: {
                htmlContainer: 'swal2-html-container-left-align'
            },
            didOpen: () => {
                const htmlContainer = Swal.getHtmlContainer();
                if (htmlContainer) {
                    htmlContainer.style.color = 'var(--text-light)';
                }
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Processing Order...',
                    text: 'Please wait while we process your request.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    confirmButtonColor: '#4CAF50'
                });

                try {
                    const ordersCollection = firestoreCollection(firestoreDb, 'orders');
                    await firestoreAddDoc(ordersCollection, formData);

                    console.log('Order data sent to Firestore successfully!');

                    Swal.fire({
                        icon: 'success',
                        title: 'Order Placed!',
                        html: 'Your order has been successfully placed. We will contact you soon.<br><br>For any questions or inquiries, please feel free to message us on Facebook!',
                        confirmButtonText: 'Message Us on Facebook',
                        confirmButtonColor: '#4CAF50',
                        allowOutsideClick: false,
                        showCloseButton: true, // ADDED: Show "X" close button
                        preClose: () => { // ADDED: What to do if "X" is clicked
                            orderModal.hide(); // Hide the main order modal
                        }
                    }).then((facebookResult) => {
                        if (facebookResult.isConfirmed) {
                            window.open('https://www.facebook.com/flavomixphbulacan', '_blank');
                        }
                        orderModal.hide(); 
                    });

                } catch (error) {
                    console.error('Firestore submission error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Order Failed',
                        text: 'There was an error placing your order in Firestore. Please try again. Error: ' + error.message,
                        confirmButtonColor: '#4CAF50'
                    });
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                console.log('Order edit requested. Staying in modal.');
            }
        });
    });

    // --- Modal Event Listeners ---
    orderModalElement.addEventListener('show.bs.modal', (event) => {
        if (pageContainer) {
            pageContainer.removeAttribute('aria-hidden'); 
        }
        // If the modal is opened by product-gallery.js with pre-selected products,
        // we need to re-render the modal's product list to reflect the quantities.
        // This is done by triggering `renderProducts()` and `updateOrderTotal()`.
        renderProducts(); // Re-render product list in modal with current quantities
        updateOrderTotal(); // Update total based on current quantities
        setModalStage('products'); // Always start at product selection section

        // If 'relatedTarget' is from gallery's Buy Now button, we might need to sync quantities.
        // The CustomEvent listener will handle updating quantities.
        // The modal's renderProducts() and updateOrderTotal() will then display it.
    });

    orderModalElement.addEventListener('hidden.bs.modal', () => {
        orderForm.reset();
        orderForm.classList.remove('was-validated');
        
        // Reset product quantities to 0 and update display in BOTH modal and gallery
        products.forEach(product => {
            window.productQuantities[product.id] = 0; // Reset global quantities
        });
        
        // Trigger an event to update gallery product display
        const event = new CustomEvent('modalHiddenAndQuantitiesReset');
        window.dispatchEvent(event);

        // Re-render modal products and total based on reset quantities
        renderProducts(); 
        updateOrderTotal();

        productSearchInput.value = ''; // Clear modal search input

        populateProvincesDropdown();
        citySelect.innerHTML = '<option value="">Select City / Municipality</option>';
        citySelect.disabled = true;
        barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
        barangaySelect.disabled = true;

        if (pageContainer) {
            pageContainer.setAttribute('aria-hidden', 'true');
        }
    });

    // Event listener for quantity changes from product-gallery.js
    window.addEventListener('productQuantityChangedFromGallery', (event) => {
        const { productId, quantity } = event.detail;
        window.productQuantities[productId] = quantity;
        updateOrderTotal(); // Update modal's total based on gallery change
        // No need to re-render modal products here, it will be done on modal show.
    });


    // --- Initial Render of Products, Fetch Provinces on Modal Open ---
    renderProducts(); // Initial render of products in the modal when script loads
    
    orderModalElement.addEventListener('shown.bs.modal', () => {
        fetchProvincesAndPopulate(); // Use the new function for clarity
    });

});