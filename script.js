const { useState, useEffect, useMemo, createElement: h } = React;

// LISTA DE RESPALDO (Usa las rutas reales de tu carpeta images/)
const PRODUCTOS_INICIALES = [
    {
        id: 1,
        nombre: "Conjunto Satinado Soft",
        precio: 85000,
        categoria: "lenceria",
        descripcion: "Conjunto satinado suave con acabados finos y ajuste perfecto al cuerpo.",
        tallas: ["S", "M", "L", "XL"],
        imagen: "images/producto1-1.jpeg",
        imagenes: [
            "images/producto1-1.jpeg",
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
            "images/producto2-1.jpeg",
            "images/producto2-2.jpeg",
            "images/producto2-3.jpeg"
        ]
    }
];

function App() {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState(() => {
        try {
            const guardado = localStorage.getItem("cart_nrosen");
            return guardado ? JSON.parse(guardado) : [];
        } catch {
            return [];
        }
    });

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("todas");
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedImage, setSelectedImage] = useState("");
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("Nequi");
    const [generatedMessage, setGeneratedMessage] = useState("");

    const [newProd, setNewProd] = useState({
        nombre: "", precio: "", categoria: "lenceria", descripcion: "", tallas: "S, M, L, XL", imagen: "", imagenesExtra: ""
    });

    useEffect(() => {
        async function fetchProductos() {
            try {
                const res = await fetch("http://localhost:5000/api/productos");
                if (!res.ok) throw new Error("API Backend no disponible");
                const data = await res.json();
                setProductos(data.length > 0 ? data : PRODUCTOS_INICIALES);
            } catch (err) {
                setProductos(PRODUCTOS_INICIALES);
            }
        }
        fetchProductos();
    }, []);

    useEffect(() => {
        localStorage.setItem("cart_nrosen", JSON.stringify(carrito));
    }, [carrito]);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }
    }, [isDarkMode]);

    const productosFiltrados = useMemo(() => {
        return productos.filter(p => {
            const coincideCat = activeCategory === "todas" || p.categoria.toLowerCase() === activeCategory.toLowerCase();
            const coincideBusqueda = p.nombre.toLowerCase().includes(searchQuery.toLowerCase().trim());
            return coincideCat && coincideBusqueda;
        });
    }, [productos, activeCategory, searchQuery]);

    const openProductModal = (prod) => {
        setSelectedProduct(prod);
        setSelectedSize(prod.tallas && prod.tallas.length > 0 ? prod.tallas[0] : "S");
        setSelectedImage(prod.imagen);
    };

    const closeModals = () => {
        setIsAboutOpen(false);
        setSelectedProduct(null);
        setIsAddProductOpen(false);
        setIsWhatsappModalOpen(false);
        setIsCartOpen(false);
    };

    const handleAddToCart = () => {
        if (!selectedProduct) return;
        const cartId = `${selectedProduct.id}-${selectedSize}`;
        
        setCarrito(prev => {
            const existe = prev.find(item => item.cartId === cartId);
            if (existe) {
                return prev.map(item => item.cartId === cartId ? { ...item, cantidad: item.cantidad + 1 } : item);
            }
            return [...prev, {
                cartId,
                id: selectedProduct.id,
                nombre: selectedProduct.nombre,
                precio: selectedProduct.precio,
                talla: selectedSize,
                imagen: selectedProduct.imagen,
                cantidad: 1
            }];
        });

        closeModals();
        setIsCartOpen(true);
    };

    const removeItem = (cartId) => {
        setCarrito(prev => prev.filter(item => item.cartId !== cartId));
    };

    const handleCheckout = () => {
        if (carrito.length === 0) return;

        let total = 0;
        let msg = "¡Hola N'ROSEN Studio! ✨ Quisiera realizar el siguiente pedido:\n\n";

        carrito.forEach(item => {
            const sub = item.precio * item.cantidad;
            total += sub;
            msg += `• ${item.nombre} (Talla: ${item.talla}) x${item.cantidad} - $${sub.toLocaleString("es-CO")}\n`;
        });

        msg += `\n*Total a pagar:* $${total.toLocaleString("es-CO")}\n`;
        msg += `*Método de pago:* ${paymentMethod}\n\n`;
        msg += `¿Me confirman disponibilidad y datos de pago?`;

        setGeneratedMessage(msg);
        setIsCartOpen(false);
        setIsWhatsappModalOpen(true);
    };

    const confirmWhatsapp = () => {
        const tel = "573045934907";
        window.open(`https://wa.me/${tel}?text=${encodeURIComponent(generatedMessage)}`, "_blank");
        setCarrito([]);
        localStorage.removeItem("cart_nrosen");
        setIsWhatsappModalOpen(false);
    };

    const handleCreateProductSubmit = (e) => {
        e.preventDefault();
        const tallasArr = newProd.tallas.split(",").map(t => t.trim()).filter(Boolean);
        const extraImgs = newProd.imagenesExtra.split(",").map(i => i.trim()).filter(Boolean);

        const nuevo = {
            id: Date.now(),
            nombre: newProd.nombre,
            precio: Number(newProd.precio),
            categoria: newProd.categoria,
            descripcion: newProd.descripcion,
            tallas: tallasArr.length ? tallasArr : ["S", "M", "L"],
            imagen: newProd.imagen || "images/producto1-1.jpeg",
            imagenes: [
                newProd.imagen || "images/producto1-1.jpeg",
                ...extraImgs
            ]
        };

        setProductos(prev => [nuevo, ...prev]);

        fetch("http://localhost:5000/api/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevo)
        }).catch(() => console.log("Guardado localmente en React."));

        setIsAddProductOpen(false);
        setNewProd({ nombre: "", precio: "", categoria: "lenceria", descripcion: "", tallas: "S, M, L, XL", imagen: "", imagenesExtra: "" });
    };

    const cartTotal = carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
    const cartCount = carrito.reduce((sum, i) => sum + i.cantidad, 0);

    return h('div', null,
        // HEADER / NAVBAR
        h('header', { className: 'navbar' },
            h('div', { className: 'nav-left' },
                h('button', { className: 'highlight-about-btn', onClick: () => setIsAboutOpen(true) }, 'NOSOTRAS ✨'),
                h('button', { className: 'admin-add-btn', onClick: () => setIsAddProductOpen(true) }, '+ Agregar')
            ),
            h('div', { className: 'logo-container' },
                h('div', { className: 'brand-logo' },
                    h('span', { className: 'logo-main' }, "N'ROSEN"),
                    h('span', { className: 'logo-sub' }, 'STUDIO'),
                    h('span', { className: 'logo-tagline' }, '"Porque sentirse bien también se viste"')
                )
            ),
            h('div', { className: 'nav-right' },
                h('div', { className: 'search-box' },
                    h('input', {
                        type: 'text',
                        placeholder: 'Buscar...',
                        value: searchQuery,
                        onChange: (e) => setSearchQuery(e.target.value)
                    })
                ),
                h('button', { className: 'icon-btn', onClick: () => setIsDarkMode(!isDarkMode), 'aria-label': 'Cambiar tema' },
                    h('i', { className: isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon' })
                ),
                h('button', { className: 'icon-btn', onClick: () => setIsCartOpen(true), 'aria-label': 'Ver bolsa de compras' },
                    h('i', { className: 'fa-solid fa-bag-shopping' }),
                    h('span', { id: 'cart-count' }, cartCount)
                )
            )
        ),

        // BARRA CATEGORÍAS
        h('nav', { className: 'categories-bar' },
            h('div', { className: 'categories-wrapper' },
                ["todas", "lenceria", "pijamas", "enterizos", "homewear", "basicos", "accesorios"].map((cat) =>
                    h('button', {
                        key: cat,
                        className: `category-btn ${activeCategory === cat ? 'active' : ''}`,
                        onClick: () => setActiveCategory(cat)
                    }, cat.charAt(0).toUpperCase() + cat.slice(1))
                )
            )
        ),

        // MAIN CONTENT
        h('main', { className: 'main-content' },
            h('h2', { className: 'section-title' }, 'COLECCIÓN DESTACADA'),
            productosFiltrados.length === 0 ?
                h('p', { style: { gridColumn: '1 / -1', textAlign: 'center', color: 'var(--rosa-viejo)', marginTop: '20px' } }, 'No hay productos disponibles.') :
                h('div', { className: 'products-grid' },
                    productosFiltrados.map((prod) =>
                        h('div', { key: prod.id, className: 'product-card', onClick: () => openProductModal(prod) },
                            h('img', { src: prod.imagen, alt: prod.nombre }),
                            h('div', { className: 'product-card-info' },
                                h('h3', null, prod.nombre),
                                h('p', null, `$${prod.precio.toLocaleString("es-CO")}`)
                            )
                        )
                    )
                )
        ),

        // OVERLAY
        h('div', {
            className: `overlay ${(isAboutOpen || selectedProduct || isAddProductOpen || isWhatsappModalOpen || isCartOpen) ? 'active' : ''}`,
            onClick: closeModals
        }),

        // MODAL NOSOTRAS
        isAboutOpen && h('div', { className: 'modal active' },
            h('div', { className: 'modal-content' },
                h('button', { className: 'close-btn', onClick: closeModals }, '×'),
                h('img', { src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', alt: "Sobre N'ROSEN Studio", className: 'about-img' }),
                h('h3', null, "Sobre N'ROSEN Studio"),
                h('p', { style: { marginTop: '10px', lineHeight: '1.5', fontSize: '0.85rem' } },
                    h('strong', null, 'Misión: '), 'Brindar a cada mujer prendas de loungewear, sleepwear y lencería que transmitan elegancia, comodidad y confianza.',
                    h('br'), h('br'),
                    h('strong', null, 'Visión: '), 'Ser la marca referente de moda íntima y descanso.'
                )
            )
        ),

        // MODAL PRODUCTO
        selectedProduct && h('div', { className: 'modal active' },
            h('div', { className: 'modal-content' },
                h('button', { className: 'close-btn', onClick: closeModals }, '×'),
                h('div', { className: 'product-gallery' },
                    h('img', { id: 'modal-main-img', src: selectedImage, alt: selectedProduct.nombre }),
                    h('div', { className: 'modal-thumbnails' },
                        (selectedProduct.imagenes || [selectedProduct.imagen]).map((src, idx) =>
                            h('img', {
                                key: idx,
                                src: src,
                                className: `thumb-img ${selectedImage === src ? 'active' : ''}`,
                                onClick: () => setSelectedImage(src)
                            })
                        )
                    )
                ),
                h('h3', null, selectedProduct.nombre),
                h('p', { style: { color: 'var(--rosa-viejo)', fontWeight: '600', margin: '5px 0' } }, `$${selectedProduct.precio.toLocaleString("es-CO")}`),
                h('p', { style: { fontSize: '0.85rem', marginBottom: '10px' } }, selectedProduct.descripcion),
                h('label', { style: { fontSize: '0.8rem', fontWeight: '600' } }, 'Talla:'),
                h('div', { className: 'size-options' },
                    selectedProduct.tallas.map((talla) =>
                        h('button', {
                            key: talla,
                            className: `size-btn ${selectedSize === talla ? 'active' : ''}`,
                            onClick: () => setSelectedSize(talla)
                        }, talla)
                    )
                ),
                h('button', { className: 'primary-btn', onClick: handleAddToCart }, 'Añadir a la bolsa')
            )
        ),

        // MODAL AGREGAR PRODUCTO
        isAddProductOpen && h('div', { className: 'modal active' },
            h('div', { className: 'modal-content' },
                h('button', { className: 'close-btn', onClick: closeModals }, '×'),
                h('h3', { style: { marginBottom: '12px' } }, 'Agregar Nuevo Producto'),
                h('form', { onSubmit: handleCreateProductSubmit },
                    h('div', { className: 'form-group' },
                        h('label', { style: { fontSize: '0.75rem', fontWeight: '600' } }, 'Nombre:'),
                        h('input', { type: 'text', required: true, className: 'form-input', value: newProd.nombre, onChange: e => setNewProd({ ...newProd, nombre: e.target.value }) })
                    ),
                    h('div', { className: 'form-group' },
                        h('label', { style: { fontSize: '0.75rem', fontWeight: '600' } }, 'Precio (COP):'),
                        h('input', { type: 'number', required: true, className: 'form-input', value: newProd.precio, onChange: e => setNewProd({ ...newProd, precio: e.target.value }) })
                    ),
                    h('div', { className: 'form-group' },
                        h('label', { style: { fontSize: '0.75rem', fontWeight: '600' } }, 'Categoría:'),
                        h('select', { className: 'form-input', value: newProd.categoria, onChange: e => setNewProd({ ...newProd, categoria: e.target.value }) },
                            h('option', { value: 'lenceria' }, 'Lencería'),
                            h('option', { value: 'pijamas' }, 'Pijamas'),
                            h('option', { value: 'enterizos' }, 'Enterizos'),
                            h('option', { value: 'homewear' }, 'Homewear'),
                            h('option', { value: 'basicos' }, 'Básicos'),
                            h('option', { value: 'accesorios' }, 'Accesorios')
                        )
                    ),
                    h('div', { className: 'form-group' },
                        h('label', { style: { fontSize: '0.75rem', fontWeight: '600' } }, 'Descripción:'),
                        h('input', { type: 'text', required: true, className: 'form-input', value: newProd.descripcion, onChange: e => setNewProd({ ...newProd, descripcion: e.target.value }) })
                    ),
                    h('div', { className: 'form-group' },
                        h('label', { style: { fontSize: '0.75rem', fontWeight: '600' } }, 'Ruta Imagen Principal:'),
                        h('input', { type: 'text', className: 'form-input', value: newProd.imagen, onChange: e => setNewProd({ ...newProd, imagen: e.target.value }) })
                    ),
                    h('button', { type: 'submit', className: 'primary-btn' }, 'Guardar Producto')
                )
            )
        ),

        // MODAL WHATSAPP
        isWhatsappModalOpen && h('div', { className: 'modal active' },
            h('div', { className: 'modal-content', style: { textAlign: 'center' } },
                h('button', { className: 'close-btn', onClick: closeModals }, '×'),
                h('i', { className: 'fa-brands fa-whatsapp', style: { fontSize: '2.8rem', color: '#25d366', marginBottom: '10px' } }),
                h('h3', null, '¡Ya casi está listo!'),
                h('p', { style: { fontSize: '0.85rem', margin: '12px 0' } }, 'Tu pedido ha sido preparado con éxito.'),
                h('button', { className: 'primary-btn', onClick: confirmWhatsapp, style: { backgroundColor: '#25d366', color: '#fff' } },
                    h('i', { className: 'fa-brands fa-whatsapp' }), ' Ir a WhatsApp'
                )
            )
        ),

        // CARRITO SIDEBAR
        h('div', { className: `cart-sidebar ${isCartOpen ? 'active' : ''}` },
            h('div', { className: 'cart-header' },
                h('h3', null, 'Tu Bolsa de Compras'),
                h('button', { className: 'close-btn', onClick: () => setIsCartOpen(false) }, '×')
            ),
            h('div', { className: 'cart-items' },
                carrito.length === 0 ?
                    h('p', { style: { textAlign: 'center', color: 'var(--rosa-viejo)', marginTop: '20px' } }, 'Tu bolsa está vacía.') :
                    carrito.map(item =>
                        h('div', { key: item.cartId, className: 'cart-item' },
                            h('img', { src: item.imagen, alt: item.nombre }),
                            h('div', { className: 'cart-item-details' },
                                h('h4', null, item.nombre),
                                h('p', null, `Talla: ${item.talla} | Cant: ${item.cantidad}`),
                                h('p', null, h('strong', null, `$${(item.precio * item.cantidad).toLocaleString("es-CO")}`))
                            ),
                            h('button', { className: 'remove-item-btn', onClick: () => removeItem(item.cartId) },
                                h('i', { className: 'fa-solid fa-trash' })
                            )
                        )
                    )
            ),
            h('div', { className: 'cart-footer' },
                h('p', { className: 'cart-total-row' },
                    h('span', null, 'Total:'),
                    h('span', null, `$${cartTotal.toLocaleString("es-CO")}`)
                ),
                h('div', { className: 'payment-selection-box' },
                    h('label', { className: 'payment-label' },
                        h('i', { className: 'fa-solid fa-wallet' }), ' Método de pago:'
                    ),
                    h('select', {
                        className: 'payment-select',
                        value: paymentMethod,
                        onChange: e => setPaymentMethod(e.target.value)
                    },
                        h('option', { value: 'Nequi' }, 'Nequi'),
                        h('option', { value: 'Daviplata o billeteras digitales' }, 'Daviplata / Billeteras'),
                        h('option', { value: 'Efectivo' }, 'Efectivo')
                    )
                ),
                h('button', { className: 'primary-btn', onClick: handleCheckout },
                    h('i', { className: 'fa-brands fa-whatsapp' }), ' Pedir por WhatsApp'
                )
            )
        )
    );
}

// INICIALIZACIÓN COMPATIBLE DE REACT
const rootElement = document.getElementById("root");
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(h(App));
}