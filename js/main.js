var instancia = null;

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

                    data = response.result;

                    if(instancia==null) instancia = new Cuenta(type, data);
                    
                    fadeOutEffect(document.getElementById('login-container'), 800);
                } else {
                    alert("No ha sido posible verificar tus credenciales.");
                    response = null;
                }
            }
        };
        
        // Enviar la solicitud con los datos del formulario
        xhr.send('username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password));

  });
}

async function load(){

    type = getCookieValue("type");
    auth = getCookieValue("auth");
    expires = getCookieValue("expires");

    if(type == null || auth == null || expires == null){

        await openLogin();
        
    }

    var response = await httpFetch('http://api.local/' + type, 'GET');

    var status = response.status;

    data = response.result;

    if(status === 200) {

        if(instancia==null) instancia = new Cuenta(type, data);

        // Carga cosas de usuario
        fadeOutEffect(document.getElementById('login-container'), 800);
        
    } else {
        
        // Carga login
        await login();
        document.getElementById('login-form-container').style.display = 'block';
        document.getElementById('loader').style.display = 'none';

    }
    
}

async function openLogin(){
    // Carga login
    await login();
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('loader').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    load();

    // Obtener todos los elementos con la clase 'countdown'
    countdowns = document.getElementsByClassName("countdown");
    if(countdowns!=null) {
        countdown(countdowns);
    }

});

function fadeOutEffect(elemento, intervalo) {
    var opacity = 1;
    var decremento = 0.020;
    var timer = setInterval(function () {
      if (opacity <= decremento) {
        clearInterval(timer);
        elemento.style.display = 'none';
      }
      elemento.style.opacity = opacity;
      opacity -= decremento;
    }, 27);
  }

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
        this._usuario = new Alumno(data.nombreUsuario, data.tiempoLimite, data.bloques, data.puntos, data.ranking);
    }

    innitProfesor(){
        this._usuario = new Profesor(data.nombreUsuario);
    }

    getType(){
        return this._type;
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

    _bloques;

    _ranking;

    constructor(nombre, tiempoLimite, bloques, puntos, ranking) {
        super(nombre);
        this._puntos = puntos;
        this._tiempoLimite = tiempoLimite;
        this._ranking = new Ranking(ranking);
        this._bloques = new Map();
        this.innitAlumno(bloques);
    }



    innitAlumno(bloques){
        this.generarEstructurasPágina();
        this.innitBloques(bloques);
    }

    generarEstructurasPágina(){

        // Obtener el contenedor donde se va a añadir la estructura
        const contenedor = document.getElementById('portfolio');

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

        // Agregar el elemento <div> "container-fluid" al documento
        contenedor.appendChild(containerDiv);

        //iniciar el contenido dentro de la ventana modal
        this.innitModal();

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

        modalHeader.appendChild(modalHeaderContent);

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

        // Agregar el código CSS directamente en el elemento <style>
        const styleElement = document.createElement("style");
        styleElement.textContent = "#problem-trigger { text-align: right; padding: 1rem; }";
        modalContent.appendChild(styleElement);

        // Crear el elemento <div> con el id "problem-trigger"
        const problemTrigger = document.createElement("div");
        problemTrigger.setAttribute("id", "problem-trigger");

        // Crear la imagen dentro de "problem-trigger"
        const problemTriggerImg = document.createElement("img");
        problemTriggerImg.setAttribute("class", "modal-icon");
        problemTriggerImg.setAttribute("src", "/assets/img/modal/manual.png");
        problemTriggerImg.setAttribute("alt", "Consultar problema");
        problemTriggerImg.setAttribute("title", "Consultar problema");
        problemTriggerImg.setAttribute("onclick", "");
        problemTrigger.appendChild(problemTriggerImg);

        modalContent.appendChild(problemTrigger);

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

        modalContent.appendChild(canvasContainer);

        modalBody.appendChild(modalContent);

        // Crear el elemento <div> "modal-footer"
        const modalFooter = document.createElement("div");
        modalFooter.setAttribute("id", "modal-footer");

        modalBody.appendChild(modalFooter);


        modalContainer.appendChild(modalBody);
        modalWindow.appendChild(modalContainer);

        const script = document.createElement('script');
        script.src = 'js/canvas.js';
        document.head.appendChild(script);

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

        // Añadir el <div> principal al elemento 'services' del documento
        document.getElementById('services').appendChild(containerDiv);

    }

    createRank(rank){
         // Crear el elemento <div> con la clase "rank col-lg-4"
         var rankDiv = document.createElement('div');
         rankDiv.className = 'rank col-lg-4';

         // Crear el elemento <p> con la clase "posicion"
         var userPos = document.createElement('p');
         userPos.className = 'position';
         userPos.textContent = rank.posicion + 'º';
 
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
         imgElement.src = 'https://drive.google.com/uc?export=download&id=' + rank.imagen;
 
         // Añadir los elementos <p> y el <img> al <div> con la clase "rank col-lg-4"
         rankDiv.appendChild(userPos);
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
        this._actividades = new Map();
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
        if(numActividades > 0) divCol.addEventListener('click', this.cargaBloqueEnModal);
    
        const link = document.createElement('a');
        link.className = 'portfolio-box';
    
        const img = document.createElement('img');
        img.className = 'img-fluid';
        img.src = 'https://drive.google.com/uc?export=download&id=' + portada;
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
            ventana.style.display = "block";
        }
          
    }

}

class Actividad{

    _codigo;

    _nombre;

    _imagenFondo;

    _imagenProblema;

    _fechaBonus;

    _fechaLimite;

    _manual;

    _escenas; //EscenasIntroductorias

    constructor(codigo, nombre, imagenFondo, fechaBonus, fechaLimite, manual, imagenProblema) {
        this._codigo = codigo;
        this._nombre = nombre;
        this._imagenFondo = imagenFondo;
        this._fechaBonus = fechaBonus;
        this._fechaLimite = fechaLimite;
        this._manual = manual;
        this._imagenProblema = imagenProblema;
        _escenas = [];
    }

}



