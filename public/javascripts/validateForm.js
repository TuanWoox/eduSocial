(() => {
    'use strict'

    const forms = document.querySelectorAll('.validated-form')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            console.log('Form submitted'); // Debug log
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                console.log('Form is invalid'); // Debug log
            }
            form.classList.add('was-validated');
        }, false);
    })
})();
