// Asegura que el script se ejecute una vez que todo el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // --- Variables Globales ---
    const vehiclesDataUrl = 'https://raw.githubusercontent.com/JUANCITOPENA/Pagina_Vehiculos_Ventas/refs/heads/main/vehiculos.json';
    let vehiclesData = []; // Almacenará todos los datos de los vehículos
    let cart = []; // Almacenará los ítems en el carrito
    let currentVehicleForQuantity = null; // Variable para almacenar el vehículo seleccionado antes de añadir al carrito

    // --- Referencias a elementos del DOM ---
    const productsContainer = document.getElementById('productsContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const searchInput = document.getElementById('searchInput');
    const cartCountSpan = document.getElementById('cartCount');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Modales de Bootstrap
    const quantityModal = new bootstrap.Modal(document.getElementById('quantityModal'));
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    const vehicleDetailModal = new bootstrap.Modal(document.getElementById('vehicleDetailModal'));

    // Elementos dentro del Modal de Cantidad
    const quantityInput = document.getElementById('quantityInput');
    const addToCartBtnInModal = document.getElementById('addToCartBtn');

    // Elementos dentro del Modal de Detalle
    const detailMarcaModelo = document.getElementById('detailMarcaModelo');
    const detailCategoria = document.getElementById('detailCategoria');
    const detailPrecio = document.getElementById('detailPrecio');
    const detailFeatures = document.getElementById('detailFeatures');
    const detailAddToCartBtn = document.getElementById('detailAddToCartBtn');
    const detailImageWrapper = document.getElementById('detailImageWrapper');
    let swiperInstance = null; // Para controlar la instancia de Swiper

    // Elementos dentro del Modal de Pago
    const processPaymentBtn = document.getElementById('processPaymentBtn');
    const paymentForm = document.getElementById('paymentForm');

    // --- Funciones de Carga de Datos y Renderizado ---

    /**
     * Carga los datos de los vehículos desde la URL JSON.
     * Muestra un spinner mientras carga y maneja errores.
     */
    const loadVehicles = async () => {
        loadingSpinner.classList.remove('d-none'); // Mostrar spinner
        try {
            const response = await fetch(vehiclesDataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            vehiclesData = await response.json();
            displayVehicles(vehiclesData); // Mostrar todos los vehículos al cargar
        } catch (error) {
            console.error('Error al cargar los vehículos:', error);
            productsContainer.innerHTML = `
                <div class="col-12 text-center text-danger">
                    <p>No se pudieron cargar los vehículos. Por favor, inténtalo de nuevo más tarde.</p>
                    <p>Detalle del error: ${error.message}</p>
                </div>
            `;
        } finally {
            loadingSpinner.classList.add('d-none'); // Ocultar spinner
        }
    };

    /**
     * Limpia el contenedor de productos y renderiza las tarjetas de vehículos.
     * @param {Array} vehicles - Array de objetos de vehículos a mostrar.
     */
    const displayVehicles = (vehicles) => {
        productsContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevas tarjetas

        if (vehicles.length === 0) {
            productsContainer.innerHTML = `
                <div class="col-12 text-center my-5">
                    <p class="lead text-muted">No se encontraron vehículos que coincidan con tu búsqueda.</p>
                </div>
            `;
            return;
        }

        vehicles.forEach(vehicle => {
            const cardCol = document.createElement('div');
            cardCol.className = 'col-lg-4 col-md-6 col-sm-12 mb-4'; // Clases para grid responsivo

            // Eliminar emojis del campo 'tipo' si existen
            const cleanTipo = vehicle.tipo ? vehicle.tipo.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() : '';

            cardCol.innerHTML = `
                <div class="card h-100">
                    <img src="${vehicle.imagen[0]}" class="card-img-top" alt="${vehicle.marca} ${vehicle.modelo}" loading="lazy" aria-label="Imagen del vehículo ${vehicle.marca} ${vehicle.modelo}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${vehicle.marca} ${vehicle.modelo}</h5>
                        <p class="card-text text-muted small">${vehicle.categoria} - ${cleanTipo}</p>
                        <p class="card-price mt-auto">${parseFloat(vehicle.precio_venta).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <button class="btn btn-info viewDetailsBtn" data-codigo="${vehicle.codigo}" aria-label="Ver detalles de ${vehicle.marca} ${vehicle.modelo}">
                                <i class="fas fa-eye me-1"></i> Detalles
                            </button>
                            <button class="btn btn-primary addToCartBtn" data-codigo="${vehicle.codigo}" aria-label="Añadir ${vehicle.marca} ${vehicle.modelo} al carrito">
                                <i class="fas fa-cart-plus me-1"></i> Añadir
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productsContainer.appendChild(cardCol);
        });
        // No se necesita llamar a addAddToCartListeners aquí porque usamos delegación de eventos.
    };

    /**
     * Muestra los detalles de un vehículo en un modal.
     * @param {object} vehicle - El objeto del vehículo a mostrar.
     */
    const showVehicleDetailModal = (vehicle) => {
        detailMarcaModelo.textContent = `${vehicle.marca} ${vehicle.modelo}`;
        detailCategoria.textContent = `Categoría: ${vehicle.categoria} - Tipo: ${vehicle.tipo.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()}`;
        detailPrecio.textContent = parseFloat(vehicle.precio_venta).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

        detailFeatures.innerHTML = `
            <li><i class="fas fa-palette"></i> Color: ${vehicle.color}</li>
            <li><i class="fas fa-calendar-alt"></i> Año: ${vehicle.año}</li>
            <li><i class="fas fa-tachometer-alt"></i> Kilometraje: ${vehicle.kilometraje.toLocaleString('es-ES')} km</li>
            <li><i class="fas fa-gas-pump"></i> Combustible: ${vehicle.combustible}</li>
            <li><i class="fas fa-cog"></i> Transmisión: ${vehicle.transmision}</li>
            <li><i class="fas fa-door-open"></i> Puertas: ${vehicle.puertas}</li>
            <li><i class="fas fa-weight-hanging"></i> Motor: ${vehicle.motor}</li>
            <li><i class="fas fa-road"></i> Origen: ${vehicle.pais_origen}</li>
            <li><i class="fas fa-user-circle"></i> Vendedor: ${vehicle.vendedor}</li>
        `;
        // Añadir descripción si existe
        if (vehicle.descripcion) {
            detailFeatures.innerHTML += `<li><i class="fas fa-info-circle"></i> Descripción: ${vehicle.descripcion}</li>`;
        }

        // Configurar el carrusel de imágenes
        detailImageWrapper.innerHTML = '';
        vehicle.imagen.forEach(imgUrl => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<img src="${imgUrl}" alt="Imagen del vehículo ${vehicle.marca} ${vehicle.modelo}">`;
            detailImageWrapper.appendChild(slide);
        });

        // Destruir la instancia anterior de Swiper si existe
        if (swiperInstance) {
            swiperInstance.destroy(true, true);
        }
        // Inicializar Swiper
        swiperInstance = new Swiper('#vehicleImageCarousel', {
            slidesPerView: 1,
            spaceBetween: 10,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
        });

        // Asignar el vehículo actual para el botón "Añadir al Carrito" del modal de detalle
        detailAddToCartBtn.onclick = () => {
            currentVehicleForQuantity = vehicle;
            quantityModal.show();
            vehicleDetailModal.hide(); // Ocultar el modal de detalle
        };

        vehicleDetailModal.show(); // Mostrar el modal de detalle
    };


    // --- Funciones de Filtrado ---

    /**
     * Filtra los vehículos basándose en el texto de búsqueda.
     */
    const filterVehicles = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filtered = vehiclesData.filter(vehicle =>
            vehicle.marca.toLowerCase().includes(searchTerm) ||
            vehicle.modelo.toLowerCase().includes(searchTerm) ||
            vehicle.categoria.toLowerCase().includes(searchTerm) ||
            vehicle.vendedor.toLowerCase().includes(searchTerm) ||
            vehicle.tipo.toLowerCase().replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim().includes(searchTerm)
        );
        displayVehicles(filtered);
    };

    // --- Funciones del Carrito de Compras ---

    /**
     * Muestra el modal de cantidad para un vehículo específico.
     * @param {object} vehicle - El objeto del vehículo seleccionado.
     */
    const showQuantityModal = (vehicle) => {
        currentVehicleForQuantity = vehicle; // Guardar el vehículo seleccionado
        quantityInput.value = 1; // Resetear la cantidad a 1
        quantityModal.show();
    };

    /**
     * Añade un ítem al carrito o actualiza su cantidad si ya existe.
     * @param {object} vehicle - El objeto del vehículo a añadir.
     * @param {number} quantity - La cantidad a añadir.
     */
    const addItemToCart = (vehicle, quantity) => {
        const existingItemIndex = cart.findIndex(item => item.codigo === vehicle.codigo);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                codigo: vehicle.codigo,
                marca: vehicle.marca,
                modelo: vehicle.modelo,
                precio: parseFloat(vehicle.precio_venta),
                imagen: vehicle.imagen[0], // Usar la primera imagen para el carrito
                quantity: quantity
            });
        }
        updateCartUI();
    };

    /**
     * Actualiza la interfaz de usuario del carrito (elementos, total, contador).
     */
    const updateCartUI = () => {
        cartItemsContainer.innerHTML = ''; // Limpiar el contenedor
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.classList.remove('d-none');
            checkoutBtn.disabled = true; // Deshabilitar botón de pago si el carrito está vacío
        } else {
            emptyCartMessage.classList.add('d-none');
            checkoutBtn.disabled = false; // Habilitar botón de pago
            cart.forEach(item => {
                const subtotal = item.precio * item.quantity;
                total += subtotal;

                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'list-group-item d-flex align-items-center mb-2';
                cartItemElement.innerHTML = `
                    <img src="${item.imagen}" class="cart-item-image me-3 rounded" alt="Imagen de ${item.marca} ${item.modelo}">
                    <div class="cart-item-details flex-grow-1">
                        <h6 class="mb-1">${item.marca} ${item.modelo}</h6>
                        <p class="mb-0 text-muted">Cantidad: ${item.quantity}</p>
                    </div>
                    <span class="cart-item-price">${subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                    <button class="btn btn-sm btn-danger ms-3 remove-item-btn" data-codigo="${item.codigo}" aria-label="Eliminar ${item.marca} ${item.modelo} del carrito">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }

        cartTotalSpan.textContent = total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
        cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0); // Sumar todas las cantidades
    };

    /**
     * Elimina un ítem del carrito.
     * @param {number} codigo - El código del vehículo a eliminar.
     */
    const removeItemFromCart = (codigo) => {
        cart = cart.filter(item => item.codigo !== codigo);
        updateCartUI();
    };

    // --- Funciones de Pago y Facturación ---

    /**
     * Simula el proceso de pago y genera una factura.
     */
    const processPayment = () => {
        // Validación básica del formulario
        if (!paymentForm.checkValidity()) {
            paymentForm.classList.add('was-validated');
            return;
        }

        // Obtener datos del formulario de pago (simplificado)
        const customerName = document.getElementById('fullName').value;
        const customerEmail = document.getElementById('email').value;

        // Simular un procesamiento de pago
        console.log('Procesando pago...');
        // Aquí iría la lógica real de pasarela de pago

        alert('¡Pago exitoso! Se ha generado tu factura.');
        generateInvoice(customerName, customerEmail); // Generar la factura
        cart = []; // Vaciar el carrito
        updateCartUI(); // Actualizar la UI del carrito
        paymentModal.hide(); // Ocultar modal de pago
        cartModal.hide(); // Ocultar modal del carrito
        paymentForm.reset(); // Limpiar el formulario de pago
        paymentForm.classList.remove('was-validated'); // Quitar clases de validación
    };

    /**
     * Genera un PDF con los detalles de la factura.
     * Requiere la librería jsPDF.
     */
    const generateInvoice = (customerName, customerEmail) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Título
        doc.setFontSize(24);
        doc.text("Factura de Compra - GarageOnline", 105, 20, null, null, "center");

        // Información del cliente
        doc.setFontSize(12);
        doc.text(`Cliente: ${customerName}`, 20, 40);
        doc.text(`Email: ${customerEmail}`, 20, 47);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 54);
        doc.text(`ID de Transacción: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 20, 61);

        doc.line(20, 68, 190, 68); // Línea separadora

        // Detalles de los ítems del carrito
        doc.setFontSize(14);
        doc.text("Detalles de la Compra:", 20, 78);

        let y = 88; // Posición inicial Y para los ítems
        doc.setFontSize(10);
        doc.text("Marca y Modelo", 20, y);
        doc.text("Cant.", 100, y);
        doc.text("Precio Unitario", 120, y);
        doc.text("Subtotal", 170, y);
        y += 7;
        doc.line(20, y, 190, y); // Línea bajo los encabezados
        y += 7;

        let totalAmount = 0;
        cart.forEach(item => {
            const subtotal = item.precio * item.quantity;
            totalAmount += subtotal;
            doc.text(`${item.marca} ${item.modelo}`, 20, y);
            doc.text(item.quantity.toString(), 100, y);
            doc.text(item.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }), 120, y);
            doc.text(subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }), 170, y);
            y += 7;
        });

        y += 5;
        doc.line(20, y, 190, y); // Línea antes del total

        // Total
        y += 10;
        doc.setFontSize(14);
        doc.text(`Total a Pagar: ${totalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`, 170, y, null, null, "right");

        // Mensaje de agradecimiento
        y += 20;
        doc.setFontSize(10);
        doc.text("¡Gracias por tu compra en GarageOnline!", 105, y, null, null, "center");
        doc.text("Esperamos verte de nuevo pronto.", 105, y + 7, null, null, "center");

        doc.save(`factura-garageonline-${Date.now()}.pdf`);
    };

    // --- Event Listeners ---

    // Evento para filtrar vehículos al escribir en la barra de búsqueda
    searchInput.addEventListener('input', filterVehicles);

    // Delegación de eventos para los botones "Añadir al Carrito" y "Ver Detalles"
    // Esto es más eficiente que añadir un listener a cada botón individualmente.
    productsContainer.addEventListener('click', (event) => {
        const target = event.target;
        // Botón "Añadir al Carrito"
        if (target.closest('.addToCartBtn')) {
            const btn = target.closest('.addToCartBtn');
            const vehicleCode = parseInt(btn.dataset.codigo);
            const vehicle = vehiclesData.find(v => v.codigo === vehicleCode);
            if (vehicle) {
                showQuantityModal(vehicle);
            }
        }
        // Botón "Ver Detalles"
        if (target.closest('.viewDetailsBtn')) {
            const btn = target.closest('.viewDetailsBtn');
            const vehicleCode = parseInt(btn.dataset.codigo);
            const vehicle = vehiclesData.find(v => v.codigo === vehicleCode);
            if (vehicle) {
                showVehicleDetailModal(vehicle);
            }
        }
    });

    // Event listener para el botón "Añadir al Carrito" dentro del modal de cantidad
    addToCartBtnInModal.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        if (quantity > 0 && currentVehicleForQuantity) {
            addItemToCart(currentVehicleForQuantity, quantity);
            quantityModal.hide();
        } else {
            alert('Por favor, ingresa una cantidad válida (mayor que 0).');
        }
    });

    // Event listener para eliminar ítems del carrito
    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target.closest('.remove-item-btn')) {
            const btn = event.target.closest('.remove-item-btn');
            const vehicleCode = parseInt(btn.dataset.codigo);
            removeItemFromCart(vehicleCode);
        }
    });

    // Event listener para el botón "Procesar Pago"
    processPaymentBtn.addEventListener('click', processPayment);

    // Inicializar el carrito y cargar los vehículos al inicio
    updateCartUI(); // Asegura que el contador del carrito se inicialice a 0
    loadVehicles(); // Carga los vehículos

    // Validación y feedback en el formulario de pago
    paymentForm.addEventListener('submit', (event) => {
        if (!paymentForm.checkValidity()) {
            event.preventDefault(); // Evita el envío si hay errores
            event.stopPropagation();
        }
        paymentForm.classList.add('was-validated'); // Muestra los estilos de validación de Bootstrap
    }, false);
});
