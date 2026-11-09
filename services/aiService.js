// services/aiService.js
export const generarDescripcionConIA = async (nombre, categoria) => {
    if (!nombre) {
        throw new Error("Por favor ingresa primero el nombre del producto.");
    }

    const promptText = `Escribe una descripción corta, elegante, seductora y atractiva para la venta en e-commerce de un producto de moda femenina de la marca N'ROSEN Studio. 
    Producto: "${nombre}". 
    Categoría: "${categoria}". 
    Responde solo con la descripción en español, en 2 o 3 frases cautivadoras, sin comillas ni texto adicional.`;

    // Pega aquí la clave exacta que te aparece en la imagen (la que empieza por AQ...)
    const API_KEY = "AQ.Ab8RN6IaZdFY8qrs3VzjInELP3rPKqB6XQfQD0vA0zESQTNGw";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
        })
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error?.message || "Error al conectar con la IA.");
    }

    const textoGenerado = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textoGenerado) {
        throw new Error("No se pudo obtener la descripción de la IA.");
    }

    return textoGenerado.trim();
};