var instancia = null;

function driveImage(id){
    return 'https://drive.google.com/uc?export=download&id=' + id;
}

function preloadAnimation(animacion){

    animacion.forEach(frame => {
        var img = new Image();
        const src = driveImage(frame.imagen);
        img.src = src;
        const preloader =  document.getElementById("img-preloader");
        preloader.appendChild(img);
    });

}

function emptyModal(){
    document.getElementById("modal-header-content").innerHTML = '';
    document.getElementById("modal-header-title").innerHTML = '';
    document.getElementById("modal-content").innerHTML = '';
    document.getElementById("modal-footer").innerHTML = '';
    document.getElementById("canvas-container").style.display = 'none';
}

function creaBotonSiguiente(){

    const footer = document.getElementById("modal-footer");
    const siguiente = document.createElement('button');
    siguiente.setAttribute("class", "btn btn-primary btn-xl");
    siguiente.id = "siguiente";
    siguiente.textContent = "Siguiente";
    footer.appendChild(siguiente);

}

function getCookieValue(cookieName) {
    var cookiePairs = document.cookie.split('; ').map(cookie => cookie.split('='));
    var cookie = cookiePairs.find(pair => pair[0] === cookieName);
    if (cookie) {
        var cookieValue = cookie[1];
        var expires = cookiePairs.find(pair => pair[0] === 'expires');
        if (expires) {
            var expirationDate = new Date(expires[1]);
            var currentDate = new Date();
            if (expirationDate <= currentDate) {
                return null; // La cookie ha expirado, devolvemos null
            }
        }
        return cookieValue; // Devolvemos el valor de la cookie
    }
    return null; // La cookie no se encontró
}

function setCookie(name, value, hours) {
    var name = encodeURIComponent(name) + "=";
    var value = encodeURIComponent(value) + ";";
    var date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    var exp = "expires=" + date.toUTCString()+";";
    var path = "path=" + "/";
    document.cookie = name  + value + exp + path;
}

async function httpFetch(uri, method) {
    var auth = getCookieValue("auth");
    var expires = getCookieValue("expires");

    const response = await fetch(uri, {
        method: method,
        headers: {
            'EXPIRES': expires,
            'AUTH': auth
        },
        mode: 'cors',
        cache: 'default'
    });

    const data = await response;
    return data.json();
}

function login(){
    document.getElementById('login-form').addEventListener('submit', function(e) {

        e.preventDefault(); // Evita que el formulario se envíe automáticamente
        
        // Obtén los valores del formulario
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
    
        // Crear una instancia de XMLHttpRequest
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://api.local/login', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        // Manipular la respuesta del servidor
        xhr.onreadystatechange = async function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {

                    setCookie('auth', xhr.getResponseHeader('auth'), 1);
                    setCookie('expires', xhr.getResponseHeader('exp'), 1);
                    type = xhr.getResponseHeader('type');
                    setCookie('type', type, 1);

                    response = await httpFetch("http://api.local/" + type, "GET");

                    if (response.status === 200) {

                        data = response.result;

                        if(data){

                            if(instancia==null) instancia = new Cuenta(type, data);
                        
                            document.getElementById('login-container').style.display = 'none';

                        }

                    }

                } else {

                    alert("No ha sido posible verificar tus credenciales.");

                }
            }
        };
        
        // Enviar la solicitud con los datos del formulario
        xhr.send('username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password));

  });
}

async function load(){

    // Dá funcionalidad al formulario de login
    login();

    type = getCookieValue("type");
    auth = getCookieValue("auth");
    expires = getCookieValue("expires");

    if(type == null || auth == null || expires == null){

        // Abre la ventana de login
        openLogin();
        
    } else {

        var response = await httpFetch('http://api.local/' + type, 'GET');

        var status = response.status;

        data = response.result;

        if(status === 200) {

            if(instancia==null) instancia = new Cuenta(type, data);

            // Carga cosas de usuario
            document.getElementById('login-container').style.display = 'none';
            
        } else {
            
            // Abre la ventana de login
            openLogin();

        }

    }
    
}

async function openLogin(){

    document.getElementById('login-container').style.display = 'block';
    document.getElementById('loader').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';

}

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


document.addEventListener('DOMContentLoaded', function() {

    load();

});

function countdown(countdowns){
    // Recorrer todos los elementos y generar la cuenta regresiva
    for (var i = 0; i < countdowns.length; i++) {
    var countdown = countdowns[i];
    var targetDate = countdown.getAttribute("target-date");

    // Convertir la fecha objetivo en milisegundos
    var targetTime = new Date(targetDate).getTime();

    // Actualizar la cuenta regresiva cada segundo
    setInterval(function() {
        // Obtener la fecha y hora actual
        var now = new Date().getTime();

        // Calcular la diferencia entre la fecha objetivo y la fecha actual
        var difference = targetTime - now;

        // Calcular los días, horas, minutos y segundos restantes
        var days = Math.floor(difference / (1000 * 60 * 60 * 24));
        var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Actualizar el contenido del elemento con la cuenta regresiva
        countdown.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s";
    }, 1000);
    }
}

function toggleCanvas(){
    var ventana = document.getElementById("canvas-container");
    if (ventana.style.display === "none") {
      ventana.style.display = "block";
    } else {
      ventana.style.display = "none";
    }
}

function toggleModal(bloque) {
  var ventana = document.getElementById("modal-window");
  if (ventana.style.display === "none") {
    if(ventana.content != bloque){

    }
    ventana.style.display = "block";
  } else {
    ventana.style.display = "none";
  }
}

function deleteCookie(cookieName) {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

class Cuenta{

    _type;

    _usuario;

    _data;

    constructor(type, data){
        this._type = type;
        this._data = data;
        switch (type) {
            case 'alumno':
                this.innitAlumno();
                break;
            case 'profesor':
                this.innitProfesor();
                break;
            default:
                console.error('Tipo de usuario no válido.');
                break;
        }
    }

    innitAlumno(){
        this._usuario = new Alumno(data.nombre, data.tiempoLimite, data.escenasIntroductorias, data.bloques, data.puntos, data.ranking);
        this.innitName();
    }

    innitProfesor(){
        this._usuario = new Profesor(data.nombreUsuario);
        this.innitName();
    }

    getType(){
        return this._type;
    }

    innitName(){
        // Crear el elemento <li> con la clase "nav-item"
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';

        // Crear el elemento <span> con la clase "username"
        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'username';
        usernameSpan.textContent = data.nombre + ' ( ';

        // Crear el elemento <a> con la clase "logout" y el texto "cerrar sesión"
        const logoutLink = document.createElement('a');
        logoutLink.className = 'logout';
        logoutLink.textContent = 'cerrar sesión';
        logoutLink.addEventListener('click', this.logout);

        // Agregar el elemento <a> como hijo del elemento <span>
        usernameSpan.appendChild(logoutLink);

        // Crear un nodo de texto para el paréntesis de cierre
        const closingParenthesis = document.createTextNode(')');

        // Agregar el nodo de texto como hijo adicional del elemento <span>
        usernameSpan.appendChild(closingParenthesis);

        // Agregar el elemento <span> como hijo del elemento <li>
        listItem.appendChild(usernameSpan);

        // Ahora puedes agregar el elemento <li> a algún elemento existente en tu página.
        // Por ejemplo, supongamos que tienes un elemento con el id "navbar":
        const navbar = document.getElementById('mainmenu');
        navbar.appendChild(listItem);
    }

    logout(){

        deleteCookie('auth');
        deleteCookie('expires');
        deleteCookie('type');

        document.querySelector('header').remove();

        document.getElementById('about').remove();

        document.getElementById('services').remove();

        document.getElementById('portfolio').remove();

        document.getElementById('mainmenu').innerHTML = '';

        document.getElementById('username').value = "";

        document.getElementById('password').value = "";

        document.getElementById('login-container').style.display = 'block';
        
        instancia = null;

        // Carga login
        openLogin();

    }

}

class Usuario {
    _nombre;
  
    constructor(nombre) {
      this._nombre = nombre;
    }
  
    get nombre() {
      return this._nombre;
    }

}

class Profesor extends Usuario{

    constructor(nombre){
        super(nombre);
    }

}

class Alumno extends Usuario{

    _puntos;

    _tiempoLimite;

    _introduccion;

    _bloques;

    _ranking;

    constructor(nombre, tiempoLimite, intro, bloques, puntos, ranking) {
        super(nombre);
        this._puntos = puntos;
        this._tiempoLimite = tiempoLimite;
        this._introduccion = intro;
        this._bloques = new Map();
        this.innitAlumno(bloques, ranking);
    }

    innitAlumno(bloques, ranking){
        this.innitNavegacion();
        this.generaPortadaPágina();
        this.generaManuales();
        this.generaRanking(ranking);
        this.generaBloques();
        this.innitBloques(bloques);

        // Obtener todos los elementos con la clase 'countdown'
        var countdowns = document.getElementsByClassName("countdown");
        if(countdowns!=null) {
            countdown(countdowns);
        }
    }

    generaPortadaPágina(){
        // Crear el elemento <header> con la clase "masthead"
        var header = document.createElement('header');
        header.className = 'masthead';

        // Crear el elemento <div> con la clase "container px-4 px-lg-5 h-100"
        var containerDiv = document.createElement('div');
        containerDiv.className = 'container px-4 px-lg-5 h-100';

        // Crear el elemento <div> con la clase "row gx-4 gx-lg-5 h-100 align-items-center justify-content-center text-center"
        var rowDiv = document.createElement('div');
        rowDiv.className = 'row gx-4 gx-lg-5 h-100 align-items-center justify-content-center text-center';

        // Crear el primer <div> con la clase "col-lg-8 align-self-end"
        var col1Div = document.createElement('div');
        col1Div.className = 'col-lg-8 align-self-end';

        // Crear el elemento <h1> con la clase "text-white font-weight-bold" y su texto
        var heading = document.createElement('h1');
        heading.className = 'text-white font-weight-bold';
        heading.textContent = 'Scape Earth';

        // Crear el elemento <hr> con la clase "divider"
        var hr = document.createElement('hr');
        hr.className = 'divider';

        // Añadir el <h1> y el <hr> al primer <div> (col1Div)
        col1Div.appendChild(heading);
        col1Div.appendChild(hr);

        // Crear el segundo <div> con la clase "col-lg-8 align-self-baseline"
        var col2Div = document.createElement('div');
        col2Div.className = 'col-lg-8 align-self-baseline';

        // Crear el primer <p> con la clase "text-white-75 mb-5" y su texto
        var paragraph1 = document.createElement('p');
        paragraph1.className = 'text-white-75 mb-5';
        paragraph1.textContent = 'A la tierra le quedan:';

        // Crear el segundo <p> con la clase "text-white-75 mb-5 countdown" y el atributo "target-date"
        var paragraph2 = document.createElement('p');
        paragraph2.className = 'text-white-75 mb-5 countdown';
        paragraph2.setAttribute('target-date', this._tiempoLimite);

        // Crear el elemento <a> con las clases "btn btn-primary btn-xl" y el atributo "href"
        var link = document.createElement('a');
        link.className = 'btn btn-primary btn-xl';
        link.textContent = 'Ver misión principal';
        link.addEventListener('click', this.intro.bind(this));

        // Añadir los elementos <p> y <a> al segundo <div> (col2Div)
        col2Div.appendChild(paragraph1);
        col2Div.appendChild(paragraph2);
        col2Div.appendChild(link);

        // Añadir los dos <div> al <div> con la clase "row" (rowDiv)
        rowDiv.appendChild(col1Div);
        rowDiv.appendChild(col2Div);

        // Añadir el <div> con la clase "row" al <div> con la clase "container"
        containerDiv.appendChild(rowDiv);

        // Añadir el <div> con la clase "container" al <header>
        header.appendChild(containerDiv);

        //inserta el contenedor antes del footer
        document.body.insertBefore(header, document.querySelector('footer'));
    }

    generaRanking(ranking){
        this._ranking = new Ranking(ranking);
    }

    generaManuales(){

        // Crear el elemento <section> y asignarle las clases y el id
        var section = document.createElement("section");
        section.setAttribute("class", "page-section bg-primary");
        section.setAttribute("id", "about");

        // Crear el elemento <div> y asignarle la clase y los estilos
        var container = document.createElement("div");
        container.setAttribute("class", "container px-4 px-lg-5");

        // Crear el elemento <div> y asignarle la clase y los estilos
        var row = document.createElement("div");
        row.setAttribute("class", "row gx-4 gx-lg-5 justify-content-center");

        // Crear el primer <div> con la clase y los estilos
        var col1 = document.createElement("div");
        col1.setAttribute("class", "col-lg-8");
        col1.setAttribute("style", "margin-bottom: 5rem!important;");


        // Crear el elemento <div> con clase "sliderst"
        var sliderDiv = document.createElement("div");
        sliderDiv.className = "sliderst";

        // Crear el elemento <div> con clase "containercube"
        var containercubeDiv = document.createElement("div");
        containercubeDiv.className = "containercube";

        // Crear los tres elementos <div> con clases "slidest x", "slidest y", "slidest z"
        var slidestDiv1 = document.createElement("div");
        slidestDiv1.className = "slidest x";
        var slidestDiv2 = document.createElement("div");
        slidestDiv2.className = "slidest y";
        var slidestDiv3 = document.createElement("div");
        slidestDiv3.className = "slidest z";

        // Agregar los elementos <div> de "slidest" al elemento <div> "containercube"
        containercubeDiv.appendChild(slidestDiv1);
        containercubeDiv.appendChild(slidestDiv2);
        containercubeDiv.appendChild(slidestDiv3);

        // Crear el elemento <div> con clase "shadow"
        var shadowDiv = document.createElement("div");
        shadowDiv.className = "shadow";

        // Agregar los elementos <div> de "containercube" y "shadow" al elemento <div> "sliderst"
        sliderDiv.appendChild(containercubeDiv);
        sliderDiv.appendChild(shadowDiv);

        // Crear el segundo <div> con la clase
        var col2 = document.createElement("div");
        col2.setAttribute("class", "col-lg-8 text-center");

        // Crear el elemento <h2> y asignarle las clases y el texto
        var heading = document.createElement("h2");
        heading.setAttribute("class", "text-white mt-0");
        heading.textContent = "Manuales de ingeniería espacial";

        // Crear el elemento <hr> y asignarle las clases
        var divider = document.createElement("hr");
        divider.setAttribute("class", "divider divider-light");

        // Crear el elemento <p> y asignarle las clases y el texto
        var paragraph = document.createElement("p");
        paragraph.setAttribute("class", "text-white-75 mb-4");
        paragraph.textContent = "Para completar tus misiones quizás necesites estos manuales de ingeniería espacial";

        // Crear el elemento <a> y asignarle las clases, el atributo href y el texto
        var link = document.createElement("a");
        link.setAttribute("class", "btn btn-light btn-xl");
        link.setAttribute("target", "_blank");
        link.setAttribute("href", "https://drive.google.com/drive/folders/1q8ZJufSyXuEzBjXcnqdBHyj2G9tX8um_");
        link.textContent = "Consultar manuales";

        // Añadir los elementos creados al árbol DOM
        col1.appendChild(sliderDiv);
        col2.appendChild(heading);
        col2.appendChild(divider);
        col2.appendChild(paragraph);
        col2.appendChild(link);
        row.appendChild(col1);
        row.appendChild(col2);
        container.appendChild(row);
        section.appendChild(container);

        // Agregar la sección generada al body
        document.body.insertBefore(section, document.querySelector('footer'));

    }

    generaBloques(){

        // Crear el elemento <div> con la clase "container-fluid p-0"
        const contenedor = document.createElement('section');
        contenedor.id = 'portfolio';

        contenedor.innerHTML = '';

        // Crear el elemento <div> con la clase "container-fluid p-0"
        const containerDiv = document.createElement('div');
        containerDiv.className = 'container-fluid p-0';

        // Crear el elemento <div> con el id "bloques" y la clase "row g-0"
        const bloquesDiv = document.createElement('div');
        bloquesDiv.id = 'bloques';
        bloquesDiv.className = 'row g-0';

        // Agregar el elemento <div> "bloques" como hijo del elemento <div> "container-fluid"
        containerDiv.appendChild(bloquesDiv);

        // Agregar el elemento <div> "container-fluid" al contenedor
        contenedor.appendChild(containerDiv);

        //inserta el contenedor antes del footer
        document.body.insertBefore(contenedor, document.querySelector('footer'));

        //iniciar el contenido dentro de la ventana modal
        this.innitModal();

    }

    innitNavegacion(){
        
        this.creaLinkNav('about', 'Manuales');
        this.creaLinkNav('services', 'Ranking');
        this.creaLinkNav('portfolio', 'Misiones');

    }

    creaLinkNav(idAlCualDesplaza, texto){
        const contenedor = document.getElementById('mainmenu');
        
        // Crear el elemento <div> principal con la clase "container px-4 px-lg-5"
        var ranking = document.createElement('li');
        ranking.className = 'nav-item';

        var rankingLink = document.createElement('a');
        rankingLink.className = 'nav-link';
        rankingLink.href = '#' + idAlCualDesplaza;
        rankingLink.innerText = texto;

        ranking.appendChild(rankingLink);

        contenedor.appendChild(ranking);
    }

    innitBloques(bloques){
        for (var i = 0; i < bloques.length; i++) {
            var bloque = bloques[i];
            this._bloques.set((i+1), new Bloque(bloque.codigo, (i+1), bloque.nombre, bloque.portada, bloque.progreso, bloque.actividades));
        }
    }

    innitModal(){
        // Crear el elemento <div> principal con el id "modal-window"
        const modalWindow = document.getElementById("modal-window");

        // Crear el elemento <div> con el id "modal-container"
        const modalContainer = document.createElement("div");
        modalContainer.setAttribute("id", "modal-container");

        // Crear el elemento <div> con el id "modal-body"
        const modalBody = document.createElement("div");
        modalBody.setAttribute("id", "modal-body");

        // Crear el elemento <div> con el id "modal-header"
        const modalHeader = document.createElement("div");
        modalHeader.setAttribute("id", "modal-header");

        // Crear el elemento <div> con el id "modal-header-content"
        const modalHeaderContent = document.createElement("div");
        modalHeaderContent.setAttribute("id", "modal-header-content");
   
        modalHeader.appendChild(modalHeaderContent);

        // Crea el elemento <div> con el id "modal-title"
        const modalHeaderTitleDiv = document.createElement("div");
        modalHeaderTitleDiv.setAttribute("id", "modal-header-title");

        modalHeader.appendChild(modalHeaderTitleDiv);

        // Crear el elemento <div> con el id "close-modal"
        const closeModal = document.createElement("div");
        closeModal.setAttribute("id", "close-modal");

        // Crear el elemento <p> dentro de "close-modal"
        const closeParagraph = document.createElement("p");
        closeParagraph.setAttribute("onclick", "toggleModal('modal-window')");
        closeParagraph.textContent = "X";
        closeModal.appendChild(closeParagraph);

        modalHeader.appendChild(closeModal);

        modalBody.appendChild(modalHeader);

        // Crear el elemento <div> con el id "modal-content"
        const modalContent = document.createElement("div");
        modalContent.setAttribute("id", "modal-content");

        // Crear el elemento <div> con el id "canvas-container" y el estilo "display: none"
        const canvasContainer = document.createElement("div");
        canvasContainer.setAttribute("id", "canvas-container");
        canvasContainer.style.display = "none";

        // Crear el elemento <div> con el id "canvas-header"
        const canvasHeader = document.createElement("div");
        canvasHeader.setAttribute("id", "canvas-header");

        // Crear el botón dentro de "canvas-header"
        const clearButton = document.createElement("button");
        clearButton.setAttribute("class", "btn btn-primary btn-xl");
        clearButton.setAttribute("onclick", "fill('white')");
        clearButton.textContent = "Limpiar lienzo";
        canvasHeader.appendChild(clearButton);

        canvasContainer.appendChild(canvasHeader);

        // Crear el elemento <div> con el id "canvas-body"
        const canvasBody = document.createElement("div");
        canvasBody.setAttribute("id", "canvas-body");

        // Crear el elemento <canvas> con el id "modal-canvas" y las dimensiones width="1500px" y height="900px"
        const modalCanvas = document.createElement("canvas");
        modalCanvas.setAttribute("id", "modal-canvas");
        modalCanvas.setAttribute("class", "canvas");
        modalCanvas.setAttribute("width", "1500px");
        modalCanvas.setAttribute("height", "900px");
        canvasBody.appendChild(modalCanvas);

        canvasContainer.appendChild(canvasBody);

        // Crear el elemento <div> con el id "canvas-footer"
        const canvasFooter = document.createElement("div");
        canvasFooter.setAttribute("id", "canvas-footer");

        // Crear el primer <div> dentro de "canvas-footer"
        const div1 = document.createElement("div");

        // Crear el primer botón dentro de "div1"
        const pencilButton = document.createElement("button");
        pencilButton.setAttribute("class", "btn btn-primary btn-xl");
        pencilButton.setAttribute("onclick", "setPencilColor('black')");
        pencilButton.textContent = "Lapicero";
        div1.appendChild(pencilButton);

        // Crear el segundo botón dentro de "div1"
        const eraserButton = document.createElement("button");
        eraserButton.setAttribute("class", "btn btn-primary btn-xl");
        eraserButton.setAttribute("onclick", "setPencilColor('white')");
        eraserButton.textContent = "Borrador";
        div1.appendChild(eraserButton);

        // Crear el elemento <span> dentro de "div1"
        const brushSizeSpan = document.createElement("span");
        brushSizeSpan.setAttribute("id", "brush-sice");

        // Crear el elemento <input> dentro de "brushSizeSpan"
        const brushSizeInput = document.createElement("input");
        brushSizeInput.setAttribute("type", "range");
        brushSizeInput.setAttribute("min", "1");
        brushSizeInput.setAttribute("max", "20");
        brushSizeInput.setAttribute("value", "1");
        brushSizeInput.setAttribute("oninput", "setBrushSize(event.target.value)");
        brushSizeSpan.appendChild(brushSizeInput);

        div1.appendChild(brushSizeSpan);

        canvasFooter.appendChild(div1);

        // Crear el segundo <div> dentro de "canvas-footer"
        const div2 = document.createElement("div");

        // Crear el botón "Guardar" dentro de "div2"
        const saveButton = document.createElement("button");
        saveButton.setAttribute("class", "btn btn-primary btn-xl");
        saveButton.setAttribute("onclick", "saveImage()");
        saveButton.textContent = "Guardar";
        div2.appendChild(saveButton);

        canvasFooter.appendChild(div2);

        canvasContainer.appendChild(canvasFooter);

        

        modalBody.appendChild(modalContent);

        // Crear el elemento <div> "modal-footer"
        const modalFooter = document.createElement("div");
        modalFooter.setAttribute("id", "modal-footer");

        modalBody.appendChild(modalFooter);

        modalBody.appendChild(canvasContainer);

        modalContainer.appendChild(modalBody);
        modalWindow.appendChild(modalContainer);

        

        const script = document.createElement('script');
        script.src = 'js/canvas.js';
        document.head.appendChild(script);

    }

    reproduceAnimacion(animacion){

        if(animacion.length > 0){

            emptyModal();

            toggleModal();

            preloadAnimation(animacion);

            this.reproduceFrame(null, animacion, 0);

        }

    }

    reproduceFrame(actividad, animacion, numero){

        if(numero < animacion.length){
    
            const frame = animacion[numero];
            const background = driveImage(frame.imagen);
            const texto = frame.texto;
            const audio = frame.audio;
    
            const modalBody =  document.getElementById("modal-body");
            modalBody.style.background = 'url(' + background + ') no-repeat center center / cover';

            const content = document.getElementById("modal-footer");

            content.innerHTML = '';

            const text = document.createElement("p");
            text.id = "scene-text";
            text.innerText = texto;

            const contenedorTexto = document.createElement("div");
            contenedorTexto.id = "text-container";

            contenedorTexto.appendChild(text);

            content.appendChild(contenedorTexto);
    
            numero++;

            creaBotonSiguiente();
            
            const siguiente = document.getElementById("siguiente");

            if(numero == animacion.length) siguiente.textContent = "Volver a la nave";

            const self = this;
            siguiente.addEventListener("click", function () {
                self.reproduceFrame(actividad, animacion, numero);
            });
    
        } else {

            emptyModal();
    
            if (actividad === null){

                toggleModal();

            } else {

                this.iniciaActividad(actividad);

            }
    
        }
    
    }

    intro(){
        const animacion = this._introduccion;
        console.log(animacion);
        this.reproduceAnimacion(animacion);
    }

}

class Ranking{

    _clasification;

    constructor(clasification){
        this._clasification = clasification;
        this.innitRanking();
    }

    innitRanking(){

        // Crear el elemento <div> principal con la clase "container px-4 px-lg-5"
        var servicesDiv = document.createElement('section');
        servicesDiv.id = 'services';
        servicesDiv.className = 'page-section';

        // Crear el elemento <div> principal con la clase "container px-4 px-lg-5"
        var containerDiv = document.createElement('div');
        containerDiv.className = 'container px-4 px-lg-5';

        // Crear el elemento <div> con la clase "row"
        var rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        // Crear el elemento <div> con la clase "col-lg-12"
        var colDiv = document.createElement('div');
        colDiv.className = 'col-lg-12';

        // Crear el elemento <h2> con la clase "text-center mt-0" y el texto "Mejores puntuaciones"
        var h2Element = document.createElement('h2');
        h2Element.className = 'text-center mt-0';
        h2Element.textContent = 'Mejores puntuaciones';

        // Crear el elemento <hr> con la clase "divider"
        var hrElement = document.createElement('hr');
        hrElement.className = 'divider';

        // Añadir el elemento <h2> y el elemento <hr> al <div> con la clase "col-lg-12"
        colDiv.appendChild(h2Element);
        colDiv.appendChild(hrElement);

        // Añadir el <div> con la clase "col-lg-12" al <div> con la clase "row"
        rowDiv.appendChild(colDiv);
        
        for(let i = 0; i < this._clasification.length; i++) {
            const rank = this._clasification[i];
            // Añadir el <div> con la clase "rank col-lg-4" al <div> con la clase "row"
            rowDiv.appendChild(this.createRank(rank));
        }

        // Añadir el <div> con la clase "row" al <div> principal con la clase "container px-4 px-lg-5"
        containerDiv.appendChild(rowDiv);

        // Añadir el <div> principal al elemento 'services'
        servicesDiv.appendChild(containerDiv);

        // 
        document.body.insertBefore(servicesDiv, document.querySelector('footer'));

    }

    createRank(rank){
         // Crear el elemento <div> con la clase "rank col-lg-4"
         var rankDiv = document.createElement('div');
         rankDiv.className = 'rank col-lg-4';
 
         // Crear el elemento <p> con la clase "user"
         var userElement = document.createElement('p');
         userElement.className = 'user';
         userElement.textContent = rank.nombre;
 
         // Crear el elemento <p> con la clase "points" y el texto "92535"
         var pointsElement = document.createElement('p');
         pointsElement.className = 'points';
         pointsElement.textContent = rank.puntos;
 
         // Crear el elemento <img> sin atributo "src" (vacío)
         var imgElement = document.createElement('img');
         imgElement.src = driveImage(rank.imagen);
 
         // Añadir los elementos <p> y el <img> al <div> con la clase "rank col-lg-4"
         rankDiv.appendChild(userElement);
         rankDiv.appendChild(pointsElement);
         rankDiv.appendChild(imgElement);

         return rankDiv;
    }
}

class Bloque{

    _codigo;

    _numero;

    _nombre;

    _portada;

    _progreso;

    _actividades;

    constructor(codigo, numero, nombre, portada, progreso, actividades) {
        this._codigo = codigo;
        this._numero = numero;
        this._nombre = nombre;
        this._portada = portada;
        this._progreso = progreso;
        this._actividades = actividades;
        this.innitBloque(actividades);
    }

    innitBloque(actividades){

        const numActividades = this.creaActividadesBloque(actividades);

        this.creaBloquePortfolio('Misión ' + this._numero, this._nombre, this._portada, numActividades);

    }

    creaActividadesBloque(actividades){

        if(actividades === undefined){
            console.log("El bloque " + this._numero + " no tiene actividades!");
            return 0;
        };

        for (var i = 0; i < actividades.length; i++) {

        }
        
        return actividades.length;
        
    }

    creaBloquePortfolio(titulo, nombre, portada, numActividades){
        // Crear elementos HTML
        const divCol = document.createElement('div');
        divCol.className = 'col-lg-4 col-sm-6';
        if(numActividades > 0) divCol.addEventListener('click', this.cargaBloqueEnModal.bind(this));
    
        const link = document.createElement('a');
        link.className = 'portfolio-box';
    
        const img = document.createElement('img');
        img.className = 'img-fluid';
        img.src = driveImage(portada);
        img.alt = '...';
    
        const divCaption = document.createElement('div');
        divCaption.className = 'portfolio-box-caption';
    
        const divCategory = document.createElement('div');
        divCategory.className = 'project-category text-white-50';
        divCategory.textContent = titulo;
    
        const divName = document.createElement('div');
        divName.className = 'project-name';
        divName.textContent = nombre;
    
        // Construir la estructura de elementos
        divCaption.appendChild(divCategory);
        divCaption.appendChild(divName);
    
        link.appendChild(img);
        link.appendChild(divCaption);
    
        divCol.appendChild(link);
    
        document.getElementById('bloques').appendChild(divCol);
    }


    cargaBloqueEnModal(){

        var ventana = document.getElementById("modal-window");

        if (ventana.style.display === "none") {
            //Cargar los datos de este bloque en la ventana modal

            var actividad = this._actividades[this._progreso];

            const bloque = this;

            actividad = new Actividad(actividad.codigo, actividad.nombre, actividad.imagenFondo, actividad.fechaBonus, actividad.fechaLimite, actividad.manual, actividad.imagenProblema, actividad.solucion, actividad.escenasIntroductorias, actividad.escenasFinales, bloque);

            ventana.style.display = "block";
        }
          
    }

    iniciaSiguienteActividad(){

        console.log(this._progreso);
        console.log(this._actividades.length);

        if(this._progreso >= this._actividades.length){

            toggleModal();

        } else {

            var actividad = this._actividades[this._progreso];

            const bloque = this;

            actividad = new Actividad(actividad.codigo, actividad.nombre, actividad.imagenFondo, actividad.fechaBonus, actividad.fechaLimite, actividad.manual, actividad.imagenProblema, actividad.solucion, actividad.escenasIntroductorias, actividad.escenasFinales, bloque);
        }

    }

    increaseProgreso(){

        this._progreso++;

    }

}

class Actividad{

    _codigo;

    _nombre;

    _imagenFondo;

    _imagenProblema;

    _solucion;

    _fechaBonus;

    _fechaLimite;

    _manual;

    _escenasInicio;

    _escenasFin;

    _bloque;

    constructor(codigo, nombre, imagenFondo, fechaBonus, fechaLimite, manual, imagenProblema, solucion, escenasInicio, escenasFin, bloque) {
        this._codigo = codigo;
        this._nombre = nombre;
        this._imagenFondo = imagenFondo;
        this._fechaBonus = fechaBonus;
        this._fechaLimite = fechaLimite;
        this._manual = manual;
        this._imagenProblema = imagenProblema;
        this._solucion = solucion;
        this._escenasInicio = escenasInicio;
        this._escenasFin = escenasFin;
        this._bloque = bloque;

        this.reproduceAnimacionInicio();

    }

    reproduceAnimacionInicio(){

        const escenas = this._escenasInicio.length ?? 0;

        if(escenas > 0){

            emptyModal();

            preloadAnimation(this._escenasInicio);

            this.reproduceFrame(this._escenasInicio, 0, false);

        }

    }

    reproduceFrame(animacion, numero, esFinal){

        if(numero < animacion.length){
    
            const frame = animacion[numero];
            const background = driveImage(frame.imagen);
            const texto = frame.texto;
            const audio = frame.audio;
    
            const modalBody =  document.getElementById("modal-body");
            modalBody.style.background = 'url(' + background + ') no-repeat center center / cover';

            const content = document.getElementById("modal-footer");

            content.innerHTML = '';

            const text = document.createElement("p");
            text.id = "scene-text";
            text.innerText = texto;

            const contenedorTexto = document.createElement("div");
            contenedorTexto.id = "text-container";

            contenedorTexto.appendChild(text);

            content.appendChild(contenedorTexto);
    
            numero++;

            creaBotonSiguiente();
            
            const siguiente = document.getElementById("siguiente");

            if(numero == animacion.length){
                if (esFinal === true){
                    if(this._bloque._progreso < this._bloque._actividades.length){
                        siguiente.textContent = "Siguiente misión";
                    } else {
                        siguiente.textContent = "Volver a la nave";
                    }
                } else {
                    siguiente.textContent = "Iniciar misión";
                }
                    
            } 

            const self = this;
            siguiente.addEventListener("click", function () {
                self.reproduceFrame(animacion, numero, esFinal);
            });
    
        } else {

            emptyModal();

            const footer = document.getElementById("modal-footer");
            footer.innerHTML = "";
    
            if (esFinal === true){

                if(this._siguienteActividad !== null){

                    this._bloque.iniciaSiguienteActividad();

                } else {

                    toggleModal();
                }

            } else {

                this.iniciaActividad();

            }
    
        }
    
    }

    iniciaActividad(){

        //-- Iniciar bloques

        const background = driveImage(this._imagenFondo);

        const modalBody =  document.getElementById("modal-body");

        modalBody.style.background = 'url('+background+') no-repeat center center / cover';
        
        const modalHeaderContent =  document.getElementById("modal-header-content");

        // Crear la primera imagen dentro de "modal-header-content"
        const modalCameraImg = document.createElement("img");
        modalCameraImg.setAttribute("id", "modal-camera");
        modalCameraImg.setAttribute("class", "modal-icon");
        modalCameraImg.setAttribute("src", "/assets/img/modal/camera.svg");
        modalCameraImg.setAttribute("alt", "Selecciona una imagen");
        modalCameraImg.setAttribute("title", "Subir imagen con solución");
        modalCameraImg.setAttribute("onclick", "seleccionarArchivos()");
        modalHeaderContent.appendChild(modalCameraImg);

        // Crear la segunda imagen dentro de "modal-header-content"
        const modalLibretaImg = document.createElement("img");
        modalLibretaImg.setAttribute("class", "modal-icon");
        modalLibretaImg.setAttribute("src", "/assets/img/modal/libreta.png");
        modalLibretaImg.setAttribute("alt", "Abrir anotaciones");
        modalLibretaImg.setAttribute("title", "Abrir anotaciones");
        modalLibretaImg.setAttribute("onclick", "toggleCanvas()");
        modalHeaderContent.appendChild(modalLibretaImg);

        // Crear la tercera imagen dentro de "modal-header-content"
        const modalManualImg = document.createElement("img");
        modalManualImg.setAttribute("class", "modal-icon");
        modalManualImg.setAttribute("src", "/assets/img/modal/manual.png");
        modalManualImg.setAttribute("alt", "Consultar manual");
        modalManualImg.setAttribute("title", "Consultar manual");
        modalManualImg.setAttribute("onclick", "");
        modalHeaderContent.appendChild(modalManualImg);

        const modalContent = document.getElementById("modal-content");

        const modalHeaderTitleDiv = document.getElementById("modal-header-title");
        const modalHeaderTitle = document.createElement("h2");
        modalHeaderTitle.setAttribute("id", "modal-title");
        modalHeaderTitle.innerText = this._nombre;
        modalHeaderTitleDiv.appendChild(modalHeaderTitle);

        // Crear el elemento <div> con el id "problem-trigger"
        const problemTrigger = document.createElement("div");
        problemTrigger.setAttribute("id", "problem-trigger");

        // Crear la imagen dentro de "problem-trigger"
        const problemTriggerImg = document.createElement("img");
        problemTriggerImg.setAttribute("class", "modal-icon");
        problemTriggerImg.setAttribute("src", "/assets/img/modal/manual.png");
        problemTriggerImg.setAttribute("alt", "Consultar problema");
        problemTriggerImg.setAttribute("title", "Consultar problema");
        problemTriggerImg.addEventListener('click', function(){

            window.open(driveImage(this._imagenProblema) , '_blank');

        });

        problemTrigger.appendChild(problemTriggerImg);

        modalContent.appendChild(problemTrigger);

        const modalFooter = document.getElementById("modal-footer");

        const solutionDiv = document.createElement("div");
        solutionDiv.id="solution-div";

        const solution = document.createElement("input");
        solution.id="solution";
        solution.type="text";
        solution.placeholder="Solución";
        solutionDiv.appendChild(solution);

        const solutionButton = document.createElement("button");
        solutionButton.innerText = "Enviar";
        solutionButton.addEventListener('click', this.reproduceAnimacionFin.bind(this));
        
        solutionDiv.appendChild(solutionButton);

        modalFooter.appendChild(solutionDiv);

    }

    reproduceAnimacionFin(){

        const solucion = document.getElementById("solution").value;

        if(solucion == this._solucion){ // Se ha acertado la solución

            this._bloque.increaseProgreso();

            const escenas = (this._escenasFin && this._escenasFin.length) ?? 0;

            if(escenas > 0){ //Hay escenas de fin

                emptyModal();
    
                preloadAnimation(this._escenasFin);
    
                this.reproduceFrame(this._escenasFin, 0, true);
    
            } else { // No hay animación de fin

                this._bloque.iniciaSiguienteActividad();

            }

        } else { // No se ha acertado la solución

        }

    }

}



