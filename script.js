document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // CONFIGURACIÓN INICIAL Y DATOS
    // ==========================================================================
    const formatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    });

    const products = [
        { id: 1, title: "Blazer Estructurado Minimal", price: 189000, discount: true, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600", desc: "Blazer entallado confeccionado con tejidos premium. Un balance perfecto entre elegancia estructurada y confort urbano.", reviews: ["Excelente caída y el color es idéntico a la foto. - Camila M."] },
        { id: 2, title: "Vestido Midi Plisado", price: 145000, discount: false, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600", desc: "Corte fluido con sutiles pliegues que juegan con el movimiento. Una silueta atemporal pensada para resaltar tu bienestar.", reviews: ["Cómodo, fresco y súper sofisticado. - Valeria D."] },
        { id: 3, title: "Pantalón Tailored Sastre", price: 120000, discount: true, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600", desc: "Pantalón de tiro alto con pinzas frontales. Versatilidad pura que se adapta de la oficina a una cena casual.", reviews: ["La tela es de una calidad increíble. Ajuste perfecto. - Andrea L."] },
        { id: 4, title: "Camisa Oversize Algodón", price: 85000, discount: false, image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?q=80&w=600", desc: "Confeccionada en algodón 100% orgánico. Un básico esencial con un toque contemporáneo.", reviews: ["Básico indispensable, me compré dos colores. - Martina S."] },
        { id: 5, title: "Sueter en algodon", price: 110000, discount: false, image: "https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00697606580534L.jpg", desc: "Suéter clásico en tejido de punto de algodón suave, ideal para climas templados y un look relajado.", reviews: ["¡Me encantó! Súper suave."] }
    ];

    let cart = [];
    let activeProduct = null;

    // ==========================================================================
    // CAPTURA DE ELEMENTOS DEL DOM
    // ==========================================================================
    const productsGrid = document.getElementById('products-grid');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalValue = document.getElementById('cart-total-value');
    const cartCount = document.getElementById('cart-count');
    
    const modal = document.getElementById('product-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const addToCartBtn = document.getElementById('modal-add-btn');

    const successModal = document.getElementById('order-success-modal');
    const successModalBody = document.getElementById('success-modal-body');
    const closeSuccessBtn = document.getElementById('close-success-btn');
    const successAcceptBtn = document.getElementById('success-accept-btn');
    const modalMsgIcon = document.getElementById('modal-msg-icon');
    const modalMsgTitle = document.getElementById('modal-msg-title');
    
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search');

    const aboutToggle = document.getElementById('about-toggle');
    const aboutModal = document.getElementById('about-modal');
    const closeAboutBtn = document.getElementById('close-about-btn');

    // ==========================================================================
    // RENDERIZADO DE PRODUCTOS (CATÁLOGO)
    // ==========================================================================
    function renderProducts(productsToDisplay) {
        productsGrid.innerHTML = '';
        if(productsToDisplay.length === 0) {
            productsGrid.innerHTML = `<p style="grid-column:1/-1; text-align:center;">No se encontraron productos.</p>`;
            return;
        }
        productsToDisplay.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            card.innerHTML = `
                ${product.discount ? '<span class="tag-descuento">Oferta</span>' : ''}
                <div class="product-image" style="background-image: url('${product.image}')"></div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-price">${formatter.format(product.price)}</p>
                </div>
            `;
            card.addEventListener('click', () => openModal(product));
            productsGrid.appendChild(card);
        });
    }

    // ==========================================================================
    // GESTIÓN DEL CARRITO DE COMPRAS
    // ==========================================================================
    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p style="text-align:center; color: var(--accent-color); margin-top:20px;">Tu bolsa está vacía.</p>`;
        } else {
            cart.forEach((item, index) => {
                total += item.price;
                const itemRow = document.createElement('div');
                itemRow.classList.add('cart-item');
                itemRow.innerHTML = `
                    <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <p class="cart-item-price">${formatter.format(item.price)}</p>
                    </div>
                    <button class="btn-remove" data-index="${index}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(itemRow);
            });
        }

        cartTotalValue.innerText = formatter.format(total);
        cartCount.innerText = cart.length;

        // Asignar eventos de eliminación de forma delegada/limpia
        const removeButtons = cartItemsContainer.querySelectorAll('.btn-remove');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }

    function addToCart(product) {
        cart.push(product);
        updateCartUI();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartUI();
    }

    // ==========================================================================
    // INTERACCIÓN CON MODALES
    // ==========================================================================
    function openModal(product) {
        activeProduct = product;
        document.getElementById('modal-img').style.backgroundImage = `url('${product.image}')`;
        document.getElementById('modal-title').innerText = product.title;
        document.getElementById('modal-desc').innerText = product.desc;
        document.getElementById('modal-price').innerText = formatter.format(product.price);
        
        const reviewsContainer = document.getElementById('modal-reviews');
        reviewsContainer.innerHTML = '';
        product.reviews.forEach(rev => {
            reviewsContainer.innerHTML += `<div class="review-item"><p style="font-size:0.85rem; font-style:italic;">"${rev}"</p></div>`;
        });
        modal.classList.add('active');
    }

    // Eventos del Modal de Productos
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));

    addToCartBtn.addEventListener('click', () => {
        if(activeProduct) {
            addToCart(activeProduct);
            addToCartBtn.innerText = "¡Agregado!";
            setTimeout(() => {
                addToCartBtn.innerText = "Añadir al Carrito";
                modal.classList.remove('active');
                cartSidebar.classList.add('active');
                cartOverlay.classList.add('active');
            }, 600);
        }
    });

    // Eventos del Modal Acerca de Nosotros
    aboutToggle.addEventListener('click', () => aboutModal.classList.add('active'));
    closeAboutBtn.addEventListener('click', () => aboutModal.classList.remove('active'));

    // ==========================================================================
    // APERTURA Y CIERRE DEL CARRITO LATERAL
    // ==========================================================================
    openCartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    });

    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });

    cartOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });

    // ==========================================================================
    // PASARELA DE PAGO Y ORDENES
    // ==========================================================================
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            successModalBody.innerHTML = `
                <p style="text-align: center; font-size: 1.05rem; margin-bottom: 10px;">🛍️ <strong>Tu bolsa está vacía</strong></p>
                <p style="text-align: center; color: var(--accent-color);">Explora nuestro catálogo y añade tus prendas favoritas antes de proceder al pago.</p>
            `;
            modalMsgTitle.innerText = "¡Atención!";
            modalMsgIcon.className = "fa-solid fa-bag-shopping";
            successModal.classList.add('active');
            return;
        }

        modalMsgTitle.innerText = "¡Pedido Registrado!";
        modalMsgIcon.className = "fa-regular fa-circle-check";

        const method = document.getElementById('payment-select').value;
        let totalPedido = cartTotalValue.innerText;
        let mensajeHTML = "";

        if (method === 'transferencia') {
            mensajeHTML = `
                <p style="margin-bottom: 12px;">Para completar tu compra de <strong>${totalPedido}</strong>, realiza tu transferencia a cualquiera de estas cuentas:</p>
                <ul style="list-style: none; padding-left: 5px;">
                    <li style="margin-bottom: 6px;">✨ <strong>Nequi / Daviplata:</strong> 300 123 4567</li>
                    <li style="margin-bottom: 12px;">✨ <strong>Bancolombia Ahorros:</strong> N° 123-456789-00</li>
                </ul>
                <p style="font-size: 0.85rem; border-top: 1px solid var(--border-color); padding-top: 10px; font-style: italic;">Por favor envíanos el comprobante por WhatsApp para proceder con el despacho de tus prendas.</p>
            `;
        } else if (method === 'contraentrega') {
            mensajeHTML = `
                <p style="margin-bottom: 10px;">¡Tu orden por valor de <strong>${totalPedido}</strong> ha sido confirmada!</p>
                <p>Prepararemos tu paquete para ser despachado directamente a tu dirección. Recuerda que <strong>pagas en efectivo</strong> en el momento en que lo recibas en tu casa.</p>
            `;
        } else if (method === 'tarjeta') {
            mensajeHTML = `
                <p style="margin-bottom: 10px;"><strong>Conectando con la pasarela de pago...</strong></p>
                <p>En un entorno real, aquí redirigiríamos de forma segura a Bold, Wompi o PayU para procesar tu tarjeta de crédito o débito por un total de <strong>${totalPedido}</strong>.</p>
            `;
        }

        successModalBody.innerHTML = mensajeHTML;
        successModal.classList.add('active');
        
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');

        cart = [];
        updateCartUI();
    });

    closeSuccessBtn.addEventListener('click', () => successModal.classList.remove('active'));
    successAcceptBtn.addEventListener('click', () => successModal.classList.remove('active'));
    
    // Cierre al dar clic en el fondo gris desenfocado de los modales
    window.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.classList.remove('active');
        if (e.target === aboutModal) aboutModal.classList.remove('active');
        if (e.target === modal) modal.classList.remove('active');
    });

    // ==========================================================================
    // ALTERNADOR DE MODO OSCURO (THEME)
    // ==========================================================================
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });

    // ==========================================================================
    // BÚSQUEDA DINÁMICA DE ELEMENTOS
    // ==========================================================================
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) || 
            product.desc.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });

    // Inicialización del catálogo al cargar la web
    renderProducts(products);
});