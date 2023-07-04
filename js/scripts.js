/*!
* Start Bootstrap - Creative v7.0.7 (https://startbootstrap.com/theme/creative)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
/*
    // Activate SimpleLightbox plugin for portfolio items
    new SimpleLightbox({
        elements: '#portfolio a.portfolio-box'
    });
*/
});


function seleccionarArchivos() {
    // Crea un elemento input de tipo "file"
    var input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; // Permite seleccionar múltiples archivos

    // Añade un evento para manejar la selección de archivos
    input.onchange = function(e) {
      var files = e.target.files; // Obtiene los archivos seleccionados
      console.log(files); // Puedes hacer algo con los archivos aquí

      // Aquí puedes llamar a otra función y pasarle los archivos como parámetro
      procesarArchivos(files);
    };

    // Haz clic en el elemento de entrada de archivos oculto
    input.click();
  }

  function procesarArchivos(files) {
    // Aquí puedes hacer algo con los archivos seleccionados
    console.log('Archivos seleccionados:', files);
  }
