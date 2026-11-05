// ==========================================
// N'ROSEN STUDIO - SCRIPT PRINCIPAL (FIREBASE + REACT)
// ==========================================

// Configuración de Firebase (asegúrate de que tus credenciales estén aquí si usas SDK modular o clásico)
// Si estás usando los scripts globales en el index.html, inicializamos Firestore así:
const db = firebase.firestore();

// Componente Principal de la Tienda
function App() {
  const [productos, setProductos] = React.useState([]);
  const [cargando, setCargando] = React.useState(true);
  const [vistaAdmin, setVistaAdmin] = React.useState(false);

  // Formulario de nuevo producto
  const [nuevoNombre, setNuevoNombre] = React.useState("");
  const [nuevoPrecio, setNuevoPrecio] = React.useState("");
  const [nuevaCategoria, setNuevaCategoria] = React.useState("");
  const [nuevaImagen, setNuevaImagen] = React.useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = React.useState("");

  // Cargar productos desde Firestore de forma segura al iniciar
  React.useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const querySnapshot = await db.collection("productos").get();
        const listaProductos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(p => p.nombre && p.precio !== undefined); // Filtra documentos vacíos o incompletos

        setProductos(listaProductos);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, []);

  // Función para guardar un producto nuevo en Firestore
  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoPrecio) {
      alert("Por favor completa al menos el nombre y el precio.");
      return;
    }

    try {
      const productoData = {
        nombre: nuevoNombre,
        precio: Number(nuevoPrecio),
        categoria: nuevaCategoria || "General",
        imagen: nuevaImagen || "",
        descripcion: nuevaDescripcion || "",
        creadoEn: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection("productos").add(productoData);
      
      // Actualizar estado local para reflejarlo inmediatamente sin recargar
      setProductos([...productos, { id: docRef.id, ...productoData }]);
      
      // Limpiar formulario
      setNuevoNombre("");
      setNuevoPrecio("");
      setNuevaCategoria("");
      setNuevaImagen("");
      setNuevaDescripcion("");
      setVistaAdmin(false);

      alert("¡Producto guardado con éxito en la nube!");
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      alert("Hubo un error al guardar el producto en Firebase.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A4A4A] font-sans">
      {/* Cabecera / Navegación */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-[#EFECE6] bg-white shadow-sm">
        <h1 className="text-2xl font-serif tracking-wider text-[#D4A373]">N'ROSEN Studio</h1>
        <button 
          onClick={() => setVistaAdmin(!vistaAdmin)}
          className="px-4 py-2 text-sm bg-[#E6CCB2] text-white rounded-md hover:D4A373 transition"
        >
          {vistaAdmin ? "Ver Tienda" : "Panel Admin"}
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {vistaAdmin ? (
          /* Panel de Administración para agregar productos */
          <section className="bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto border border-[#EFECE6]">
            <h2 className="text-xl font-serif mb-4 text-[#8C7A6B]">Agregar Nuevo Producto</h2>
            <form onSubmit={handleGuardarProducto} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nombre de la prenda</label>
                <input 
                  type="text" 
                  value={nuevoNombre} 
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full p-2 border rounded-md border-[#DCD7CD]"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Precio ($)</label>
                <input 
                  type="number" 
                  value={nuevoPrecio} 
                  onChange={(e) => setNuevoPrecio(e.target.value)}
                  className="w-full p-2 border rounded-md border-[#DCD7CD]"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Categoría</label>
                <input 
                  type="text" 
                  value={nuevaCategoria} 
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className="w-full p-2 border rounded-md border-[#DCD7CD]" 
                />
              </div>
              <div>
                <label className="block text-sm mb-1">URL de la Imagen</label>
                <input 
                  type="url" 
                  value={nuevaImagen} 
                  onChange={(e) => setNuevaImagen(e.target.value)}
                  className="w-full p-2 border rounded-md border-[#DCD7CD]" 
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Descripción</label>
                <textarea 
                  value={nuevaDescripcion} 
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  className="w-full p-2 border rounded-md border-[#DCD7CD]" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-2 bg-[#D4A373] text-white font-medium rounded-md hover:bg-[#BC6C25] transition"
              >
                Guardar en la Nube
              </button>
            </form>
          </section>
        ) : (
          /* Catálogo de Productos */
          <section>
            <h2 className="text-3xl font-serif text-center mb-8 text-[#8C7A6B]">Colección Exclusiva</h2>
            {cargando ? (
              <p className="text-center text-gray-500">Cargando productos desde la nube...</p>
            ) : productos.length === 0 ? (
              <p className="text-center text-gray-500">No hay productos registrados todavía. Agrega uno desde el Panel Admin.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {productos.map((producto) => (
                  <div key={producto.id} className="bg-white border border-[#EFECE6] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                    <img 
                      src={producto.imagen || "https://via.placeholder.com/300"} 
                      alt={producto.nombre} 
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4">
                      <span className="text-xs tracking-widest text-[#D4A373] uppercase">{producto.categoria}</span>
                      <h3 className="text-lg font-medium mt-1">{producto.nombre}</h3>
                      <p className="text-sm text-gray-500 mt-1">{producto.descripcion}</p>
                      {/* Formato de precio blindado para evitar errores si es indefinido */}
                      <p className="text-lg font-semibold mt-4 text-[#4A4A4A]">
                        ${Number(producto.precio || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// Renderizar la aplicación en el DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);