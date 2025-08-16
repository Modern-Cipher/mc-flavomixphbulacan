// assets/js/dynamic-content.js

// --- Data for Hero Content ---
const heroContent = {
    title: "Your Daily Dose<br>of Wellness",
    description: "Experience the all-in-one natural goodness of Flavo Mix.",
    buttonText: "Order Now",
    buttonLink: "#products",
    benefits: [
        "Combats Fatigue",
        "Improves Mood & Balances Mood Swings.",
        "Lowers Risk of Heart Attack & Stroke",
        "Improves Blood Flow to Your Brain",
        "Helps People with Type 2 Diabetes",
        "Maintains Healthy Weight",
        "Prevents Premature Ageing",
        "Boosts Your Energy Naturally",
        "Makes Your Skin Glow",
        "Improves Metabolism",
        "Reduces Blood Clots",
        "Builds Strong Bones"
    ]
};

// --- Function to Render Hero Content ---
function renderHeroContent() {
    const heroTextArea = document.getElementById('hero-text-area');
    if (!heroTextArea) return;

    heroTextArea.innerHTML = ''; 

    const titleElement = document.createElement('h1');
    titleElement.className = 'hero-title';
    titleElement.innerHTML = heroContent.title;

    const descriptionElement = document.createElement('p');
    descriptionElement.className = 'hero-description';
    descriptionElement.textContent = heroContent.description;

    const buttonElement = document.createElement('a');
    buttonElement.className = 'btn btn-green'; 
    buttonElement.id = 'buy-now-btn';
    buttonElement.href = heroContent.buttonLink; 
    buttonElement.textContent = heroContent.buttonText;

    buttonElement.setAttribute('data-bs-toggle', 'modal');
    buttonElement.setAttribute('data-bs-target', '#orderModal'); 

    heroTextArea.appendChild(titleElement);
    heroTextArea.appendChild(descriptionElement);
    heroTextArea.appendChild(buttonElement);

    const benefitsList1 = document.getElementById('benefits-list-1');
    const benefitsList2 = document.getElementById('benefits-list-2');

    if (benefitsList1 && benefitsList2) {
        benefitsList1.innerHTML = '';
        benefitsList2.innerHTML = '';

        const midPoint = Math.ceil(heroContent.benefits.length / 2);

        heroContent.benefits.forEach((benefit, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = benefit;
            listItem.className = 'fade-in';

            if (index < midPoint) {
                benefitsList1.appendChild(listItem);
            } else {
                benefitsList2.appendChild(listItem);
            }
        });
    }
}

// --- Initialize content on DOM Load ---
document.addEventListener('DOMContentLoaded', () => {
    renderHeroContent();
});