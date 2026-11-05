const { useState, useEffect } = React;

const PRODUCTOS_INICIALES = [
    {
        id: 1,
        nombre: "Conjunto Satinado Soft",
        precio: 85000,
        categoria: "lenceria",
        descripcion: "Conjunto satinado suave con acabados finos y ajuste perfecto al cuerpo.",
        tallas: ["S", "M", "L", "XL"],
        imagen: "images/imagenespijamas/producto1-1.jpeg",
        imagenes: [
            "images/imagenespijamas/producto1-1.jpeg"
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
    },
    {
        id: 3,
        nombre: "Conjunto de lencería",
        precio: 25000,
        categoria: "lenceria",
        descripcion: "Lencería cómoda y adaptable al cuerpo",
        tallas: ["ÚNICA"],
        imagen: "images/imageneslenceria/producto1-1.jpeg",
        imagenes: [
            "images/imageneslenceria/producto1-1.jpeg",
            "images/imageneslenceria/producto1-2.jpeg",
            "images/imageneslenceria/producto1-3.jpeg",
            "images/imageneslenceria/producto1-4.jpeg",
            "images/imageneslenceria/producto1-5.jpeg",
            "images/imageneslenceria/producto1-6.jpeg"
        ]
    }
];

function App() {
    const [productos, setProductos] = useState(() => {
        const guardados = localStorage.getItem("productos_nrosen");
        return guardados ? JSON.parse(guardados) : PRODUCTOS_INICIALES;
    });

    const [carrito, setCarrito] = useState(() => {
        const guardado = localStorage.getItem("cart_nrosen");
        return guardado ? JSON.parse(guardado) : [];
    });

    const [cliente, setCliente] = useState(() => {
        const guardado = localStorage.getItem("cliente_nrosen");
        return guardado ? JSON.parse(guardado) : { nombre: "", email: "", telefono: "" };
    });

    const [esAdmin, setEsAdmin] = useState(() => {
        return localStorage.getItem("admin_nrosen") === "true";
    });

    const [categoriaActiva, setCategoriaActiva] = useState("todas");
    const [busqueda, setBusqueda] = useState("");
    const [modoOscuro, setModoOscuro] = useState(false);
    const [metodoPago, setMetodoPago] = useState("Nequi");
    const [notificacionesAdmin, setNotificacionesAdmin] = useState([]);

    const [modalNosotras, setModalNosotras] = useState(false);
    const [modalCliente, setModalCliente] = useState(false);
    const [modalAdminLogin, setModalAdminLogin] = useState(false);
    const [modalProductoAdmin, setModalProductoAdmin] = useState(false);
    const [modalDetalleProducto, setModalDetalleProducto] = useState(null);
    const [modalCorreoSimulado, setModalCorreoSimulado] = useState(false);
    const [carritoAbierto, setCarritoAbierto] = useState(false);

    const [formAdmin, setFormAdmin] = useState({
        id: null,
        nombre: "",
        precio: "",
        categoria: "lenceria",
        descripcion: "",
        tallas: "S, M, L, XL",
        imagen: "",
        imagenes: ""
    });

    const [claveInput, setClaveInput] = useState("");
    const [imagenSeleccionadaModal, setImagenSeleccionadaModal] = useState("");
    const [tallaSeleccionadaModal, setTallaSeleccionadaModal] = useState("");
    const [mensajeWS, setMensajeWS] = useState("");

    // Carga de datos desde Firestore (soporta ventana global y modular)
    useEffect(() => {
        const obtenerProductosFirebase = async () => {
            try {
                if (window.db) {
                    let productosNube = [];
                    // Si se usó la sintaxis modular
                    if (window.firebaseTools) {
                        const { collection, getDocs } = window.firebaseTools;
                        const querySnapshot = await getDocs(collection(window.db, "productos"));
                        querySnapshot.forEach((docSnap) => {
                            const data = docSnap.data();
                            if (data && data.nombre && data.precio !== undefined) {
                                productosNube.push({ id: docSnap.id, ...data });
                            }
                        });
                    } 
                    // Si se usa la sintaxis global estándar (compat)
                    else if (typeof window.db.collection === "function") {
                        const querySnapshot = await window.db.collection("productos").get();
                        querySnapshot.forEach((docSnap) => {
                            const data = docSnap.data();
                            if (data && data.nombre && data.precio !== undefined) {
                                productosNube.push({ id: docSnap.id, ...data });
                            }
                        });
                    }

                    if (productosNube.length > 0) {
                        setProductos(productosNube);
                    }
                }
            } catch (error) {
                console.error("Error al cargar productos de Firebase:", error);
            }
        };

        window.addEventListener('firebase-ready', obtenerProductosFirebase);
        obtenerProductosFirebase();

        return () => {
            window.removeEventListener('firebase-ready', obtenerProductosFirebase);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("productos_nrosen", JSON.stringify(productos));
    }, [productos]);

    useEffect(() => {
        localStorage.setItem("cart_nrosen", JSON.stringify(carrito));
    }, [carrito]);

    useEffect(() => {
        localStorage.setItem("cliente_nrosen", JSON.stringify(cliente));
    }, [cliente]);

    useEffect(() => {
        if (modoOscuro) {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }
    }, [modoOscuro]);

    const productosFiltrados = productos.filter(p => {
        const coincideCat = categoriaActiva === "todas" || (p.categoria && p.categoria.toLowerCase() === categoriaActiva);
        const coincideBusqueda = p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return coincideCat && coincideBusqueda;
    });

    const handleLoginAdmin = (e) => {
        e.preventDefault();
        if (claveInput === "nrosen2026") {
            setEsAdmin(true);
            localStorage.setItem("admin_nrosen", "true");
            setModalAdminLogin(false);
            setClaveInput("");
            alert("¡Bienvenida Administradora!");
        } else {
            alert("Contraseña incorrecta");
        }
    };

    const handleCerrarSesionAdmin = () => {
        setEsAdmin(false);
        localStorage.removeItem("admin_nrosen");
    };

    const abrirModalNuevoProducto = () => {
        setFormAdmin({
            id: null,
            nombre: "",
            precio: "",
            categoria: "lenceria",
            descripcion: "",
            tallas: "S, M, L, XL",
            imagen: "",
            imagenes: ""
        });
        setModalProductoAdmin(true);
    };

    const abrirModalEditarProducto = (p, e) => {
        e.stopPropagation();
        setFormAdmin({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            categoria: p.categoria,
            descripcion: p.descripcion,
            tallas: p.tallas ? p.tallas.join(", ") : "ÚNICA",
            imagen: p.imagen,
            imagenes: p.imagenes ? p.imagenes.join("\n") : p.imagen
        });
        setModalProductoAdmin(true);
    };

    const guardarProductoAdmin = async (e) => {
        e.preventDefault();
        const listaImagenes = formAdmin.imagenes
            ? formAdmin.imagenes.split("\n").map(img => img.trim()).filter(Boolean)
            : [formAdmin.imagen];

        const listaTallas = formAdmin.tallas.split(",").map(t => t.trim()).filter(Boolean);

        const nuevoProd = {
            nombre: formAdmin.nombre,
            precio: Number(formAdmin.precio),
            categoria: formAdmin.categoria,
            descripcion: formAdmin.descripcion,
            tallas: listaTallas.length > 0 ? listaTallas : ["ÚNICA"],
            imagen: formAdmin.imagen || listaImagenes[0] || "",
            imagenes: listaImagenes.length > 0 ? listaImagenes : [formAdmin.imagen]
        };

        // Guardado local y sync con Firebase si está disponible
        try {
            if (window.db && typeof window.db.collection === "function") {
                if (formAdmin.id) {
                    await window.db.collection("productos").doc(String(formAdmin.id)).set(nuevoProd, { merge: true });
                } else {
                    const docRef = await window.db.collection("productos").add(nuevoProd);
                    nuevoProd.id = docRef.id;
                }
            }
        } catch (err) {
            console.error("Error al guardar en Firestore:", err);
        }

        const idFinal = formAdmin.id || nuevoProd.id || Date.now();
        const prodFinal = { id: idFinal, ...nuevoProd };

        if (formAdmin.id) {
            setProductos(productos.map(p => p.id === formAdmin.id ? prodFinal : p));
        } else {
            setProductos([...productos, prodFinal]);
        }
        setModalProductoAdmin(false);
    };

    const eliminarProductoAdmin = async (id, e) => {
        e.stopPropagation();
        if (confirm("¿Estás segura de eliminar este producto?")) {
            try {
                if (window.db && typeof window.db.collection === "function") {
                    await window.db.collection("productos").doc(String(id)).delete();
                }
            } catch (err) {
                console.error("Error al eliminar en Firestore:", err);
            }
            setProductos(productos.filter(p => p.id !== id));
        }
    };

    const abrirDetalleProducto = (p) => {
        setModalDetalleProducto(p);
        setImagenSeleccionadaModal(p.imagen);
        setTallaSeleccionadaModal(p.tallas ? p.tallas[0] : "ÚNICA");
    };

    const agregarAlCarrito = () => {
        if (!modalDetalleProducto) return;

        const cartId = `${modalDetalleProducto.id}-${tallaSeleccionadaModal}`;
        const existe = carrito.find(item => item.cartId === cartId);

        if (existe) {
            setCarrito(carrito.map(item => item.cartId === cartId ? { ...item, cantidad: item.cantidad + 1 } : item));
        } else {
            setCarrito([...carrito, {
                cartId,
                id: modalDetalleProducto.id,
                nombre: modalDetalleProducto.nombre,
                precio: Number(modalDetalleProducto.precio || 0),
                talla: tallaSeleccionadaModal,
                imagen: modalDetalleProducto.imagen,
                cantidad: 1
            }]);
        }

        setModalDetalleProducto(null);
        setCarritoAbierto(true);
    };

    const cambiarCantidadCart = (cartId, delta) => {
        setCarrito(carrito.map(item => {
            if (item.cartId === cartId) {
                const nuevaCant = item.cantidad + delta;
                return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : item;
            }
            return item;
        }));
    };

    const eliminarDelCarrito = (cartId) => {
        setCarrito(carrito.filter(item => item.cartId !== cartId));
    };

    const totalCarrito = carrito.reduce((sum, item) => sum + (Number(item.precio || 0) * Number(item.cantidad || 0)), 0);
    const cantidadTotalItems = carrito.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);

    const procesarPedidoWhatsApp = () => {
        if (carrito.length === 0) {
            alert("Tu bolsa está vacía.");
            return;
        }

        if (!cliente.nombre || !cliente.telefono || !cliente.email) {
            alert("Por favor, completa tu información de cliente (Nombre, Teléfono y Correo) antes de pedir.");
            setCarritoAbierto(false);
            setModalCliente(true);
            return;
        }

        let msg = "¡Hola N'ROSEN Studio! ✨ Quisiera realizar el siguiente pedido:\n\n";
        msg += `*Cliente:* ${cliente.nombre}\n`;
        msg += `*Teléfono:* ${cliente.telefono}\n`;
        msg += `*Correo:* ${cliente.email}\n\n`;

        let total = 0;
        carrito.forEach(item => {
            const sub = Number(item.precio || 0) * Number(item.cantidad || 0);
            total += sub;
            msg += `• ${item.nombre} (Talla: ${item.talla}) x${item.cantidad} - $${sub.toLocaleString("es-CO")}\n`;
        });

        msg += `\n*Total a pagar:* $${total.toLocaleString("es-CO")}\n`;
        msg += `*Método de pago:* ${metodoPago}\n\n`;
        msg += `¿Me confirman disponibilidad y datos de pago?`;

        setMensajeWS(msg);
        setCarritoAbierto(false);
        setModalCorreoSimulado(true);
    };

    const confirmarCorreoYEnviarWhatsApp = () => {
        const telefonoEmpresa = "573045934907";

        const templateParams = {
            cliente_nombre: cliente.nombre,
            cliente_email: cliente.email,
            cliente_telefono: cliente.telefono,
            detalles_pedido: carrito.map(i => `${i.nombre} (Talla: ${i.talla}) x${i.cantidad} - $${(Number(i.precio || 0) * Number(i.cantidad || 0)).toLocaleString("es-CO")}`).join("\n"),
            total: `$${totalCarrito.toLocaleString("es-CO")}`,
            metodo_pago: metodoPago
        };

        if (window.emailjs) {
            window.emailjs.send(
                "service_09o9b47",
                "template_s5zurve",
                templateParams,
                "yiwylgGQuoMhGTFLS"
            )
            .then((response) => {
                console.log("¡Correo enviado con éxito!", response.status, response.text);
            })
            .catch((err) => {
                console.error("Error al enviar el correo:", err);
            });
        }

        const nuevaNoti = {
            id: Date.now(),
            texto: `Pedido confirmado por correo (${cliente.email}) y enviado a WhatsApp por ${cliente.nombre}.`,
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setNotificacionesAdmin(prev => [nuevaNoti, ...prev]);

        window.open(`https://wa.me/${telefonoEmpresa}?text=${encodeURIComponent(mensajeWS)}`, "_blank");
        
        setCarrito([]);
        setModalCorreoSimulado(false);
    };

    const cerrarTodosModales = () => {
        setModalNosotras(false);
        setModalCliente(false);
        setModalAdminLogin(false);
        setModalProductoAdmin(false);
        setModalDetalleProducto(null);
        setModalCorreoSimulado(false);
        setCarritoAbierto(false);
    };

    const hayModalAbierto = modalNosotras || modalCliente || modalAdminLogin || modalProductoAdmin || modalDetalleProducto || modalCorreoSimulado || carritoAbierto;

    return (
        <div>
            <div className={`overlay ${hayModalAbierto ? "active" : ""}`} onClick={cerrarTodosModales}></div>

            <header className="navbar">
                <div className="nav-left">
                    <button className="highlight-about-btn" onClick={() => setModalNosotras(true)}>
                        NOSOTRAS ✨
                    </button>
                    {esAdmin ? (
                        <button className="admin-badge-btn" onClick={abrirModalNuevoProducto}>
                            + Producto
                        </button>
                    ) : null}
                </div>

                <div className="logo-container">
                    <div className="brand-logo">
                        <span className="logo-main">N'ROSEN</span>
                        <span className="logo-sub">STUDIO</span>
                        <span className="logo-tagline">"Porque sentirse bien también se viste"</span>
                    </div>
                </div>

                <div className="nav-right">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    
                    <button className="icon-btn" onClick={() => setModalCliente(true)} title="Mi Perfil / Datos">
                        <i className="fa-solid fa-user"></i>
                    </button>

                    <button className="icon-btn" onClick={() => setModoOscuro(!modoOscuro)} title="Cambiar tema">
                        <i className={`fa-solid ${modoOscuro ? "fa-sun" : "fa-moon"}`}></i>
                    </button>

                    <button className="icon-btn" onClick={() => setCarritoAbierto(true)} title="Bolsa de compras">
                        <i className="fa-solid fa-bag-shopping"></i>
                        <span id="cart-count">{cantidadTotalItems}</span>
                    </button>

                    {esAdmin ? (
                        <button className="icon-btn" onClick={handleCerrarSesionAdmin} title="Cerrar Modo Admin" style={{ color: "#b57a7a" }}>
                            <i className="fa-solid fa-right-from-bracket"></i>
                        </button>
                    ) : (
                        <button className="icon-btn" onClick={() => setModalAdminLogin(true)} title="Acceso Admin">
                            <i className="fa-solid fa-lock"></i>
                        </button>
                    )}
                </div>
            </header>

            {esAdmin && notificacionesAdmin.length > 0 && (
                <div style={{ background: "var(--rosa-palo)", borderBottom: "1px solid var(--border-color)", padding: "8px 4%", fontSize: "0.8rem", color: "var(--texto-principal)" }}>
                    <strong>🔔 Notificaciones Admin:</strong>
                    <ul style={{ margin: "4px 0 0 15px" }}>
                        {notificacionesAdmin.map(n => (
                            <li key={n.id}>[{n.hora}] {n.texto}</li>
                        ))}
                    </ul>
                </div>
            )}

            <nav className="categories-bar">
                <div className="categories-wrapper">
                    {["todas", "lenceria", "pijamas", "enterizos", "homewear", "basicos", "accesorios"].map((cat) => (
                        <button
                            key={cat}
                            className={`category-btn ${categoriaActiva === cat ? "active" : ""}`}
                            onClick={() => setCategoriaActiva(cat)}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="main-content">
                <h2 className="section-title">COLECCIÓN DESTACADA</h2>
                <div className="products-grid">
                    {productosFiltrados.length === 0 ? (
                        <p style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--rosa-viejo)" }}>
                            No se encontraron productos.
                        </p>
                    ) : (
                        productosFiltrados.map((prod) => (
                            <div key={prod.id} className="product-card" onClick={() => abrirDetalleProducto(prod)}>
                                {esAdmin && (
                                    <div className="admin-actions">
                                        <button onClick={(e) => abrirModalEditarProducto(prod, e)}>
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                        <button onClick={(e) => eliminarProductoAdmin(prod.id, e)}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                )}
                                <img src={prod.imagen} alt={prod.nombre} />
                                <div className="product-card-info">
                                    <h3>{prod.nombre}</h3>
                                    <p>${Number(prod.precio || 0).toLocaleString("es-CO")}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <div className={`modal ${modalNosotras ? "active" : ""}`}>
                <div className="modal-content">
                    <button className="close-btn" onClick={() => setModalNosotras(false)}>&times;</button>
                    <img src="images/WhatsApp Image 2026-07-18 at 9.18.54 AM.jpeg" alt="Sobre N'ROSEN Studio" className="about-img" />
                    <h3>Sobre N'ROSEN Studio</h3>
                    <p style={{ marginTop: "10px", lineHeight: "1.5", fontSize: "0.85rem" }}>
                        <strong>Misión:</strong> Brindar a cada mujer prendas de loungewear, sleepwear y lencería que transmitan elegancia, comodidad y confianza en su día a día.<br/><br/>
                        <strong>Visión:</strong> Ser la marca referente de moda íntima y descanso por su estilo y calidad superior.
                    </p>
                </div>
            </div>

            <div className={`modal ${modalCliente ? "active" : ""}`}>
                <div className="modal-content">
                    <button className="close-btn" onClick={() => setModalCliente(false)}>&times;</button>
                    <h3 style={{ marginBottom: "15px" }}>Perfil de Cliente</h3>
                    <div className="form-group">
                        <label>Nombre Completo:</label>
                        <input
                            type="text"
                            className="form-input"
                            value={cliente.nombre}
                            onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div className="form-group">
                        <label>Correo Gmail / Email:</label>
                        <input
                            type="email"
                            className="form-input"
                            value={cliente.email}
                            onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                            placeholder="ejemplo@gmail.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Número de WhatsApp / Teléfono:</label>
                        <input
                            type="text"
                            className="form-input"
                            value={cliente.telefono}
                            onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                            placeholder="300 000 0000"
                        />
                    </div>
                    <button className="primary-btn" onClick={() => setModalCliente(false)}>Guardar Datos</button>
                </div>
            </div>

            <div className={`modal ${modalAdminLogin ? "active" : ""}`}>
                <div className="modal-content">
                    <button className="close-btn" onClick={() => setModalAdminLogin(false)}>&times;</button>
                    <h3>Acceso Administradora</h3>
                    <form onSubmit={handleLoginAdmin} style={{ marginTop: "15px" }}>
                        <div className="form-group">
                            <label>Contraseña de acceso:</label>
                            <input
                                type="password"
                                className="form-input"
                                value={claveInput}
                                onChange={(e) => setClaveInput(e.target.value)}
                                placeholder="Ingresa clave"
                                required
                            />
                        </div>
                        <button type="submit" className="primary-btn">Ingresar como Admin</button>
                    </form>
                </div>
            </div>

            <div className={`modal ${modalProductoAdmin ? "active" : ""}`}>
                <div className="modal-content">
                    <button className="close-btn" onClick={() => setModalProductoAdmin(false)}>&times;</button>
                    <h3>{formAdmin.id ? "Editar Producto" : "Nuevo Producto"}</h3>
                    <form onSubmit={guardarProductoAdmin} style={{ marginTop: "10px" }}>
                        <div className="form-group">
                            <label>Nombre:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formAdmin.nombre}
                                onChange={(e) => setFormAdmin({ ...formAdmin, nombre: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Precio ($ COP):</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formAdmin.precio}
                                onChange={(e) => setFormAdmin({ ...formAdmin, precio: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Categoría:</label>
                            <select
                                className="form-input"
                                value={formAdmin.categoria}
                                onChange={(e) => setFormAdmin({ ...formAdmin, categoria: e.target.value })}
                            >
                                <option value="lenceria">Lencería</option>
                                <option value="pijamas">Pijamas</option>
                                <option value="enterizos">Enterizos</option>
                                <option value="homewear">Homewear</option>
                                <option value="basicos">Básicos</option>
                                <option value="accesorios">Accesorios</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tallas (separadas por coma):</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formAdmin.tallas}
                                onChange={(e) => setFormAdmin({ ...formAdmin, tallas: e.target.value })}
                                placeholder="S, M, L, XL"
                            />
                        </div>
                        <div className="form-group">
                            <label>Imagen Principal (Ruta o URL):</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formAdmin.imagen}
                                onChange={(e) => setFormAdmin({ ...formAdmin, imagen: e.target.value })}
                                placeholder="images/producto.jpeg"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Galería (Rutas por línea):</label>
                            <textarea
                                className="form-input"
                                rows="3"
                                value={formAdmin.imagenes}
                                onChange={(e) => setFormAdmin({ ...formAdmin, imagenes: e.target.value })}
                                placeholder="images/foto1.jpeg&#10;images/foto2.jpeg"
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label>Descripción:</label>
                            <textarea
                                className="form-input"
                                rows="2"
                                value={formAdmin.descripcion}
                                onChange={(e) => setFormAdmin({ ...formAdmin, descripcion: e.target.value })}
                            ></textarea>
                        </div>
                        <button type="submit" className="primary-btn">Guardar Cambios</button>
                    </form>
                </div>
            </div>

            {modalDetalleProducto && (
                <div className="modal active">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setModalDetalleProducto(null)}>&times;</button>
                        <div className="product-gallery">
                            <img src={imagenSeleccionadaModal} alt={modalDetalleProducto.nombre} className="modal-main-img" />
                            <div className="modal-thumbnails">
                                {(modalDetalleProducto.imagenes || [modalDetalleProducto.imagen]).map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        className={`thumb-img ${imagenSeleccionadaModal === img ? "active" : ""}`}
                                        onClick={() => setImagenSeleccionadaModal(img)}
                                    />
                                ))}
                            </div>
                        </div>
                        <h3>{modalDetalleProducto.nombre}</h3>
                        <p style={{ color: "var(--rosa-viejo)", fontWeight: 600, margin: "5px 0" }}>
                            ${Number(modalDetalleProducto.precio || 0).toLocaleString("es-CO")}
                        </p>
                        <p style={{ fontSize: "0.85rem", marginBottom: "10px" }}>
                            {modalDetalleProducto.descripcion}
                        </p>

                        <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Talla:</label>
                        <div className="size-options">
                            {(modalDetalleProducto.tallas || ["ÚNICA"]).map((talla) => (
                                <button
                                    key={talla}
                                    className={`size-btn ${tallaSeleccionadaModal === talla ? "active" : ""}`}
                                    onClick={() => setTallaSeleccionadaModal(talla)}
                                >
                                    {talla}
                                </button>
                            ))}
                        </div>

                        <button className="primary-btn" onClick={agregarAlCarrito}>Añadir a la bolsa</button>
                    </div>
                </div>
            )}

            <div className={`modal ${modalCorreoSimulado ? "active" : ""}`}>
                <div className="modal-content" style={{ padding: "0", overflow: "hidden", maxWidth: "450px" }}>
                    <div style={{ background: "#4a3e3d", color: "#f4ece8", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", letterSpacing: "1px" }}>N'ROSEN Studio</span>
                        <button className="close-btn" onClick={() => setModalCorreoSimulado(false)} style={{ color: "#f4ece8", position: "static" }}>&times;</button>
                    </div>

                    <div style={{ padding: "20px" }}>
                        <div style={{ background: "var(--rosa-palo)", padding: "15px", borderRadius: "8px", borderLeft: "4px solid var(--rosa-viejo)", marginBottom: "15px" }}>
                            <h3 style={{ fontSize: "1rem", color: "var(--texto-principal)", marginBottom: "5px" }}>¿Confirmas tu pedido, {cliente.nombre}? ✨</h3>
                            <p style={{ fontSize: "0.8rem", color: "var(--texto-principal)" }}>
                                Hola <strong>{cliente.email}</strong>. Hemos recibido los datos de tu orden. Haz clic en confirmar para enviar el correo real a nuestro sistema y proceder con el envío a WhatsApp.
                            </p>
                        </div>

                        <div style={{ fontSize: "0.8rem", marginBottom: "15px", maxHeight: "150px", overflowY: "auto" }}>
                            <strong>Resumen de tu compra:</strong>
                            {carrito.map(item => (
                                <div key={item.cartId} style={{ display: "flex", justifyContent: "space-between", margin: "5px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
                                    <span>{item.nombre} (Talla: {item.talla}) x{item.cantidad}</span>
                                    <span>${(Number(item.precio || 0) * Number(item.cantidad || 0)).toLocaleString("es-CO")}</span>
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginTop: "8px" }}>
                                <span>Total:</span>
                                <span>${totalCarrito.toLocaleString("es-CO")}</span>
                            </div>
                            <p style={{ marginTop: "6px" }}><strong>Método de pago:</strong> {metodoPago}</p>
                        </div>

                        <button 
                            className="primary-btn" 
                            onClick={confirmarCorreoYEnviarWhatsApp}
                            style={{ backgroundColor: "#25d366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        >
                            <i className="fa-solid fa-check-circle"></i> Confirmar y Enviar a WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            <div className={`cart-sidebar ${carritoAbierto ? "active" : ""}`}>
                <div className="cart-header">
                    <h3>Tu Bolsa de Compras</h3>
                    <button className="close-btn" onClick={() => setCarritoAbierto(false)}>&times;</button>
                </div>

                <div className="cart-items">
                    {carrito.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--rosa-viejo)", marginTop: "20px" }}>
                            Tu bolsa está vacía.
                        </p>
                    ) : (
                        carrito.map((item) => (
                            <div key={item.cartId} className="cart-item">
                                <img src={item.imagen} alt={item.nombre} />
                                <div className="cart-item-details">
                                    <h4>{item.nombre}</h4>
                                    <p>Talla: {item.talla}</p>
                                    <div className="qty-controls">
                                        <button className="qty-btn" onClick={() => cambiarCantidadCart(item.cartId, -1)}>-</button>
                                        <span style={{ fontSize: "0.8rem" }}>{item.cantidad}</span>
                                        <button className="qty-btn" onClick={() => cambiarCantidadCart(item.cartId, 1)}>+</button>
                                    </div>
                                    <p style={{ marginTop: "4px" }}>
                                        <strong>${(Number(item.precio || 0) * Number(item.cantidad || 0)).toLocaleString("es-CO")}</strong>
                                    </p>
                                </div>
                                <button className="remove-item-btn" onClick={() => eliminarDelCarrito(item.cartId)}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="cart-total-row">
                        <span>Total:</span>
                        <span>${totalCarrito.toLocaleString("es-CO")}</span>
                    </div>

                    <div className="payment-selection-box">
                        <label className="payment-label">
                            <i className="fa-solid fa-wallet"></i> Métodos de pago aceptados:
                        </label>
                        <select
                            className="payment-select"
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                        >
                            <option value="Nequi">Nequi</option>
                            <option value="Daviplata o billeteras digitales">Daviplata / Billeteras digitales</option>
                            <option value="Efectivo">Efectivo</option>
                        </select>
                    </div>

                    <button className="primary-btn" onClick={procesarPedidoWhatsApp}>
                        <i className="fa-brands fa-whatsapp"></i> Pedir por WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);