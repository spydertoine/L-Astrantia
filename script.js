document.addEventListener("DOMContentLoaded", () => {
    console.log("Le site de l'Atelier Floral est prêt à être développé !");

    // Nous mettrons ici la logique du panier et de l'outil de personnalisation plus tard.
});
document.addEventListener("DOMContentLoaded", () => {

    // État de la configuration
    const configState = {
        support: null,
        color: null,
        size: null,
        basePrice: 0,
        multiplier: 1
    };

    let currentStep = 1;
    const totalSteps = 3;

    // Éléments du DOM
    const steps = document.querySelectorAll('.step');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const addCartBtn = document.getElementById('add-custom-cart');
    const optionCards = document.querySelectorAll('.option-card');

    // Mise à jour de l'affichage du récapitulatif
    function updateSummary() {
        document.getElementById('sum-support').textContent = configState.support || "À choisir";
        document.getElementById('sum-color').textContent = configState.color || "À choisir";
        document.getElementById('sum-size').textContent = configState.size || "À choisir";

        const finalPrice = (configState.basePrice * configState.multiplier).toFixed(2);
        document.getElementById('sum-price').textContent = finalPrice;

        // Activer le bouton de panier si tout est rempli
        if (configState.support && configState.color && configState.size) {
            addCartBtn.disabled = false;
        }
    }

    // Gestion de la sélection d'une option
    optionCards.forEach(card => {
        card.addEventListener('click', function () {
            // Retirer la classe 'selected' des autres cartes de la même étape
            const siblings = this.closest('.options-grid').querySelectorAll('.option-card');
            siblings.forEach(s => s.classList.remove('selected'));

            // Ajouter la classe à la carte cliquée
            this.classList.add('selected');

            // Enregistrer la donnée
            const type = this.getAttribute('data-type');
            const value = this.getAttribute('data-value');

            if (type === 'support') {
                configState.support = value;
                configState.basePrice = parseFloat(this.getAttribute('data-price'));
            } else if (type === 'color') {
                configState.color = value;
            } else if (type === 'size') {
                configState.size = value;
                configState.multiplier = parseFloat(this.getAttribute('data-multiplier'));
            }

            // Activer le bouton suivant
            nextBtn.disabled = false;

            updateSummary();
        });
    });

    // Navigation entre les étapes
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex - 1);
        });

        // Gestion de l'affichage des boutons
        prevBtn.style.display = stepIndex === 1 ? 'none' : 'block';

        if (stepIndex === totalSteps) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
            // Vérifier si l'étape suivante a déjà une option sélectionnée
            const currentGrid = steps[stepIndex - 1].querySelector('.options-grid');
            const hasSelection = currentGrid.querySelector('.selected') !== null;
            nextBtn.disabled = !hasSelection;
        }
    }

    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       1. GESTION DU PANIER (NOUVEAU)
       ========================================= */
    let cart = []; // Tableau qui va contenir nos articles

    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountElement = document.getElementById('cart-count');
    const cartTotalPriceElement = document.getElementById('cart-total-price');

    // Ouvrir / Fermer le panier
    function toggleCart() {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }

    openCartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Fonction pour ajouter au panier
    function addToCart(item) {
        cart.push(item);
        updateCartUI();
        cartSidebar.classList.add('active'); // Ouvre le panier visuellement
        cartOverlay.classList.add('active');
    }

    // Fonction pour retirer du panier
    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartUI();
    }

    // Mettre à jour l'affichage du panier
    function updateCartUI() {
        // Mettre à jour la bulle du header
        cartCountElement.textContent = cart.length;

        // Vider le conteneur
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Votre panier est vide.</p>';
        } else {
            cart.forEach((item, index) => {
                total += item.price;

                const itemHTML = `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            ${item.desc ? `<p class="cart-item-desc">${item.desc}</p>` : ''}
                            <button class="remove-item" data-index="${index}">Retirer</button>
                        </div>
                        <div class="cart-item-price">${item.price.toFixed(2)} €</div>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        }

        // Mettre à jour le prix total
        cartTotalPriceElement.textContent = total.toFixed(2);

        // Ajouter les événements de suppression
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                removeFromCart(index);
            });
        });
    }

    /* =========================================
       2. AJOUT DEPUIS LA BOUTIQUE (NOUVEAU)
       ========================================= */
    const boutiqueButtons = document.querySelectorAll('.boutique-section .add-to-cart-btn');

    boutiqueButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Récupérer les infos du produit le plus proche (le parent)
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            // Transformer "45,00 €" en nombre 45.00
            const priceText = productCard.querySelector('.price').textContent;
            const productPrice = parseFloat(priceText.replace('€', '').replace(',', '.').trim());

            addToCart({
                name: productName,
                price: productPrice,
                desc: "Création Prêt-à-offrir"
            });
        });
    });


    /* =========================================
       3. LOGIQUE DU CONFIGURATEUR SUR-MESURE (RÉVISÉE)
       ========================================= */
    const configState = { support: null, color: null, size: null, basePrice: 0, multiplier: 1 };
    let currentStep = 1;
    const totalSteps = 3;

    const steps = document.querySelectorAll('.step');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const addCustomCartBtn = document.getElementById('add-custom-cart');
    const optionCards = document.querySelectorAll('.option-card');

    function updateSummary() {
        document.getElementById('sum-support').textContent = configState.support || "À choisir";
        document.getElementById('sum-color').textContent = configState.color || "À choisir";
        document.getElementById('sum-size').textContent = configState.size || "À choisir";

        const finalPrice = (configState.basePrice * configState.multiplier).toFixed(2);
        document.getElementById('sum-price').textContent = finalPrice;

        if (configState.support && configState.color && configState.size) {
            addCustomCartBtn.disabled = false;
        }
    }

    optionCards.forEach(card => {
        card.addEventListener('click', function () {
            const siblings = this.closest('.options-grid').querySelectorAll('.option-card');
            siblings.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');

            const type = this.getAttribute('data-type');
            const value = this.getAttribute('data-value');

            if (type === 'support') { configState.support = value; configState.basePrice = parseFloat(this.getAttribute('data-price')); }
            else if (type === 'color') { configState.color = value; }
            else if (type === 'size') { configState.size = value; configState.multiplier = parseFloat(this.getAttribute('data-multiplier')); }

            nextBtn.disabled = false;
            updateSummary();
        });
    });

    function showStep(stepIndex) {
        steps.forEach((step, index) => { step.classList.toggle('active', index === stepIndex - 1); });
        prevBtn.style.display = stepIndex === 1 ? 'none' : 'block';
        if (stepIndex === totalSteps) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
            const currentGrid = steps[stepIndex - 1].querySelector('.options-grid');
            nextBtn.disabled = !(currentGrid.querySelector('.selected') !== null);
        }
    }

    nextBtn.addEventListener('click', () => { if (currentStep < totalSteps) { currentStep++; showStep(currentStep); } });
    prevBtn.addEventListener('click', () => { if (currentStep > 1) { currentStep--; showStep(currentStep); } });

    // AJOUT DEPUIS LE SUR-MESURE AU PANIER
    addCustomCartBtn.addEventListener('click', () => {
        const finalPrice = configState.basePrice * configState.multiplier;
        addToCart({
            name: "Création Sur-Mesure",
            price: finalPrice,
            desc: `${configState.support}, ${configState.color}, format ${configState.size}`
        });
    });
});
/* =========================================
       4. ANIMATIONS AU DÉFILEMENT (SCROLL REVEAL)
       ========================================= */
// On sélectionne les éléments à animer
const elementsToReveal = document.querySelectorAll('.boutique-section, .custom-section, .product-card, .reviews-section');

// On leur ajoute la classe qui les cache au départ
elementsToReveal.forEach(el => el.classList.add('reveal-hidden'));

// On crée l'observateur
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target); // On arrête d'observer une fois affiché
        }
    });
}, {
    threshold: 0.15, // Se déclenche quand 15% de l'élément est visible
    rootMargin: "0px 0px -50px 0px"
});

// On lance l'observation sur chaque élément
elementsToReveal.forEach(el => revealObserver.observe(el));


/* =========================================
   5. FILTRAGE FLUIDE DE LA BOUTIQUE
   ========================================= */
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        // Mettre à jour le bouton actif
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filterValue = this.getAttribute('data-filter');

        // Animer le filtrage
        productCards.forEach(card => {
            // 1. On fait disparaître la carte en douceur
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';

            setTimeout(() => {
                // 2. On la cache ou on l'affiche selon le filtre
                if (filterValue === 'tout' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    // 3. Petit délai pour laisser le display:block s'appliquer avant de remettre l'opacité
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            }, 400); // Correspond au temps de transition CSS (0.4s)
        });
    });
});