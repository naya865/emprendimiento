// App.js (Sin Babel - JavaScript puro)
import { supabaseClient } from './services/supabaseClient.js';
import { enviarCorreoPedido } from './services/emailService.js';
import { PRODUCTOS_INICIALES } from '../data/productos.js';
import { generarDescripcionConIA } from './services/aiService.js';

const { useState, useEffect, createElement: h } = React;

function App() {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        async function obtenerProductos() {
            const { data, error } = await supabaseClient
                .from('productos')
                .select('*');

            if (error) {
                console.error("Error al cargar productos de Supabase:", error);
                setProductos(PRODUCTOS_INICIALES);
            } else if (data && data.length > 0) {
                const productosFormateados = data.map(p => ({
                    ...p,
                    tallas: typeof p.tallas === 'string' ? p.tallas.split(',').map(t => t.trim()) : (p.tallas || ["ÚNICA"]),
                    imagenes: typeof p.imagenes === 'string' ? p.imagenes.split('\n').map(i => i.trim()).filter(Boolean) : (p.imagenes || [p.imagen])
                }));
                setProductos(productosFormateados);
            } else {
                for (let prod of PRODUCTOS_INICIALES) {
                    await supabaseClient.from('productos').insert([{
                        nombre: prod.nombre,
                        precio: prod.precio,
                        categoria: prod.categoria,
                        descripcion: prod.descripcion,
                        tallas: prod.tallas.join(", "),
                        imagen: prod.imagen,
                        imagenes: prod.imagenes.join("\n")
                    }]);
                }
                setProductos(PRODUCTOS_INICIALES);
            }
        }
        obtenerProductos();
    }, []);

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
        const coincideCat = categoriaActiva === "todas" || p.categoria.toLowerCase() === categoriaActiva;
        const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
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
            tallas: Array.isArray(p.tallas) ? p.tallas.join(", ") : (p.tallas || "ÚNICA"),
            imagen: p.imagen,
            imagenes: Array.isArray(p.imagenes) ? p.imagenes.join("\n") : (p.imagenes || p.imagen)
        });
        setModalProductoAdmin(true);
    };

    const manejarGeneracionIA = async () => {
        const btnIA = document.getElementById('btn-generar-ia');
        try {
            if (!formAdmin.nombre) {
                alert("Por favor ingresa primero el nombre del producto.");
                return;
            }

            if (btnIA) {
                btnIA.disabled = true;
                btnIA.innerText = "✨ Generando...";
            }

            const descripcionGenerada = await generarDescripcionConIA(formAdmin.nombre, formAdmin.categoria);
            setFormAdmin(prev => ({ ...prev, descripcion: descripcionGenerada }));

        } catch (error) {
            alert(error.message);
        } finally {
            if (btnIA) {
                btnIA.disabled = false;
                btnIA.innerText = "✨ Generar Descripción con IA";
            }
        }
    };

    const guardarProductoAdmin = async (e) => {
        e.preventDefault();
        const listaImagenesTexto = formAdmin.imagenes || formAdmin.imagen;
        const listaTallasTexto = formAdmin.tallas;

        const objetoBD = {
            nombre: formAdmin.nombre,
            precio: Number(formAdmin.precio),
            categoria: formAdmin.categoria,
            descripcion: formAdmin.descripcion,
            tallas: listaTallasTexto,
            imagen: formAdmin.imagen,
            imagenes: listaImagenesTexto
        };

        if (formAdmin.id) {
            const { error } = await supabaseClient
                .from('productos')
                .update(objetoBD)
                .eq('id', formAdmin.id);

            if (error) {
                alert("Hubo un error al actualizar el producto.");
                return;
            }

            setProductos(productos.map(p => p.id === formAdmin.id ? { ...formAdmin, precio: Number(formAdmin.precio), tallas: listaTallasTexto.split(","), imagenes: listaImagenesTexto.split("\n") } : p));
        } else {
            const { data, error } = await supabaseClient
                .from('productos')
                .insert([objetoBD])
                .select();

            if (error) {
                alert("Hubo un error al guardar el producto en la nube.");
                return;
            }

            if (data && data[0]) {
                const nuevoProdFormateado = {
                    ...data[0],
                    tallas: data[0].tallas.split(",").map(t => t.trim()),
                    imagenes: data[0].imagenes.split("\n").map(i => i.trim())
                };
                setProductos([...productos, nuevoProdFormateado]);
            }
        }
        setModalProductoAdmin(false);
    };

    const eliminarProductoAdmin = async (id, e) => {
        e.stopPropagation();
        if (confirm("¿Estás segura de eliminar este producto?")) {
            const { error } = await supabaseClient
                .from('productos')
                .delete()
                .eq('id', id);

            if (error) {
                alert("No se pudo eliminar el producto.");
                return;
            }

            setProductos(productos.filter(p => p.id !== id));
        }
    };

    const abrirDetalleProducto = (p) => {
        setModalDetalleProducto(p);
        setImagenSeleccionadaModal(p.imagen);
        setTallaSeleccionadaModal(p.tallas && p.tallas.length > 0 ? p.tallas[0] : "ÚNICA");
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
                precio: modalDetalleProducto.precio,
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

    const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const cantidadTotalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    const procesarPedidoWhatsApp = () => {
        if (carrito.length === 0) {
            alert("Tu bolsa está vacía.");
            return;
        }

        if (!cliente.nombre || !cliente.telefono || !cliente.email) {
            alert("Por favor, completa tu información de cliente antes de pedir.");
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
            const sub = item.precio * item.cantidad;
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

        enviarCorreoPedido(cliente, carrito, totalCarrito, metodoPago).catch(err => console.error(err));

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

    return h('div', null,
        h('div', { className: `overlay ${hayModalAbierto ? "active" : ""}`, onClick: cerrarTodosModales }),

        h('header', { className: 'navbar' },
            h('div', { className: 'nav-left' },
                h('button', { className: 'highlight-about-btn', onClick: () => setModalNosotras(true) }, 'NOSOTRAS ✨'),
                esAdmin ? h('button', { className: 'admin-badge-btn', onClick: abrirModalNuevoProducto }, '+ Producto') : null
            ),
            h('div', { className: 'logo-container' },
                h('div', { className: 'brand-logo' },
                    h('span', { className: 'logo-main' }, "N'ROSEN"),
                    h('span', { className: 'logo-sub' }, "STUDIO"),
                    h('span', { className: 'logo-tagline' }, '"Porque sentirse bien también se viste"')
                )
            ),
            h('div', { className: 'nav-right' },
                h('div', { className: 'search-box' },
                    h('input', { type: 'text', placeholder: 'Buscar producto...', value: busqueda, onChange: (e) => setBusqueda(e.target.value) })
                ),
                h('button', { className: 'icon-btn', onClick: () => setModalCliente(true), title: 'Mi Perfil' },
                    h('i', { className: 'fa-solid fa-user' })
                ),
                h('button', { className: 'icon-btn', onClick: () => setModoOscuro(!modoOscuro), title: 'Cambiar tema' },
                    h('i', { className: `fa-solid ${modoOscuro ? "fa-sun" : "fa-moon"}` })
                ),
                h('button', { className: 'icon-btn', onClick: () => setCarritoAbierto(true), title: 'Bolsa' },
                    h('i', { className: 'fa-solid fa-bag-shopping' }),
                    h('span', { id: 'cart-count' }, cantidadTotalItems)
                ),
                esAdmin 
                    ? h('button', { className: 'icon-btn', onClick: handleCerrarSesionAdmin, title: 'Cerrar Admin', style: { color: "#b57a7a" } },
                        h('i', { className: 'fa-solid fa-right-from-bracket' })
                      )
                    : h('button', { className: 'icon-btn', onClick: () => setModalAdminLogin(true), title: 'Acceso Admin' },
                        h('i', { className: 'fa-solid fa-lock' })
                      )
            )
        ),

        (esAdmin && notificacionesAdmin.length > 0) ? h('div', { style: { background: "var(--rosa-palo)", borderBottom: "1px solid var(--border-color)", padding: "8px 4%", fontSize: "0.8rem", color: "var(--texto-principal)" } },
            h('strong', null, '🔔 Notificaciones Admin:'),
            h('ul', { style: { margin: "4px 0 0 15px" } }, notificacionesAdmin.map(n => h('li', { key: n.id }, `[${n.hora}] ${n.texto}`)))
        ) : null,

        h('nav', { className: 'categories-bar' },
            h('div', { className: 'categories-wrapper' }, 
                ["todas", "lenceria", "pijamas", "enterizos", "homewear", "basicos", "accesorios"].map((cat) => 
                    h('button', {
                        key: cat,
                        className: `category-btn ${categoriaActiva === cat ? "active" : ""}`,
                        onClick: () => setCategoriaActiva(cat)
                    }, cat.charAt(0).toUpperCase() + cat.slice(1))
                )
            )
        ),

        h('main', { className: 'main-content' },
            h('h2', { className: 'section-title' }, 'COLECCIÓN DESTACADA'),
            h('div', { className: 'products-grid' }, 
                productosFiltrados.length === 0 
                    ? h('p', { style: { gridColumn: "1/-1", textAlign: "center", color: "var(--rosa-viejo)" } }, 'No se encontraron productos.')
                    : productosFiltrados.map((prod) => 
                        h('div', { key: prod.id, className: 'product-card', onClick: () => abrirDetalleProducto(prod) },
                            esAdmin ? h('div', { className: 'admin-actions' },
                                h('button', { onClick: (e) => abrirModalEditarProducto(prod, e) }, h('i', { className: 'fa-solid fa-pen' })),
                                h('button', { onClick: (e) => eliminarProductoAdmin(prod.id, e) }, h('i', { className: 'fa-solid fa-trash' }))
                            ) : null,
                            h('img', { src: prod.imagen, alt: prod.nombre }),
                            h('div', { className: 'product-card-info' },
                                h('h3', null, prod.nombre),
                                h('p', null, `$${prod.precio.toLocaleString("es-CO")}`)
                            )
                        )
                    )
            )
        ),

        modalNosotras ? h('div', { className: 'modal active' },
            h('div', { className: 'modal-content' },
                h('button', { className: 'close-btn', onClick: () => setModalNosotras(false) }, '×'),
                h('img', { src: "images/WhatsApp Image 2026-07-18 at 9.18.54 AM.jpeg", alt: "Sobre N'ROSEN Studio", className: "about-img" }),
                h('h3', null, "Sobre N'ROSEN Studio"),
                h('p', { style: { marginTop: "10px", lineHeight: "1.5", fontSize: "0.85rem" } },
                    h('strong', null, 'Misión:'), ' Brindar a cada mujer prendas de loungewear, sleepwear y lencería que transmitan elegancia, comodidad y confianza en su día a día.',
                    h('br', null), h('br', null),
                    h('strong', null, 'Visión:'), ' Ser la marca referente de moda íntima y descanso por su estilo y calidad superior.'
                )
            )
        ) : null,

        modalCliente ? h('div', { className: 'modal active' },
            h('div', { className: 'modal-content' },
                h('button', { className: 'close-btn', onClick: () => setModalCliente(false) }, '×'),
                h('h3', { style: { marginBottom: "15px" } }, 'Perfil de Cliente'),
                h('div', { className: 'form-group' },
                    h('label', null, 'Nombre Completo:'),
                    h('input', { type: 'text', className: 'form-input', value: cliente.nombre, onChange: (e) => setCliente({ ...cliente, nombre: e.target.value }), placeholder: 'Tu nombre' })
                ),
                h('div', { className: 'form-group' },
                    h('label', null, 'Correo Gmail / Email:'),
                    h('input', { type: 'email', className: 'form-input', value: cliente.email, onChange: (e) => setCliente({ ...cliente, email: e.target.value }), placeholder: 'ejemplo@gmail.com' })
                ),
                h('div', { className: 'form-group' },
                    h('label', null, 'Número de WhatsApp / Teléfono:'),
                    h('input', { type: 'text', className: 'form-input', value: cliente.telefono, onChange: (e) => setCliente({ ...cliente, telefono: e.target.value }), placeholder: '300 000 0000' })
                ),
                h('button', { className: 'primary-btn', onClick: () => setModalCliente(false) }, 'Guardar Datos')
            )
        ) : null,

        modalAdminLogin ? h('div', { className: 'modal active' },
            h('div', { className: 'modal-content' },
                h('button', { className: 'close-btn', onClick: () => setModalAdminLogin(false) }, '×'),
                h('h3', null, 'Acceso Administradora'),
                h('form', { onSubmit: handleLoginAdmin, style: { marginTop: "15px" } },
                    h('div', { className: 'form-group' },
                        h('label', null, 'Contraseña de acceso:'),
                        h('input', { type: 'password', className: 'form-input', value: claveInput, onChange: (e) => setClaveInput(e.target.value), placeholder: 'Ingresa clave', required: true })
                    ),
                    h('button', { type: 'submit', className: 'primary-btn' }, 'Ingresar como Admin')
                )
            )
        ) : null,

        modalProductoAdmin ? h('div', { className: 'modal active' },
            h('div', { className: 'modal-content' },
                h('button', { className: 'close-btn', onClick: () => setModalProductoAdmin(false) }, '×'),
                h('h3', null, formAdmin.id ? "Editar Producto" : "Nuevo Producto"),
                h('form', { onSubmit: guardarProductoAdmin },
                    h('div', { className: 'form-group' },
                        h('label', null, 'Nombre:'),
                        h('input', { type: 'text', className: 'form-input', value: formAdmin.nombre, onChange: (e) => setFormAdmin({ ...formAdmin, nombre: e.target.value }), placeholder: 'Ej: Conjunto de satín', required: true })
                    ),
                    h('div', { style: { margin: "10px 0" } },
                        h('button', { type: 'button', id: 'btn-generar-ia', onClick: manejarGeneracionIA, style: { width: "100%", background: "linear-gradient(135deg, #b57a7a, #d4a373)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" } }, '✨ Generar Descripción con IA')
                    ),
                    h('div', { className: 'form-group' },
                        h('label', null, 'Precio ($ COP):'),
                        h('input', { type: 'number', className: 'form-input', value: formAdmin.precio, onChange: (e) => setFormAdmin({ ...formAdmin, precio: e.target.value }), required: true })
                    ),
                    h('div', { className: 'form-group' },
                        h('label', null, 'Categoría:'),
                        h('select', { className: 'form-input', value: formAdmin.categoria, onChange: (e) => setFormAdmin({ ...formAdmin, categoria: e.target.value }) },
                            h('option', { value: 'lenceria' }, 'Lencería'),
                            h('option', { value: 'pijamas' }, 'Pijamas'),
                            h('option', { value: 'enterizos' }, 'Enterizos'),
                            h('option', { value: 'homewear' }, 'Homewear'),
                            h('option', { value: 'basicos' }, 'Básicos'),
                            h('option', { value: 'accesorios' }, 'Accesorios')
                        )
                    ),
                    h('div', { className: 'form-group' },
                        h('label', null, 'Tallas (separadas por coma):'),
                        h('input', { type: 'text', className: 'form-input', value: formAdmin.tallas, onChange: (e) => setFormAdmin({ ...formAdmin, tallas: e.target.value }), placeholder: 'S, M, L, XL' })
                    ),
                    h('div', { className: 'form-group' },
                        h('label', null, 'Imagen Principal (Ruta o URL):'),
                        h('input', { type: 'text', className: 'form-input', value: formAdmin.imagen, onChange: (e) => setFormAdmin({ ...formAdmin, imagen: e.target.value }), placeholder: 'images/producto.jpeg', required: true })
                    ),
                    h('div', { className: 'form-group' },
                        h('label', null, 'Galería (Rutas por línea):'),
                        h('textarea', { className: 'form-input', rows: '2', value: formAdmin.imagenes, onChange: (e) => setFormAdmin({ ...formAdmin, imagenes: e.target.value }), placeholder: 'images/foto1.jpeg\nimages/foto2.jpeg' })
                    ),
                    h('div', { className: 'form-group' },
                        h('label', null, 'Descripción:'),
                        h('textarea', { className: 'form-input', rows: '3', value: formAdmin.descripcion, onChange: (e) => setFormAdmin({ ...formAdmin, descripcion: e.target.value }), placeholder: 'Escribe el nombre y presiona el botón de arriba...' })
                    ),
                    h('button', { type: 'submit', className: 'primary-btn' }, 'Guardar Cambios')
                )
            )
        ) : null,

        modalDetalleProducto ? h('div', { className: 'modal active' },
            h('div', { className: 'modal-content' },
                h('button', { className: 'close-btn', onClick: () => setModalDetalleProducto(null) }, '×'),
                h('div', { className: 'product-gallery' },
                    h('img', { src: imagenSeleccionadaModal, alt: modalDetalleProducto.nombre, className: 'modal-main-img' }),
                    h('div', { className: 'modal-thumbnails' }, 
                        (modalDetalleProducto.imagenes || [modalDetalleProducto.imagen]).map((img, idx) => 
                            h('img', { key: idx, src: img, className: `thumb-img ${imagenSeleccionadaModal === img ? "active" : ""}`, onClick: () => setImagenSeleccionadaModal(img) })
                        )
                    )
                ),
                h('h3', null, modalDetalleProducto.nombre),
                h('p', { style: { color: "var(--rosa-viejo)", fontWeight: 600, margin: "5px 0" } }, `$${modalDetalleProducto.precio.toLocaleString("es-CO")}`),
                h('p', { style: { fontSize: "0.85rem", marginBottom: "10px" } }, modalDetalleProducto.descripcion),
                h('label', { style: { fontSize: "0.8rem", fontWeight: 600 } }, 'Talla:'),
                h('div', { className: 'size-options' }, 
                    (modalDetalleProducto.tallas || ["ÚNICA"]).map((talla) => 
                        h('button', { key: talla, className: `size-btn ${tallaSeleccionadaModal === talla ? "active" : ""}`, onClick: () => setTallaSeleccionadaModal(talla) }, talla)
                    )
                ),
                h('button', { className: 'primary-btn', onClick: agregarAlCarrito }, 'Añadir a la bolsa')
            )
        ) : null,

        modalCorreoSimulado ? h('div', { className: 'modal active' },
            h('div', { className: 'modal-content', style: { padding: "0", overflow: "hidden", maxWidth: "450px" } },
                h('div', { style: { background: "#4a3e3d", color: "#f4ece8", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" } },
                    h('span', { style: { fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", letterSpacing: "1px" } }, "N'ROSEN Studio"),
                    h('button', { className: 'close-btn', onClick: () => setModalCorreoSimulado(false), style: { color: "#f4ece8", position: "static" } }, '×')
                ),
                h('div', { style: { padding: "20px" } },
                    h('div', { style: { background: "var(--rosa-palo)", padding: "15px", borderRadius: "8px", borderLeft: "4px solid var(--rosa-viejo)", marginBottom: "15px" } },
                        h('h3', { style: { fontSize: "1rem", color: "var(--texto-principal)", marginBottom: "5px" } }, `¿Confirmas tu pedido, ${cliente.nombre}? ✨`),
                        h('p', { style: { fontSize: "0.8rem", color: "var(--texto-principal)" } },
                            'Hola ', h('strong', null, cliente.email), '. Hemos recibido los datos de tu orden. Haz clic en confirmar para enviar el correo y proceder con el envío a WhatsApp.'
                        )
                    ),
                    h('div', { style: { fontSize: "0.8rem", marginBottom: "15px", maxHeight: "150px", overflowY: "auto" } },
                        h('strong', null, 'Resumen de tu compra:'),
                        carrito.map(item => 
                            h('div', { key: item.cartId, style: { display: "flex", justifyContent: "space-between", margin: "5px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" } },
                                h('span', null, `${item.nombre} (Talla: ${item.talla}) x${item.cantidad}`),
                                h('span', null, `$${(item.precio * item.cantidad).toLocaleString("es-CO")}`)
                            )
                        ),
                        h('div', { style: { display: "flex", justifyContent: "space-between", fontWeight: "bold", marginTop: "8px" } },
                            h('span', null, 'Total:'),
                            h('span', null, `$${totalCarrito.toLocaleString("es-CO")}`)
                        ),
                        h('p', { style: { marginTop: "6px" } }, h('strong', null, 'Método de pago: '), metodoPago)
                    ),
                    h('button', { className: 'primary-btn', onClick: confirmarCorreoYEnviarWhatsApp, style: { backgroundColor: "#25d366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" } },
                        h('i', { className: 'fa-solid fa-check-circle' }), ' Confirmar y Enviar a WhatsApp'
                    )
                )
            )
        ) : null,

        h('div', { className: `cart-sidebar ${carritoAbierto ? "active" : ""}` },
            h('div', { className: 'cart-header' },
                h('h3', null, 'Tu Bolsa de Compras'),
                h('button', { className: 'close-btn', onClick: () => setCarritoAbierto(false) }, '×')
            ),
            h('div', { className: 'cart-items' }, 
                carrito.length === 0 
                    ? h('p', { style: { textAlign: "center", color: "var(--rosa-viejo)", marginTop: "20px" } }, 'Tu bolsa está vacía.')
                    : carrito.map((item) => 
                        h('div', { key: item.cartId, className: 'cart-item' },
                            h('img', { src: item.imagen, alt: item.nombre }),
                            h('div', { className: 'cart-item-details' },
                                h('h4', null, item.nombre),
                                h('p', null, `Talla: ${item.talla}`),
                                h('div', { className: 'qty-controls' },
                                    h('button', { className: 'qty-btn', onClick: () => cambiarCantidadCart(item.cartId, -1) }, '-'),
                                    h('span', { style: { fontSize: "0.8rem" } }, item.cantidad),
                                    h('button', { className: 'qty-btn', onClick: () => cambiarCantidadCart(item.cartId, 1) }, '+')
                                ),
                                h('p', { style: { marginTop: "4px" } },
                                    h('strong', null, `$${(item.precio * item.cantidad).toLocaleString("es-CO")}`)
                                )
                            ),
                            h('button', { className: 'remove-item-btn', onClick: () => eliminarDelCarrito(item.cartId) },
                                h('i', { className: 'fa-solid fa-trash' })
                            )
                        )
                    )
            ),
            h('div', { className: 'cart-footer' },
                h('div', { className: 'cart-total-row' },
                    h('span', null, 'Total:'),
                    h('span', null, `$${totalCarrito.toLocaleString("es-CO")}`)
                ),
                h('div', { className: 'payment-selection-box' },
                    h('label', { className: 'payment-label' },
                        h('i', { className: 'fa-solid fa-wallet' }), ' Métodos de pago aceptados:'
                    ),
                    h('select', { className: 'payment-select', value: metodoPago, onChange: (e) => setMetodoPago(e.target.value) },
                        h('option', { value: 'Nequi' }, 'Nequi'),
                        h('option', { value: 'Daviplata o billeteras digitales' }, 'Daviplata / Billeteras digitales'),
                        h('option', { value: 'Efectivo' }, 'Efectivo')
                    )
                ),
                h('button', { className: 'primary-btn', onClick: procesarPedidoWhatsApp },
                    h('i', { className: 'fa-brands fa-whatsapp' }), ' Pedir por WhatsApp'
                )
            )
        )
    );
}

export default App;