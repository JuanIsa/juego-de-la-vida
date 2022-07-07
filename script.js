"use strict";
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const boton = document.getElementById("boton");
let bandera = false;
let animacion;
let controlCasillas=0;
boton.addEventListener("click", () => {
    if (!bandera) {
        inicializa();
        bandera = true;
        boton.innerHTML = "Detener Patrón";
    } else {
        clearInterval(animacion);
        bandera = false;
        boton.innerHTML = "Iniciar Patrón";
    }
});
let lienzoX = 400;  //pixels ancho
let lienzoY = 400;  //pixels alto
let fps = 30;
lienzo.height = lienzoY;
lienzo.width = lienzoX;
//letiables relacionadas con el tablero de juego
let filas = 200;      //100
let columnas = 200;   //100
let viva = 'green';
let muerta = 'coral';
let tileX = Math.floor(lienzoX / columnas);
let tileY = Math.floor(lienzoY / filas);
//PASO UNO, CREO LA MATRIZ
let tablero = crearMatriz(filas, columnas);
function crearMatriz(f, c) {
    let obj = new Array(f);
    for (let i = 0; i < f; i++) {
        obj[i] = new Array(c);
    }
    return obj;
}
//Declaro la clase a usar
class Cuadradito {
    constructor(x, y, estado) {
        this.x = x;
        this.y = y;
        this.estado = estado;           //vivo = 1, muerto = 0
        this.estadoProx = this.estado;  //estado que tendrá en el siguiente ciclo
        this.vecinos = [];    //guardamos el listado de sus vecinos
        //Método que añade los vecinos del objeto actual
        this.addVecinos = function () {
            let xVecino;
            let yVecino;
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    xVecino = (this.x + j + columnas) % columnas;
                    yVecino = (this.y + i + filas) % filas;
                    //descartamos el agente actual (yo no puedo ser mi propio vecino)
                    if (i != 0 || j != 0) {
                        this.vecinos.push(tablero[yVecino][xVecino]);
                    }
                }
            }
        }
        this.dibuja = function () {
            let color;
            if (this.estado == 1) {
                color = viva;
            }
            else {
                color = muerta;
            }

            ctx.fillStyle = color;
            ctx.fillRect(this.x * tileX, this.y * tileY, tileX, tileY);

        }
        //Programamos las leyes de Conway
        this.nuevoCiclo = function () {
            let suma = 0;
            //calculamos la cantidad de vecinos vivos
            for (let i = 0; i < this.vecinos.length; i++) {
                suma += this.vecinos[i].estado;
            }
            //APLICAMOS LAS NORMAS DE CONWAY
            //Valor por defecto lo dejamos igual
            this.estadoProx = this.estado;
            //MUERTE: tiene menos de 2 o más de 3
            if (suma < 2 || suma > 3) {
                this.estadoProx = 0;
            }
            //VIDA/REPRODUCCIÓN: tiene exactamente 3 vecinos
            if (suma == 3) {
                this.estadoProx = 1;
            }
        }
        this.mutacion = function () {
            this.estado = this.estadoProx;
        }
    }
}
//Paso 3  inicializo la matriz con todos los objetos en blanco
function inicializaTablero(obj) {
    for (let i = 0; i < columnas; i++) {
        for (let j = 0; j < filas; j++) {
            obj[i][j] = new Cuadradito(i, j, 0);
        }
    }
    for (let i = 0; i < columnas; i++) {
        for (let j = 0; j < filas; j++) {
            obj[i][j].dibuja();
        }
    }
}
//inicializaTablero(tablero);
inicializaTableroAleatorio(tablero);

function inicializaTableroAleatorio(obj) {
    let estado;
    for (let y = 0; y < filas; y++) {
        for (let x = 0; x < columnas; x++) {
            estado = Math.floor(Math.random() * 2);
            obj[y][x] = new Cuadradito(x, y, estado);
        }
    }
    for (let i = 0; i < columnas; i++) {
        for (let j = 0; j < filas; j++) {
            obj[i][j].dibuja();
        }
    }
}

let x, y;
lienzo.addEventListener("mousemove", function (e) {
    // Con la el método getBoundingClientRect, obtengo las distancias en píxeles del ancho interno de la ventana con respecto al elemento Canva
    const tam = lienzo.getBoundingClientRect();
    x = tam.left;
    y = tam.top;
    //Trunco o corto esos valores de distancias en píxeles
    x = Math.trunc(x, 0);
    y = Math.trunc(y, 0);
    //El atributo "page" me devuelve  la ubicación del puntero con respecto a la ventana interna total, por eso hago la resta.
    x = e.pageX - x;
    y = e.pageY - y;
    x = Math.floor(x / tileX);
    y = Math.floor(y / tileY);
});

lienzo.addEventListener("mousemove", () => {
    if (tablero[x][y].estado == 0) {
        tablero[x][y].estado = 1;
    }
    else {
        tablero[x][y].estado = 0;
    }
    for (let i = 0; i < columnas; i++) {
        for (let j = 0; j < filas; j++) {
            tablero[i][j].dibuja();
        }
    }
});

function inicializa() {
    if (controlCasillas == 0) {
        console.log("Entro");
        for (let i = 0; i < columnas; i++) {
            for (let j = 0; j < filas; j++) {
                tablero[i][j].addVecinos();
            }
        }
        controlCasillas = 1;
    }
    animacion = setInterval(principal, 1000 / fps);
}

function principal() {
    ctx.clearRect(0, 0, lienzoX, lienzoY);
    dibujarMatriz(tablero);
}

function dibujarMatriz(obj) {
    for (let i = 0; i < columnas; i++) {
        for (let j = 0; j < filas; j++) {
            obj[i][j].dibuja();
        }
    }
    for (let i = 0; i < columnas; i++) {
        for (let j = 0; j < filas; j++) {
            obj[i][j].nuevoCiclo();
        }
    }
    for (let i = 0; i < columnas; i++) {
        for (let j = 0; j < filas; j++) {
            obj[i][j].mutacion();
        }
    }
}