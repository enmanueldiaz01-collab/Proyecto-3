document.addEventListener('DOMContentLoaded', () => {
    const quantityModal = document.getElementById('quantityModal');
    const closeButton = document.querySelector('.modal .close-button');
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const scrollToVehiclesBtn = document.querySelector('.scroll-to-vehicles');

    // Función para abrir el modal
    function openModal() {
        quantityModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evitar desplazamiento del cuerpo cuando el modal está abierto
    }

    // Función para cerrar el modal
    function closeModal() {
        quantityModal.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar el desplazamiento del cuerpo
    }

    // Event listeners para abrir el modal
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Prevenir el comportamiento predeterminado del enlace
            openModal();
            // En una aplicación real, se obtendría y se rellenaría el contenido del modal aquí
            // basado en el ID del vehículo de la tarjeta clicada.
            // Por ahora, solo abre el modal estático.
        });
    });

    // Event listener para cerrar el modal
    closeButton.addEventListener('click', closeModal);

    // Cerrar el modal si se hace clic fuera del contenido del modal
    window.addEventListener('click', (event) => {
        if (event.target === quantityModal) {
            closeModal();
        }
    });

    // Opcional: Ejemplo para una simple actualización del contador del carrito (no directamente de la imagen, pero común)
    const cartCountElement = document.querySelector('.cart-count');
    let cartCount = 1; // Comenzando con 1 como en la imagen

    if (cartCountElement) {
        cartCountElement.parentElement.addEventListener('click', () => {
            cartCount++;
            cartCountElement.textContent = cartCount;
            console.log(`Carrito actualizado: ${cartCount} artículos`);
        });
    }

    // --- Funcionalidad de desplazamiento suave para los enlaces de navegación ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el comportamiento predeterminado del ancla
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Elimina la clase 'active' de todos los enlaces
                navLinks.forEach(nav => nav.classList.remove('active'));
                // Añade la clase 'active' al enlace clicado
                link.classList.add('active');

                // Desplazamiento suave
                window.scrollTo({
                    top: targetSection.offsetTop - 120, // Ajusta el desplazamiento para el navbar y sticky nav
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Funcionalidad para el botón "Ver vehículos" del hero ---
    if (scrollToVehiclesBtn) {
        scrollToVehiclesBtn.addEventListener('click', () => {
            const vehiclesSection = document.getElementById('vehiculos');
            if (vehiclesSection) {
                window.scrollTo({
                    top: vehiclesSection.offsetTop - 120, // Ajusta el desplazamiento
                    behavior: 'smooth'
                });
                // Actualizar el estado activo del enlace de navegación si es necesario
                navLinks.forEach(nav => {
                    nav.classList.remove('active');
                    if (nav.getAttribute('href') === '#vehiculos') {
                        nav.classList.add('active');
                    }
                });
            }
        });
    }

    // --- Resaltar el enlace de navegación activo al desplazarse ---
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 150; // Ajuste para la altura del navbar/sticky nav

        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
});