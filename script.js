const products = [
    {
        id: 1,
        name: "Suéter de algodón",
        price: "$45.000",
        description: "Punto fino, 100% algodón orgánico, suave y transpirable.",
        mainImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500",
        styles: [
            { name: "Beige Clásico", img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500" },
            { name: "Negro Gráfico", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500" },
            { name: "Rayas Náuticas", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500" },
            { name: "Gris Melange", img: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500" }
        ]
    },
    {
        id: 2,
        name: "Pijama Seda Luxe",
        price: "$89.000",
        description: "Conjunto de dos piezas en seda de tacto ultrasuave para el descanso.",
        mainImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500",
        styles: [
            { name: "Negro Elegante", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500" },
            { name: "Rosa Palo", img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500" },
            { name: "Verde Esmeralda", img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500" }
        ]
    },
    {
        id: 3,
        name: "Camiseta Básica Premium",
        price: "$28.000",
        description: "Corte clásico con cuello redondo, ideal para combinar a diario.",
        mainImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
        styles: [
            { name: "Blanco Puro", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" },
            { name: "Negro Mate", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500" }
        ]
    }
];

let cart = [];
let selectedProductForCart = null;
let selectedStyleName = "";
let whatsappUrl = '';

// Número oficial de N'ROSEN Studio
const whatsappPhone = '573045934907'; 

document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    setupEventListeners();
});

function renderProducts(items) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = '';

    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.mainImage}" alt="${product.name}">
            <div class="product-card-info">
                <h3>${product.name}</h3>
                <p>${product.price}</p>
            </div>
        `;
        card.addEventListener('click', () => openProductModal(product.id));
        container.appendChild(card);
    });
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    selectedProductForCart = product;

    document.getElementById('modal-main-img').src = product.mainImage;
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-price').textContent = product.price;
    document.getElementById('modal-desc').textContent = product.description;

    // Resetear selección de talla a la primera opción por defecto
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(b => b.classList.remove('active'));
    if (sizeBtns.length > 0) sizeBtns[0].classList.add('active');

    const stylesSection = document.getElementById('modal-styles-section');
    const stylesList = document.getElementById('modal-styles-list');
    stylesList.innerHTML = '';

    if (product.styles && product.styles.length > 0) {
        stylesSection.style.display = 'block';
        selectedStyleName = product.styles[0].name; // Estilo por defecto

        product.styles.forEach((style, index) => {
            const styleCard = document.createElement('div');
            styleCard.className = `style-card ${index === 0 ? 'active' : ''}`;
            styleCard.innerHTML = `
                <img src="${style.img}" alt="${style.name}">
                <span>${style.name}</span>
            `;

            styleCard.addEventListener('click', () => {
                document.getElementById('modal-main-img').src = style.img;
                document.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
                styleCard.classList.add('active');
                selectedStyleName = style.name;
            });

            stylesList.appendChild(styleCard);
        });
    } else {
        stylesSection.style.display = 'none';
        selectedStyleName = "";
    }

    document.getElementById('product-modal').classList.add('active');
}

function setupEventListeners() {
    const closeProductBtn = document.getElementById('close-product-btn');
    if (closeProductBtn) {
        closeProductBtn.addEventListener('click', () => {
            document.getElementById('product-modal').classList.remove('active');
        });
    }

    const closeAboutBtn = document.getElementById('close-about-btn');
    if (closeAboutBtn) {
        closeAboutBtn.addEventListener('click', () => {
            document.getElementById('about-modal').classList.remove('active');
        });
    }

    const aboutBtn = document.getElementById('about-btn');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            document.getElementById('about-modal').classList.add('active');
        });
    }

    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            document.getElementById('cart-sidebar').classList.add('active');
        });
    }

    const closeCartBtn = document.getElementById('close-cart-btn');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            document.getElementById('cart-sidebar').classList.remove('active');
        });
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
        });
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(query));
            renderProducts(filtered);
        });
    }

    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    const addToCartBtn = document.getElementById('add-to-cart-modal-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (selectedProductForCart) {
                // Obtener la talla seleccionada
                const activeSizeBtn = document.querySelector('.size-btn.active');
                const selectedSize = activeSizeBtn ? activeSizeBtn.textContent.trim() : 'S';

                // Guardar el item con talla e información del estilo
                cart.push({
                    name: selectedProductForCart.name,
                    price: selectedProductForCart.price,
                    size: selectedSize,
                    style: selectedStyleName
                });

                updateCartUI();
                document.getElementById('product-modal').classList.remove('active');
                document.getElementById('cart-sidebar').classList.add('active');
            }
        });
    }

    // Checkout / Construir mensaje para WhatsApp
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu bolsa está vacía.');
                return;
            }

            // Formatear cada producto incluyendo la Talla y Estilo
            let itemSummary = cart.map(item => {
                let detail = `• *${item.name}* - ${item.price}\n   Talla: ${item.size}`;
                if (item.style) {
                    detail += ` | Color/Estilo: ${item.style}`;
                }
                return detail;
            }).join('\n\n');

            const totalEl = document.getElementById('cart-total-price');
            const total = totalEl ? totalEl.textContent : '$0';
            const methodSelect = document.getElementById('payment-method');
            const methodText = methodSelect ? methodSelect.options[methodSelect.selectedIndex].text : 'Transferencia';

            const message = `¡Hola *NROSEN Studio*! ✨\nQuiero realizar el siguiente pedido:\n\n${itemSummary}\n\n*Total:* ${total}\n*Método de pago:* ${methodText}\n\nQuedo a la espera para coordinar el pago y envío.`;

            whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

            cart = [];
            updateCartUI();

            document.getElementById('cart-sidebar').classList.remove('active');
            document.getElementById('checkout-modal').classList.add('active');
        });
    }

    const confirmCheckoutBtn = document.getElementById('confirm-checkout-btn');
    if (confirmCheckoutBtn) {
        confirmCheckoutBtn.addEventListener('click', () => {
            document.getElementById('checkout-modal').classList.remove('active');
            if (whatsappUrl) {
                window.open(whatsappUrl, '_blank');
            }
        });
    }

    const closeCheckoutBtn = document.getElementById('close-checkout-modal-btn');
    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', () => {
            document.getElementById('checkout-modal').classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = cart.length;

    const container = document.getElementById('cart-items-container');
    if (!container) return;
    container.innerHTML = '';

    let total = 0;
    cart.forEach((item, index) => {
        const numericPrice = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
        total += numericPrice;

        const div = document.createElement('div');
        div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid var(--border-color);';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div style="font-size:0.8rem; color:var(--text-color); opacity:0.8;">
                    Talla: ${item.size}${item.style ? ' | ' + item.style : ''}
                </div>
                <div style="font-size:0.85rem; color:var(--accent-color); font-weight:600;">${item.price}</div>
            </div>
            <button onclick="removeItem(${index})" style="background:none; border:none; color:#c49a9a; font-weight:bold; cursor:pointer;">✕</button>
        `;
        container.appendChild(div);
    });

    const totalEl = document.getElementById('cart-total-price');
    if (totalEl) totalEl.textContent = `$${total.toLocaleString('es-CO')}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}