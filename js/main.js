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
                }
                response = await xhr.responseText;
                var status = response.status;
                if(status === 200){
                    var nombre = response.nombre;
                    var fotoPerfil = response.fotoPerfil;
                    fadeOutEffect(document.getElementById('login-container'), 800);
                } else {
                    alert("No ha sido posible verificar tus credenciales.");
                }
            }
        };
        
        // Enviar la solicitud con los datos del formulario
        xhr.send('username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password));

  });
}

async function httpFetch(uri, meth) {
    var auth = getCookieValue("auth");
    var expires = getCookieValue("expires");

    const response = await fetch(uri, {
        method: meth,
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

async function load(type){
    var result = await httpFetch('http://api.local'+type, 'GET');
    var status = result.status;
    if(status === 401) {
        // Carga login
        document.getElementById('login-form-container').style.display = 'block';
        document.getElementById('loader').style.display = 'none';
    } else {
        // Carga cosas de usuario
        // document.getElementById('login-container').style.display = 'none';
        fadeOutEffect(document.getElementById('login-container'), 800);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    load('/alumno');
    login();
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