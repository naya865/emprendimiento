// ==========================================
// 1. BASE DE DATOS DE PRODUCTOS
// ==========================================
const products = [
    {
        id: 1,
        nombre: "Conjunto Satinado Soft",
        categoria: "lenceria",
        precio: 85000,
        descripcion: "Conjunto elaborado en satén suave con detalles de encaje de alta calidad.",
        // Propiedad principal para la tarjeta del catálogo:
        imagen: "images/producto1-1.jpeg",
        // Arreglo completo para la galería del modal:
        imagenes: [
            "images/producto1-1.jpeg"
        ]
    
    },

    {
        id: 2,
        nombre: "Conjunto Satinado Soft",
        categoria: "enterisos",
        precio: 35000,
        descripcion: "Conjunto elaborado en satén suave con detalles de encaje de alta calidad.",
        // Propiedad principal para la tarjeta del catálogo:
        imagen: "images/producto2-1.jpeg",
        // Arreglo completo para la galería del modal:
        imagenes: [
            "images/producto2-1.jpeg",
            "images/producto2-2.jpeg",
            "images/producto2-3.jpeg"
        ]
    },

];


// Estado de la aplicación
let cart = [];
let currentCategory = 'todos';

// ==========================================
// 2. INICIALIZACIÓN Y EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    setupEventListeners();
});

function setupEventListeners() {
    // Filtros por categoría
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            filterProducts();
        });
    });

    // Búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    // Modal Nosotras
    const aboutBtn = document.getElementById('about-btn');
    const aboutModal = document.getElementById('about-modal');
    const closeAboutBtn = document.getElementById('close-about-btn');

    if (aboutBtn && aboutModal) {
        aboutBtn.addEventListener('click', () => aboutModal.classList.add('active'));
    }
    if (closeAboutBtn && aboutModal) {
        closeAboutBtn.addEventListener('click', () => aboutModal.classList.remove('active'));
    }

    // Modal Detalle de Producto
    const closeProductBtn = document.getElementById('close-product-btn');
    const productModal = document.getElementById('product-modal');
    if (closeProductBtn && productModal) {
        closeProductBtn.addEventListener('click', () => productModal.classList.remove('active'));
    }

    // Carrito / Bolsa de compras
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart-btn');

    if (cartBtn && cartSidebar) {
        cartBtn.addEventListener('click', () => cartSidebar.classList.add('active'));
    }
    if (closeCartBtn && cartSidebar) {
        closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('active'));
    }

    // Checkout / WhatsApp
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutModalBtn = document.getElementById('close-checkout-modal-btn');
    const confirmCheckoutBtn = document.getElementById('confirm-checkout-btn');

    if (checkoutBtn && checkoutModal) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Tu bolsa de compras está vacía.");
                return;
            }
            checkoutModal.classList.add('active');
        });
    }

    if (closeCheckoutModalBtn && checkoutModal) {
        closeCheckoutModalBtn.addEventListener('click', () => checkoutModal.classList.remove('active'));
    }

    if (confirmCheckoutBtn) {
        confirmCheckoutBtn.addEventListener('click', processWhatsAppOrder);
    }

    // Cambio de tema (Oscuro / Claro)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
        });
    }
}

// ==========================================
// 3. RENDERIZADO DE PRODUCTOS Y FILTROS
// ==========================================
function renderProducts(items) {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No se encontraron productos.</p>`;
        return;
    }

    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}">
            <div class="product-card-info">
                <h3>${product.nombre}</h3>
                <p>$${product.precio.toLocaleString()}</p>
            </div>
        `;
        card.addEventListener('click', () => openProductModal(product));
        container.appendChild(card);
    });
}

function filterProducts() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = products.filter(product => {
        const matchesCategory = currentCategory === 'todos' || product.categoria === currentCategory;
        const matchesSearch = product.nombre.toLowerCase().includes(searchTerm) || 
                              product.descripcion.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    renderProducts(filtered);
}

// ==========================================
// 4. DETALLE DE PRODUCTO Y GALERÍA
// ==========================================
function openProductModal(product) {
    const modal = document.getElementById('product-modal');
    const mainImg = document.getElementById('modal-main-img');
    const title = document.getElementById('modal-title');
    const price = document.getElementById('modal-price');
    const desc = document.getElementById('modal-desc');
    const galleryContainer = document.querySelector('.product-gallery');
    const addBtn = document.getElementById('add-to-cart-modal-btn');

    if (!modal) return;

    title.textContent = product.nombre;
    price.textContent = `$${product.precio.toLocaleString()}`;
    desc.textContent = product.descripcion;
    
    // Asignar imagen principal
    const imagesList = product.imagenes && product.imagenes.length > 0 ? product.imagenes : [product.imagen];
    mainImg.src = imagesList[0];

    // Construir miniaturas si hay más de una foto
    let thumbnailsDiv = document.getElementById('modal-thumbnails');
    if (!thumbnailsDiv) {
        thumbnailsDiv = document.createElement('div');
        thumbnailsDiv.id = 'modal-thumbnails';
        thumbnailsDiv.className = 'modal-thumbnails';
        galleryContainer.appendChild(thumbnailsDiv);
    }
    thumbnailsDiv.innerHTML = '';

    if (imagesList.length > 1) {
        imagesList.forEach((imgUrl, idx) => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.className = idx === 0 ? 'thumb-img active' : 'thumb-img';
            thumb.onclick = () => {
                mainImg.src = imgUrl;
                document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            };
            thumbnailsDiv.appendChild(thumb);
        });
    }

    // Configurar botón añadir a la bolsa
    addBtn.onclick = () => {
        addToCart(product);
        modal.classList.remove('active');
    };

    modal.classList.add('active');
}

// ==========================================
// 5. GESTIÓN DEL CARRITO Y WHATSAPP
// ==========================================
function addToCart(product) {
    const activeSizeBtn = document.querySelector('.size-btn.active');
    const size = activeSizeBtn ? activeSizeBtn.textContent : 'S';

    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            imagen: product.imagen,
            size: size,
            quantity: 1
        });
    }

    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');

    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

    if (cartCount) cartCount.textContent = totalQty;
    if (cartTotalPrice) cartTotalPrice.textContent = `$${totalPrice.toLocaleString()}`;

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; gap:10px;';
            itemDiv.innerHTML = `
                <img src="${item.imagen}" style="width:45px; height:45px; object-fit:cover; border-radius:4px;">
                <div style="flex:1;">
                    <p style="font-size:0.85rem; font-weight:600;">${item.nombre}</p>
                    <p style="font-size:0.75rem; color:var(--rosa-viejo);">Talla: ${item.size} | Cant: ${item.quantity}</p>
                    <p style="font-size:0.8rem;">$${(item.precio * item.quantity).toLocaleString()}</p>
                </div>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#b57a7a; cursor:pointer;">&times;</button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function processWhatsAppOrder() {
    const paymentMethod = document.getElementById('payment-method').value;
    const phone = "573045934907";

    let message = "¡Hola *N'ROSEN Studio*! 🌸 Deseo realizar el siguiente pedido:\n\n";
    
    cart.forEach(item => {
        message += `• *${item.nombre}* (Talla: ${item.size}) x${item.quantity} - $${(item.precio * item.quantity).toLocaleString()}\n`;
    });

    const total = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);
    message += `\n*Total a pagar:* $${total.toLocaleString()}`;
    message += `\n*Método de pago:* ${paymentMethod.toUpperCase()}`;
    message += `\n\nQuedo atenta para confirmar datos de envío.`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}