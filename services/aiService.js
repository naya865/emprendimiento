// services/aiService.js - Generador inteligente local para N'ROSEN Studio
export const generarDescripcionConIA = async (nombre, categoria) => {
    if (!nombre) {
        throw new Error("Por favor ingresa primero el nombre del producto.");
    }

    // Simulamos un breve retraso para mantener la experiencia visual de carga ("generando...")
    await new Promise(resolve => setTimeout(resolve, 700));

    const cat = categoria ? categoria.toLowerCase() : "moda";

    // Opciones de descripciones elegantes, sofisticadas y atractivas para e-commerce
    const descripcionesExclusivas = [
        `Eleva tu estilo con ${nombre}, una pieza exclusiva de ${cat} diseñada para reflejar elegancia y sofisticación en cada ocasión. Confeccionada con acabados impecables que realzan tu feminidad y confort absoluto.`,
        `Descubre la versatilidad y el encanto de ${nombre}. Esta propuesta de ${cat} combina tendencias contemporáneas con un toque delicado y chic, perfecta para destacar con clase propia.`,
        `La definición perfecta de tendencia y comodidad: ${nombre}. Un diseño de ${cat} cuidadosamente pensado para brindarte un look distinguido, moderno y lleno de personalidad.`
    ];

    // Seleccionamos una descripción de manera dinámica basada en el nombre del producto
    const indice = nombre.length % descripcionesExclusivas.length;
    
    return descripcionesExclusivas[indice];
};