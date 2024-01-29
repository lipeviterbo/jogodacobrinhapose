import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getDatabase, ref, set, push, get} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgvWBDEnhAipsdfMKwAZEctpR4MZLRSJE",
  authDomain: "jogodacobrinha-bc090.firebaseapp.com",
  databaseURL: "https://jogodacobrinha-bc090-default-rtdb.firebaseio.com",
  projectId: "jogodacobrinha-bc090",
  storageBucket: "jogodacobrinha-bc090.appspot.com",
  messagingSenderId: "223152594478",
  appId: "1:223152594478:web:8e1128fbc8596e533f49bf"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);

let valorDoRecord = 0;
const record = document.querySelector('.record');
const canvas = document.querySelector('.canvas_jogo');//seleciona o objeto canvas onde se faz os desenhos do jogo (palco do jogo)
canvas.width = canvas.height =500;
const ctx = canvas.getContext("2d")
const audio = new Audio("./assets/audio.mp3");

const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play")

const quantidadeDequadradinhosNaHorizontalEVertical = 20;
const size = canvas.width/quantidadeDequadradinhosNaHorizontalEVertical; //tamanho padrão de cada quadradinho

const initialPosition = {x:Math.floor(quantidadeDequadradinhosNaHorizontalEVertical/2)*size, y:Math.floor(quantidadeDequadradinhosNaHorizontalEVertical/2)*size};
let snake = [initialPosition]//array que gera a cobrinha

const incrementScore = ()=>{
    score.innerHTML = +score.innerHTML+10; // o + na frente do score.innerHTML converte o texto e número, serio o mesmo que fazer parseInt(score.innerHTML)
}

const numeroAleatorio = (minimo, maximo)=>{
    return Math.round(Math.random()*(maximo-minimo)+minimo);
}

const randomPosition = ()=>{
    const posicaoSorteada = numeroAleatorio (0,quantidadeDequadradinhosNaHorizontalEVertical-1)*size;// sorteia uma posição que se encaixa direitinho no grid (na grade do jogo)
    return posicaoSorteada;
}

const randomColor = ()=>{
    const red = numeroAleatorio(0,255);
    const green = numeroAleatorio(0,255);
    const blue = numeroAleatorio(0,255);
    return `rgb(${red}, ${green}, ${blue})`
}

//para debug
// const corRGB_sorteada = randomColor();
// h1.style.color = corRGB_sorteada;
// h1.innerHTML=corRGB_sorteada;

const arrayDeCores = ["PowderBlue","Thistle","Lavender","PaleGoldenrod","PeachPuff","Yellow","Gold","Orange","Red","Tomato","Brown","DarkRed","Maroon","DeepPink","Purple","Indigo","GreenYellow","Chartreuse","Green","MediumSpringGreen","Aquamarine","Turquoise","SteelBlue","Blue","DeepSkyBlue","DarkSlateBlue"];

const food = {
    x: randomPosition(),
    y: randomPosition(),
    //color: corRGB_sorteada  // não estamos utilizando a cor sorteada para não correr o risco de termos a mesma cor do fundo do jogo
    color: arrayDeCores[numeroAleatorio (0,arrayDeCores.length-1)] // Math.floor(Math.random() * (arrayDeCores.length-1))] // sorteia uma cor aleatória do array arrayDeCores
}


const drawFood = ()=>{
    const{x,y, color} = food;// isso é o mesmo que fazer: x = food.x, y = food.y e color = food.color

    
    ctx.shadowColor = color; // cor do efeito de brilho
    ctx.shadowBlur = 6;  // isso irá dar um efeito de brilho nos desenhos do ctx
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0; // retira o efeito de brilho dos desenhos do ctx a partir daqui
}

const drawSnake = ()=>{
    ctx.fillStyle = "#ddd";
    
    snake.forEach((position, index)=>{
        if(index==snake.length-1){
            ctx.fillStyle = "white";
        }
        ctx.fillRect(position.x, position.y, size, size);
    });
}

let direction, direcaoAnterior, loopId
direcaoAnterior = "";
let finalizado = false;// esta variável serve para que o gameOver seja executado somente uma vez a cada partida
const moveSnake = ()=>{         // função responsável por mover a cobrinha
    
    direction = label;
    let comando_invalido =  direction!="esquerda"&&direction!="direita"&&direction!="frente"&&direction!="tras"&&direction!="sem_comando";
    if(!direction||finalizado||(direction=="sem_comando"&&direcaoAnterior == "")) return;      //caso não haja direção, não move
    if(comando_invalido){
        alert("A URL dos seus novos comandos é inválida ou possui algum comando fora do padrão!");
        window.location.reload(true);
        return;
    }
    const head = snake.at(-1);  // põe o último elemento do array "snake" na variável "head"
    snake.shift();              //remove o primeiro elemento do array (ou seja, tira o rabo da cobrinha)
    
    //console.log("direcao atual: "+direction +" direcao anterior: "+direcaoAnterior) //para debug
    if(direction=="sem_comando"){
        direction = direcaoAnterior;
    }
    
    if(direction=="direita"&&direcaoAnterior != "esquerda"){    //impede da cobra ir diretamente pra direção contrária
        snake.push({x:head.x+size, y:head.y});                  // insere um novo elemento no array, ou seja, põe a nova cabeça
        direcaoAnterior = direction;
    }
    if(direction=="direita"&&direcaoAnterior == "esquerda"){    //caso a cobra receba a direção contrária, ela continua indo de onde ela já vinha
        snake.push({x:head.x-size, y:head.y});                  // continua indo no sentido para esquerda sem alterar a variável direcaoAnterior
    }
    if(direction=="esquerda"&&direcaoAnterior != "direita"){    //impede da cobra ir diretamente pra direção contrária
        snake.push({x:head.x-size, y:head.y});                  // insere um novo elemento no array, ou seja, põe a nova cabeça
        direcaoAnterior = direction;
    }
    if(direction=="esquerda"&&direcaoAnterior == "direita"){    //caso a cobra receba a direção contrária, ela continua indo de onde ela já vinha
        snake.push({x:head.x+size, y:head.y});                  // continua indo no sentido para direita sem alterar a variável direcaoAnterior
    }
    if(direction=="tras"&&direcaoAnterior != "frente"){         //impede da cobra ir diretamente pra direção contrária
        snake.push({x:head.x, y:head.y+size});                  // insere um novo elemento no array, ou seja, põe a nova cabeça
        direcaoAnterior = direction;
    }
    if(direction=="tras"&&direcaoAnterior == "frente"){         //impede da cobra ir diretamente pra direção contrária
        snake.push({x:head.x, y:head.y-size});                  // continua indo no sentido para frente sem alterar a variável direcaoAnterior
    }
    if(direction=="frente"&&direcaoAnterior != "tras"){         //impede da cobra ir diretamente pra direção contrária
        snake.push({x:head.x, y:head.y-size});                  // insere um novo elemento no array, ou seja, põe a nova cabeça
        direcaoAnterior = direction;
    }
    if(direction=="frente"&&direcaoAnterior == "tras"){         //impede da cobra ir diretamente pra direção contrária
        snake.push({x:head.x, y:head.y+size});                  // continua indo no sentido para tras sem alterar a variável direcaoAnterior
    }
}

const drawGrid = ()=>{
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#191919"
    let i = size;
    for(i=size; i<canvas.width; i=i+size){ 
        // linhas verticais (o x varia e o y fica fixo)
        ctx.beginPath();//vai ser apontar para o início de um novo caminho (ou seja, de uma nova linha)
        ctx.lineTo(i,0); // ponto inicial da linha
        ctx.lineTo(i,canvas.height); // ponto final da linha
        ctx.stroke(); // traça a linha

        // linhas horizontais (o x fica fixo e o y vaira)
        ctx.beginPath();//vai ser apontar para o início de um novo caminho (ou seja, de uma nova linha)
        ctx.lineTo(0,i); // ponto inicial da linha
        ctx.lineTo(canvas.height,i); // ponto final da linha
        ctx.stroke(); // traça a linha

    }
   
}

const checkEat=()=>{
    const head = snake.at(-1);  // põe o último elemento do array "snake" na variável "head"

    if(head.x==food.x && head.y ==food.y){//checa se as coordenadas da cabeça da cobra (head) coincidem com as coordenadas da comida
        snake.push(head);// isere mais um novo elemento no array snake (com as coordenadas da comida)
        incrementScore();
        audio.play();
        // a partir de agora iremos gerar uma nova posição da comida
        let x= randomPosition();
        let y= randomPosition();
        
        while(snake.find((elemento)=>elemento.x==x&&elemento.y==y)){//verifica se as novas coordenadas para a comida coincide com alguma das coordenadas do corpo da cobrinha
            x= randomPosition();
            y= randomPosition();
        }//fica no loop até que seja criada uma comida fora do corpo da cobrinha
        food.x = x;
        food.y = y;
        food.color= arrayDeCores[numeroAleatorio (0,arrayDeCores.length-1)] ;        
    }
}

const checkCollision = ()=>{
    const head = snake.at(-1);  // põe o último elemento do array "snake" na variável "head"
    const limiteHorizontal = canvas.width-size;
    const limiteVertical = canvas.height-size;

    const wallCollision = head.x < 0||head.x>limiteHorizontal||head.y<0||head.y>limiteVertical

    const selfCollision = snake.find((elemento, index)=>{
        return (elemento.x == head.x && elemento.y == head.y && index<snake.length-2);// verifica se há colisão da cabeça da cobra com outra parte do corpo diferente da cabeça
    });

    if(wallCollision||selfCollision){
        gameOver();
    }
    // if(wallCollision) alert("Perdeu! Você bateu a cabeça no muro.");
    // if(selfCollision) alert("Perdeu! Você bateu a cabeça no corpo")
}

const inserirPontosNoFirebase = () => {
    const database = getDatabase();
    const scoresRef = ref(database, 'pontos');
    const recordeRef = ref(database, 'recorde');

    const finalScoreValue = parseInt(finalScore.innerText);

    const momentoAtual = Date.now();
    const dataDoMomentoAtual = new Date(momentoAtual);

    const newScoreRef = push(scoresRef);
    set(newScoreRef, {
        timestamp: momentoAtual,
        score: finalScoreValue,
        dataEhora: dataDoMomentoAtual.toString()
    });

    // Atualiza o recorde se o novo score for maior
    
        if (finalScoreValue > valorDoRecord) {
            const newRecordeRef = push(recordeRef);
            set(newRecordeRef, {
                timestamp: momentoAtual,
                score: finalScoreValue,
                dataEhora: dataDoMomentoAtual.toString()
            });
            console.log("Recorde Atualizado!")
        }
        else{
            console.log("Recorde Não Atualizado!")
        }
};


const gameOver = () => {
    if(finalizado) return;
    direction = undefined
    finalScore.innerText = score.innerText;

    menu.style.display = "flex"; // faz o menu de game over aparecer
    
    canvas.style.filter = "blur(2px)"; // põe um embaçado na imagem de fundo do jogo
    inserirPontosNoFirebase();
    finalizado = true;
}





const getRecorde = async () => {
  const database = getDatabase();
  const recordeRef = ref(database, 'recorde'); // Referência para o nó 'recorde'

  try {
    const recordeSnapshot = await get(recordeRef); // Obtém os dados do nó 'recorde'
    const recordeData = recordeSnapshot.val(); // Converte o snapshot em dados

    // Itera sobre os IDs sob 'recorde' para obter o último recorde
    let ultimoRecorde = null;
    for (const key in recordeData) {
      if (recordeData.hasOwnProperty(key)) {
        ultimoRecorde = recordeData[key];
      }
    }

    if (ultimoRecorde) {
      const recordeScore = ultimoRecorde.score;
      valorDoRecord = recordeScore;
      //console.log("Recorde:", valorDoRecord);
      record.innerHTML = "Record: "+ valorDoRecord;
    } else {
      console.log("Sem recorde encontrado.");
    }
  } catch (error) {
    console.error("Erro ao obter o recorde:", error);
  }
}


getRecorde(); // atualiza o valor do recorde


const delayDojogo = 400; // delay que influencia na velocidade do jogo
const gameLoop=()=>{ // função que gera o loop principal do jogo
    
    //console.log(label);

    clearInterval(loopId)// para o loop cujo o IDs foi informado no argumento pela variável loopId
    ctx.clearRect(0,0,canvas.width,canvas.height)//limpa o canvas (onde são desenhados os elementos do jogo)
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
    checkEat();
    checkCollision();

    loopId = setTimeout( ()=>{
        gameLoop();
    },delayDojogo);// chama a própria função a cada vez que se passar 300 milisegundos
}

gameLoop();

document.addEventListener("keydown",({key})=>{ // já recebe a key do envento, ou seja, já recebe a tecla do evento
    //console.log(key);
    if(key=="ArrowRight"&&direction!="left") direction="right";
    if(key=="ArrowLeft"&&direction!="right") direction="left";
    if(key=="ArrowDown"&&direction!="up") direction="down";
    if(key=="ArrowUp"&&direction!="down") direction="up";
});

buttonPlay.addEventListener("click",()=>{
    direction = undefined;//força para a cobrinha reiniciar o jogo sempre parada
    snake = [initialPosition];// reinicia a cobrinha
    score.innerText = "00";//reinicia a pontuação do jogo (o score)
    menu.style.display = "none";//oculta a tela de menu que aparece no game over
    canvas.style.filter = "none"; //tira o embaçado que aparece no game over
    getRecorde();
    direcaoAnterior = "";
    finalizado = false;

});

