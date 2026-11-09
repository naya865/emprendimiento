// emailService.js

// Inicializamos EmailJS con tu Public Key
if (window.emailjs) {
    window.emailjs.init({
        publicKey: "d7wpulaVRqCiLsCLE",
    });
}

/**
 * Función centralizada para enviar el correo de confirmación de pedido
 */
export const enviarCorreoPedido = async (cliente, carrito, totalCarrito, metodoPago) => {
    const templateParams = {
        cliente_nombre: cliente.nombre,
        cliente_email: cliente.email,
        cliente_telefono: cliente.telefono,
        detalles_pedido: carrito
            .map(i => `${i.nombre} (Talla: ${i.talla}) x${i.cantidad} - $${(i.precio * i.cantidad).toLocaleString("es-CO")}`)
            .join("\n"),
        total: `$${totalCarrito.toLocaleString("es-CO")}`,
        metodo_pago: metodoPago
    };

    return window.emailjs.send(
        "service_09o9b47",
        "template_s5zurve",
        templateParams,
        "yiwylgGQuoMhGTFLS"
    );
};