document.addEventListener('DOMContentLoaded', () => {
    validarAcceso(); 

    mostrarBienvenida();


    if (window.location.pathname.includes('adminindex.html') || window.location.pathname.includes('admin.html')) {
        validarAccesoAdmin(); 
    }

    if (window.location.pathname.includes('trabajador.html') || window.location.pathname.includes('trabajadorindex.html')) {
        validarAccesotrabajador(); 
    }

    cargarUsuarios().then(() => {
        const rol = localStorage.getItem('rol');
        
        if (rol === 'admin') {
            cargarTablaAdmin(); 
        } else if (rol === 'usuario') {
            cargarTablaUsuario(); 
        }

    });

    const formularioTrabajador = document.getElementById('formularioTrabajador');
    if (formularioTrabajador) {
        formularioTrabajador.addEventListener('submit', manejarFormularioTrabajador);
    }

    const formularioLogin = document.getElementById('formularioLogin');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', manejarLogin);
    }

});


let usuarios = [];
const trabajadoresAceptados = [];

const mostrarBienvenida = () => {
    const mensajeBienvenida = document.getElementById('mensajeBienvenida');
    
    if (!mensajeBienvenida) {
        return; 
    }

    const nombreUsuario = localStorage.getItem('nombreUsuario');
    
    if (nombreUsuario) {
        mensajeBienvenida.textContent = 'Bienvenido ' + nombreUsuario;
    } else {
        mensajeBienvenida.textContent = 'Bienvenido Usuario';
    }
};



const cargarUsuarios = async () => {
    try {
        const response = await fetch('https://api.jsonbin.io/v3/b/670095bfacd3cb34a8915b72', {
            method: 'GET',
            headers: {
                'X-Master-Key': 'https://api.jsonbin.io/v3/b/670095bfacd3cb34a8915b72', 
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        usuarios = data.record;
        console.log('Usuarios cargados:', usuarios);

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
};


const manejarLogin = (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;

    if (usuarios.length === 0) {
        alert('No se han cargado los usuarios. Intenta más tarde.');
        return;
    }

    const user = usuarios.find(u => u.usuario === usuario && u.contrasena === contrasena);

    if (user) {
        localStorage.setItem('rol', user.rol);
        localStorage.setItem('nombreUsuario', user.usuario);

        if (user.rol === 'admin') {
            window.location.href = '/prueba1/html/adminindex.html';
        } else if (user.rol === 'trabajador') {
            window.location.href = '/prueba1/html/trabajadorindex.html';
        } else if (user.rol === 'usuario') {
            window.location.href = '/prueba1/html/usuarioindex.html';
        }
    } else {
        alert('Usuario o contraseña incorrectos');
    }
};


const cerrarSesion = () => {
    localStorage.removeItem('rol');
    localStorage.removeItem('nombreUsuario');
    window.location.href = '/prueba1/index.html'; 
};

const validarAcceso = () => {
    const rol = localStorage.getItem('rol');

    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage !== 'index.html' && !rol) {
        window.location.href = '/prueba1/index.html'; 
    }
};

const validarAccesoAdmin = () => {
    const rol = localStorage.getItem('rol');

    if (!rol || rol !== 'admin') {
        alert('Acceso denegado. Solo los administradores pueden acceder a esta página.');
        window.location.href = '/prueba1/index.html'; 
    } else {
        console.log("Acceso autorizado para administrador.");
    }
};

const validarAccesotrabajador = () => {
    const rol = localStorage.getItem('rol');

    if (!rol || (rol !== 'admin' && rol !== 'trabajador')) {
        alert('Acceso denegado. Solo los trabajadores pueden acceder a esta página.');
        window.location.href = '/prueba1/index.html';
    } else {
        console.log("Acceso autorizado para trabajador.");
    }
};




const manejarFormularioTrabajador = (e) => {
    e.preventDefault();

    const edad = document.getElementById('edad').value;
    
    if (edad <= 0) {
        alert('La edad debe ser un número positivo.');
        return;
    }

    const trabajadorData = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        correo: document.getElementById('correo').value,
        titulo: document.getElementById('titulo').value,
        ubicacion: document.getElementById('ubicacion').value,
        edad: edad,
        telefono: document.getElementById('telefono').value,
        genero: document.querySelector('input[name="genero"]:checked').value,
        nivelEducativo: document.getElementById('nivelEducativo').value
    };

    if (!trabajadorData.nombre || !trabajadorData.apellido || !trabajadorData.correo ||
        !trabajadorData.titulo || !trabajadorData.ubicacion || !trabajadorData.edad || 
        !trabajadorData.telefono || !trabajadorData.genero || !trabajadorData.nivelEducativo) {
        alert('Por favor completa todos los campos.');
        return;
    }

    let trabajadores = JSON.parse(localStorage.getItem('trabajadores')) || [];
    trabajadores.push(trabajadorData);
    localStorage.setItem('trabajadores', JSON.stringify(trabajadores));

    alert('Solicitud enviada al administrador.');
    document.getElementById('formularioTrabajador').reset();

    if (localStorage.getItem('rol') === 'admin') {
        cargarTablaAdmin();
    }
};

const cargarTablaAdmin = () => {
    const cuerpoTabla = document.querySelector('#tablaTrabajadores tbody');
    const trabajadoresGuardados = JSON.parse(localStorage.getItem('trabajadores')) || [];
    
    cuerpoTabla.innerHTML = '';

    trabajadoresGuardados.forEach((trabajador, index) => {
        const fila = cuerpoTabla.insertRow();
        fila.insertCell(0).textContent = trabajador.nombre;
        fila.insertCell(1).textContent = trabajador.apellido;
        fila.insertCell(2).textContent = trabajador.correo;
        fila.insertCell(3).textContent = trabajador.titulo;
        fila.insertCell(4).textContent = trabajador.ubicacion;
        fila.insertCell(5).textContent = trabajador.edad;
        fila.insertCell(6).textContent = trabajador.telefono; 
        fila.insertCell(7).textContent = trabajador.genero; 
        fila.insertCell(8).textContent = trabajador.nivelEducativo; 

        const celdaAcciones = fila.insertCell(9);

        const botonAceptar = document.createElement('button');
        botonAceptar.textContent = 'Aceptar';
        botonAceptar.onclick = async () => {
            alert(`Trabajador ${trabajador.nombre} aceptado.`);
            
            let trabajadoresAceptados = JSON.parse(localStorage.getItem('trabajadoresAceptados')) || [];
            trabajadoresAceptados.push(trabajador);
            localStorage.setItem('trabajadoresAceptados', JSON.stringify(trabajadoresAceptados));

            trabajadoresGuardados.splice(index, 1);
            localStorage.setItem('trabajadores', JSON.stringify(trabajadoresGuardados));
            cargarTablaAdmin();
        };

        const botonRechazar = document.createElement('button');
        botonRechazar.textContent = 'Rechazar';
        botonRechazar.onclick = () => {
            alert(`Trabajador ${trabajador.nombre} rechazado.`);
            trabajadoresGuardados.splice(index, 1);
            localStorage.setItem('trabajadores', JSON.stringify(trabajadoresGuardados));
            cargarTablaAdmin();
        };

        celdaAcciones.appendChild(botonAceptar);
        celdaAcciones.appendChild(botonRechazar);
    });
};

const cargarTablaUsuario = () => {
    const cuerpoTabla = document.querySelector('#tablaTrabajadoresAceptados tbody');
    const trabajadoresAceptados = JSON.parse(localStorage.getItem('trabajadoresAceptados')) || [];

    cuerpoTabla.innerHTML = '';

    trabajadoresAceptados.forEach(trabajador => {
        const fila = cuerpoTabla.insertRow();
        fila.insertCell(0).textContent = trabajador.nombre;
        fila.insertCell(1).textContent = trabajador.apellido;
        fila.insertCell(2).textContent = trabajador.correo;
        fila.insertCell(3).textContent = trabajador.titulo;
        fila.insertCell(4).textContent = trabajador.ubicacion;
        fila.insertCell(5).textContent = trabajador.edad;
        fila.insertCell(6).textContent = trabajador.telefono; 
        fila.insertCell(7).textContent = trabajador.genero; 
        fila.insertCell(8).textContent = trabajador.nivelEducativo; 
    });
};

const dropdown = document.querySelector('.dropdown');
if (dropdown) {
    dropdown.addEventListener('click', () => {
        dropdown.classList.toggle('open');
    });
}

const retractil = () => {
    const nav = document.getElementById("HD");
    const img = document.getElementById("Bretractil");

    if (nav.style.display === "none") {
        nav.style.display = "block"; 
        img.src = "../img/abajo.png"; 
    } else {
        nav.style.display = "none"; 
        img.src = "../img/arriba.png";  
    }
};

window.onload = () => {
    document.getElementById("HD").style.display = "block";
};

const tarjetita = (element) => {
    const tarjeta = element.closest('.tarjeta');
    const contenido = tarjeta.querySelector('.contenido');
    const img = tarjeta.querySelector('.retractil'); 

    if (contenido.style.display === "none" || contenido.style.display === "") {
        contenido.style.display = "block"; 
        img.src = "../img/up.png"; 
    } else {
        contenido.style.display = "none"; 
        img.src = "../img/down.png"; 
    }
};


document.addEventListener("DOMContentLoaded", () => {
    const contenidos = document.querySelectorAll('.contenido');
    contenidos.forEach(contenido => {
        contenido.style.display = "none"; 
    });
});


const cargarUsuariosJson = async () => {
    try {
        const response = await fetch('https://api.jsonbin.io/v3/b/670097eaacd3cb34a8915c38', {
            method: 'GET',
            headers: {
                'X-Master-Key': 'https://api.jsonbin.io/v3/b/670097eaacd3cb34a8915c38', 
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        usuarios = data.record; 
        console.log('Usuarios cargados:', usuarios);

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
};

const cargarUsuariosTabla = () => {
    const tablaUsuarios = document.getElementById('tablaUsuarios');
    const totalUsuarios = document.getElementById('totalUsuarios');
    

    const usuariosFiltrados = usuarios.filter(u => u.rol === 'usuario' || u.rol === 'trabajador');
    

    tablaUsuarios.innerHTML = '';

    usuariosFiltrados.forEach((usuario) => {
        const fila = document.createElement('tr');
        
        const nombreCelda = document.createElement('td');
        nombreCelda.textContent = usuario.usuario;
        fila.appendChild(nombreCelda);
        
        const rolCelda = document.createElement('td');
        rolCelda.textContent = usuario.rol;
        fila.appendChild(rolCelda);
        
        tablaUsuarios.appendChild(fila);
    });

    totalUsuarios.textContent = `Total de usuarios: ${usuariosFiltrados.length}`;
};


document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios().then(() => {
        cargarUsuariosTabla();
    });
});

const cargarAdministradores = async () => {
    const tablaAdminsBody = document.getElementById('tablaadmins').querySelector('tbody');
    const totalAdmins = document.getElementById('totalAdmins');

    try {
        const response = await fetch('https://api.jsonbin.io/v3/b/67009d20e41b4d34e43d2a72', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los datos: ' + response.status);
        }

        const data = await response.json();
        const usuarios = data.record;
        const adminsFiltrados = usuarios.filter(u => u.rol === 'admin');

        tablaAdminsBody.innerHTML = ''; 

        adminsFiltrados.forEach((admin) => {
            const fila = document.createElement('tr');

            const nombreCelda = document.createElement('td');
            nombreCelda.textContent = admin.usuario;
            fila.appendChild(nombreCelda);

            const rolCelda = document.createElement('td');
            rolCelda.textContent = admin.rol;
            fila.appendChild(rolCelda);

            tablaAdminsBody.appendChild(fila);
        });

        totalAdmins.textContent = `Total de administradores: ${adminsFiltrados.length}`;

    } catch (error) {
        console.error('Error al cargar los administradores:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    cargarAdministradores();
});
