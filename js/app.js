const FPS = 30;
const ROUND_TIME = 60;
const NEEDLE_HEIGHT = 70;
const COLORS = [
  ['#ffeee6', '#f5c8b3'],
  ['#fffbd0', '#fff252'],
  ['#d5fdcb', '#75ff52'],
  ['#e2b8fd', '#a558d6'],
  ['#fdbed2', '#ff528a'],
  ['#a99dec', '#320ff3'],
  ['#f5abab', '#f30f0f'],
  ['#f9dfc9', '#f97605'],
  ['#4fd265', '#065814']
];

const Stage = document.getElementById('stage');
const Needle = document.getElementById('needle');
const Timer = document.getElementById('timer');
const Scoreboard = document.getElementById('score');
const Bursted = document.getElementById('bursted');
const Missed = document.getElementById('missed');

const StartButton = document.getElementById('start');
StartButton.addEventListener('click', startGame);

const RestartButton = document.getElementById('restart');
RestartButton.addEventListener('click', restartGame);

async function startGame()
{
  StartButton.setAttribute('style', 'display: none;');
  Needle.setAttribute('style', `transform: translate(${window.innerWidth / 2}px, 0px); display: block`);
  Timer.setAttribute('style', 'display: block;');
  Stage.addEventListener('mousemove', moveNeedle);

  const round = new Round(ROUND_TIME);
  round.start();
}

function restartGame() 
{
  Scoreboard.setAttribute('style', 'display: none;');
  startGame();
}

function moveNeedle() 
{
  const posX = event.clientX;
  
  if (posX < Stage.clientWidth - Needle.clientWidth) {
    Needle.style.transform = `translate(${posX}px, 0px)`;
  }
}

class Round
{
  constructor(time) 
  {
    this.time = time;
    this.endRound = false;
    this.missed = 0;
    this.bursted = 0;
    this.speedRate = 1;
    this.creationTime = 1000;
    this.wind = this.generateWind();
  }

  async start()
  {
    const timer = setInterval(() =>
    {
      this.time--;
      Timer.innerHTML = this.time >= 10 ? `00 : ${this.time}` : `00 : 0${this.time}`;

      if (this.time <= 0) {
        this.endRound = true;
        clearInterval(difficulty);
        clearInterval(timer);
      }
    }, 1000);

    const difficulty = setInterval(() =>
    {
      this.speedRate += 0.1;
      this.creationTime -= 60;
    }, 4000);

    const flow = setInterval(() =>
    {
      let bubles = Stage.childNodes;
      
      if (bubles.length > 0) {
        for (const buble of bubles) {
          const isCollision = Buble.checkCollision(buble);
          
          if (isCollision) {   
            this.bursted++;         
            Stage.removeChild(buble);
            continue;
          }

          const height = Number.parseInt(buble.style.height);
          const isOut = Number.parseInt(buble.dataset.posY) + height < -height - 10;
          
          if (isOut) {
            this.missed++;
            Stage.removeChild(buble);
          } else {
            const speed = Number.parseInt(buble.dataset.speed);            
            buble.dataset.posY = (buble.dataset.posY - (speed + this.speedRate)).toFixed(1);
            buble.style.transform = `translate(${buble.dataset.posX}px, ${buble.dataset.posY}px)`;
          }
        }
      } else if (bubles.length === 0 && this.endRound) {
        clearInterval(flow);
        this.end();
      }
    }, 1000 / FPS);

    // init wind
    for (const airflow of this.wind) {
      setTimeout(() => {
        const viewport = document.body.clientWidth;
        const bubles = Stage.childNodes;

        if (airflow.direction === 0) {
          for (const buble of bubles) {
            const posX = buble.getBoundingClientRect().left;
            const offset = Math.round((viewport - posX) / 3);
            const nextPosition = Number.parseInt(buble.dataset.posX) + offset;

            if (nextPosition >= viewport - buble.style.width) {
              buble.dataset.posX = viewport - buble.style.width;
            } else {
              buble.dataset.posX = nextPosition;
            }
          }
        }

        if (airflow.direction === 1) {
          for (const buble of bubles) {
            const posX = buble.getBoundingClientRect().left;
            const offset = Math.round(posX / 3);
            const nextPosition = Number.parseInt(buble.dataset.posX) - offset;

            if (nextPosition <= 0 ) {
              buble.dataset.posX = 0;
            } else {
              buble.dataset.posX = nextPosition;
            }
          }
        }
      }, airflow.time);
    }

    // loop for increase balls amount
    while (this.time > 0) {
      await createBuble(this.creationTime);
    }

    function createBuble(delay)
    {
      return new Promise(resolve => {
        setTimeout(() => {
          Stage.appendChild(Buble.create());
          resolve();
        }, delay);
      })
    }
  }

  end() 
  {
    Bursted.innerText = this.bursted;
    Missed.innerText = this.missed;

    Needle.setAttribute('style', 'display: none;');
    Stage.removeEventListener('mousemove', moveNeedle);
    Timer.setAttribute('style', 'display: none;');
    Scoreboard.setAttribute('style', 'display: flex;');
  }

  generateWind() 
  {
    const wind = [];
    let counter = 0;

    while (true) {
      const time = Math.round((Math.random() * 5 + 3));
      counter += time;

      if (counter >= ROUND_TIME) {
        break;
      } else {
        const airstream = {
          time: counter * 1000,
          direction: Math.round((Math.random() * 1))
        }
  
        wind.push(airstream);
      }
    }

    return wind;
  }
}

class Buble
{
  constructor() {}

  static create()
  {
    const width = Math.round(40 + Math.random() * 60);
    const height = width;
    const posX = Math.round(Math.random() * (document.body.clientWidth - width));
    const posY = document.body.clientHeight + 10;
    const color = Math.round(Math.random() * (COLORS.length - 1));
    const speed =  Math.round(Math.random() * 12 + 1) / 10;
    
    const attrWidth = `width: ${width}px;`;
    const attrHeight = `height: ${height}px;`;
    const attrPosition = `transform: translate(${posX}px, ${posY}px);`;
    const attrColor = `background: radial-gradient(ellipse at left top, ${COLORS[color][0]} 20%, ${COLORS[color][1]} );`;

    const buble = document.createElement('div');
    buble.className = 'buble';
    buble.setAttribute('style', attrWidth + attrHeight + attrPosition + attrColor);
    buble.dataset.speed = speed;
    buble.dataset.posX = posX;
    buble.dataset.posY = posY;

    return buble;
  }

  static checkCollision(obj)
  {
    const objRect = obj.getBoundingClientRect();
    const objX = objRect.left;
    const objY = objRect.top.toFixed(0);
    const needlePos = Needle.getBoundingClientRect().left;

    return (objY > 0 && objY <= NEEDLE_HEIGHT) && (needlePos >= objX && needlePos <= objX + obj.clientWidth);
  }
}