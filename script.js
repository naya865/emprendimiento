// PRODUCTOS
const productos = [
    {
        id: 1,
        nombre: "Conjunto Satinado Soft",
        precio: 85000,
        categoria: "lenceria",
        descripcion: "Conjunto satinado suave con acabados finos y ajuste perfecto al cuerpo.",
        tallas: ["S", "M", "L", "XL"],
        imagen: "images/producto1-1.jpeg",
        imagenes: [
            "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
        ]
    },
    {
        id: 2,
        nombre: "Enterizo Satinado Soft",
        precio: 35000,
        categoria: "enterizos",
        descripcion: "Enterizo ligero y suave ideal para descansar en casa con total comodidad.",
        tallas: ["S", "M", "L", "XL"],
        imagen: "images/producto2-1.jpeg",
        imagenes: [
            "images/producto2-2.jpeg",
            "images/producto2-3.jpeg"
        ]
    }
];

let carrito = JSON.parse(localStorage.getItem("cart_nrosen")) || [];
let productoSeleccionado = null;
let tallaSeleccionada = "";
let mensajeWhatsAppGenerado = "";

// NODOS DOM
const productsContainer = document.getElementById("products-container");
const searchInput = document.getElementById("search-input");
const categoryButtons = document.querySelectorAll(".category-btn");

const cartToggle = document.getElementById("cart-toggle");
const cartSidebar = document.getElementById("cart-sidebar");
const closeCartBtn = document.getElementById("close-cart-btn");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");
const cartCountElement = document.getElementById("cart-count");
const paymentMethodSelect = document.getElementById("payment-method-select");

const overlay = document.getElementById("overlay");
const aboutModal = document.getElementById("about-modal");
const openAboutModalBtn = document.getElementById("open-about-modal");
const closeAboutModalBtn = document.getElementById("close-about-modal");

const productModal = document.getElementById("product-modal");
const closeProductModalBtn = document.getElementById("close-product-modal");
const modalMainImg = document.getElementById("modal-main-img");
const modalThumbnails = document.getElementById("modal-thumbnails");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalDescription = document.getElementById("modal-description");
const sizeOptionsContainer = document.getElementById("size-options");
const addToCartModalBtn = document.getElementById("add-to-cart-modal-btn");

const whatsappModal = document.getElementById("whatsapp-modal");
const closeWhatsappModalBtn = document.getElementById("close-whatsapp-modal");
const checkoutWhatsappBtn = document.getElementById("checkout-whatsapp-btn");
const confirmWhatsappBtn = document.getElementById("confirm-whatsapp-btn");

const themeToggle = document.getElementById("theme-toggle");

document.addEventListener("DOMContentLoaded", () => {
    renderProducts(productos);
    updateCartUI();
});

function renderProducts(lista) {
    productsContainer.innerHTML = "";
    if (lista.length === 0) {
        productsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--rosa-viejo);">No hay productos disponibles.</p>`;
        return;
    }

    lista.forEach(prod => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}">
            <div class="product-card-info">
                <h3>${prod.nombre}</h3>
                <p>$${prod.precio.toLocaleString("es-CO")}</p>
            </div>
        `;
        card.addEventListener("click", () => openProductModal(prod));
        productsContainer.appendChild(card);
    });
}

// BÚSQUEDA
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(query));
    renderProducts(filtrados);
});

// FILTROS
categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        categoryButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const cat = btn.getAttribute("data-category");
        if (cat === "todas") {
            renderProducts(productos);
        } else {
            const filtrados = productos.filter(p => p.categoria.toLowerCase() === cat);
            renderProducts(filtrados);
        }
    });
});

// MODAL NOSOTRAS
openAboutModalBtn.addEventListener("click", () => {
    aboutModal.classList.add("active");
    overlay.classList.add("active");
});

closeAboutModalBtn.addEventListener("click", closeModals);

// DETALLE PRODUCTO
function openProductModal(prod) {
    productoSeleccionado = prod;
    tallaSeleccionada = prod.tallas[0] || "";

    modalMainImg.src = prod.imagen;
    modalTitle.textContent = prod.nombre;
    modalPrice.textContent = `$${prod.precio.toLocaleString("es-CO")}`;
    modalDescription.textContent = prod.descripcion;

    modalThumbnails.innerHTML = "";
    const imgs = prod.imagenes || [prod.imagen];
    imgs.forEach((src, idx) => {
        const thumb = document.createElement("img");
        thumb.src = src;
        thumb.className = `thumb-img ${idx === 0 ? 'active' : ''}`;
        thumb.addEventListener("click", () => {
            modalMainImg.src = src;
            document.querySelectorAll(".thumb-img").forEach(t => t.classList.remove("active"));
            thumb.classList.add("active");
        });
        modalThumbnails.appendChild(thumb);
    });

    sizeOptionsContainer.innerHTML = "";
    prod.tallas.forEach((talla, idx) => {
        const btn = document.createElement("button");
        btn.className = `size-btn ${idx === 0 ? 'active' : ''}`;
        btn.textContent = talla;
        btn.addEventListener("click", () => {
            document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            tallaSeleccionada = talla;
        });
        sizeOptionsContainer.appendChild(btn);
    });

    productModal.classList.add("active");
    overlay.classList.add("active");
}

closeProductModalBtn.addEventListener("click", closeModals);
overlay.addEventListener("click", closeModals);

function closeModals() {
    aboutModal.classList.remove("active");
    productModal.classList.remove("active");
    whatsappModal.classList.remove("active");
    cartSidebar.classList.remove("active");
    overlay.classList.remove("active");
}

// AÑADIR A LA BOLSA
addToCartModalBtn.addEventListener("click", () => {
    if (!productoSeleccionado) return;

    const cartId = `${productoSeleccionado.id}-${tallaSeleccionada}`;
    const existe = carrito.find(item => item.cartId === cartId);

    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({
            cartId,
            id: productoSeleccionado.id,
            nombre: productoSeleccionado.nombre,
            precio: productoSeleccionado.precio,
            talla: tallaSeleccionada,
            imagen: productoSeleccionado.imagen,
            cantidad: 1
        });
    }

    saveCart();
    closeModals();
    cartSidebar.classList.add("active");
    overlay.classList.add("active");
});

// ABRIR/CERRAR BOLSA
cartToggle.addEventListener("click", () => {
    cartSidebar.classList.add("active");
    overlay.classList.add("active");
});

closeCartBtn.addEventListener("click", closeModals);

function updateCartUI() {
    cartItemsContainer.innerHTML = "";
    let total = 0;
    let cantTotal = 0;

    if (carrito.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--rosa-viejo); margin-top: 20px;">Tu bolsa está vacía.</p>`;
    } else {
        carrito.forEach(item => {
            total += item.precio * item.cantidad;
            cantTotal += item.cantidad;

            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <img src="${item.imagen}">
                <div class="cart-item-details">
                    <h4>${item.nombre}</h4>
                    <p>Talla: ${item.talla} | Cant: ${item.cantidad}</p>
                    <p><strong>$${(item.precio * item.cantidad).toLocaleString("es-CO")}</strong></p>
                </div>
                <button class="remove-item-btn" onclick="removeItem('${item.cartId}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(div);
        });
    }

    cartTotalElement.textContent = `$${total.toLocaleString("es-CO")}`;
    cartCountElement.textContent = cantTotal;
}

function removeItem(cartId) {
    carrito = carrito.filter(item => item.cartId !== cartId);
    saveCart();
}

function saveCart() {
    localStorage.setItem("cart_nrosen", JSON.stringify(carrito));
    updateCartUI();
}

// PROCESAR PEDIDO
checkoutWhatsappBtn.addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("Tu bolsa está vacía.");
        return;
    }

    const pago = paymentMethodSelect.value;
    let msg = "¡Hola N'ROSEN Studio! ✨ Quisiera realizar el siguiente pedido:\n\n";
    let total = 0;

    carrito.forEach(item => {
        const sub = item.precio * item.cantidad;
        total += sub;
        msg += `• ${item.nombre} (Talla: ${item.talla}) x${item.cantidad} - $${sub.toLocaleString("es-CO")}\n`;
    });

    msg += `\n*Total a pagar:* $${total.toLocaleString("es-CO")}\n`;
    msg += `*Método de pago:* ${pago}\n\n`;
    msg += `¿Me confirman disponibilidad y datos de pago?`;

    mensajeWhatsAppGenerado = msg;

    cartSidebar.classList.remove("active");
    whatsappModal.classList.add("active");
    overlay.classList.add("active");
});

closeWhatsappModalBtn.addEventListener("click", closeModals);

// ENVIAR A WHATSAPP Y VACIAR BOLSA AUTOMÁTICAMENTE
confirmWhatsappBtn.addEventListener("click", () => {
    const tel = "573045934907";
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensajeWhatsAppGenerado)}`, "_blank");

    // Vaciar el carrito y la memoria local tras enviar el pedido
    carrito = [];
    localStorage.removeItem("cart_nrosen");
    updateCartUI();

    closeModals();
});

// MODO OSCURO
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const icon = themeToggle.querySelector("i");
    icon.className = document.body.classList.contains("dark-theme") ? "fa-solid fa-sun" : "fa-solid fa-moon";
});