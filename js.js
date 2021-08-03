"use strict";
const settings = { //объект настроек
  rowsCount: 21, //количество строк игрового поля
  colsCount: 21, //количество столбцов игрового поля
  speed: 2, //скорость змейки
  winFoodCount: 50, //количество еды для победы 
};

const config = { //объект config отвечает за валидацию settings, переопределение данных
  settings,

  init(userSettings) { // изменение settings на userSettings
    Object.assign(this.settings, userSettings);
  },

  getRowsCount() { // переопределение количество строк
    return this.settings.rowsCount;
  },

  getColsCount() { // переопределение данных колонок
    return this.settings.colsCount;
  },

  getSpeed() { // переопределение значения скорости змейки
    return this.settings.speed;
  },

  getWinFoodCount() { // переопределение количества еды для победы 
    return this.settings.winFoodCount;
  },

  validate() { // метод валидации проверяет значения полей settings 
    const result = {
      isValid: true,
      errors: [], // поле отвечает за перечень ошибок
    };

    if (this.getRowsCount() < 10 || this.getRowsCount() > 30) { //проверка диапозона кол-во строк 10-30
      result.isValid = false;
      result.errors.push('Неверные настройки, значение rowsCount должно быть в диапазоне [10, 30].');
    }

    if (this.getColsCount() < 10 || this.getColsCount() > 30) { //проверка диапозона кол-ва колонок
      result.isValid = false;
      result.errors.push('Неверные настройки, значение colsCount должно быть в диапазоне [10, 30].');
    }

    if (this.getSpeed() < 1 || this.getSpeed() > 10) { // проварка диапозона скорости [1, 10]
      result.isValid = false;
      result.errors.push('Неверные настройки, значение speed должно быть в диапазоне [1, 10].');
    }

    if (this.getWinFoodCount() < 5 || this.getWinFoodCount() > 50) { // проверка съеденной еды [5, 50]
      result.isValid = false;
      result.errors.push('Неверные настройки, значение winFoodCount должно быть в диапазоне [5, 50].');
    }

    return result;
  },
};

const map = { //создание объекта, в котором строится игровое поле
  cells: {}, // объект, в котором хранится вся инф-я обо всех ячейках
  usedCells: [], //массив, в котором хранится инф-я об использованных ячейках (например, еда, хвостик змейки)

  init(rowsCount, colsCount) { // метод init принимает кол-во строк и колонок
    const table = document.getElementById('game'); //получить инф-ю о таблице по id (в html)
    table.innerHTML = ''; //очищаем таблицу

    this.cells = {}; // очищаем объект, в котором мы храним информацию обо всех ячейках
    this.usedCells = []; // очищаем массив

    // генерируем поле
    for (let row = 0; row < rowsCount; row++) { //генерируем строки
      const tr = document.createElement('tr'); // создаем элемент tr, определяющего строку ячеек в таблице
      tr.classList.add('row'); //добавили класс строки
      table.appendChild(tr); //добавили строку в таблицу

      for (let col = 0; col < colsCount; col++) { //генерируем колонки
        const td = document.createElement('td'); //создаем эелемент td, определяющего данные в ячейке таблицы
        td.classList.add('cell'); //добавили класс ячейки
        tr.appendChild(td); //добавили td в tr

        //создаем ключ, который построен на основе координат (головы змейки)
        this.cells[`x${col}_y${row}`] = td; //как храним информацию в ячейках, вид ключей
      }
    }
  },

  // render - метод, который вызывается для актуализации всех объектов на карте, 
  //каждый раз при вызове перерисовывает все элементы
  render(snakePointsArray, foodPoint, barrierPoint) { //snakePointsArray - змейка в виде массива из координат xy, 
    //snakePointsArray[0] - голова змейки
    //foodPoint - еда, объект с одной ячейкой xy
    for (const cell of this.usedCells) { //пробегаемся по всем использованным ячейкам
      cell.className = 'cell'; //каждой ячейки проставляем класс пустой ячейки, все элементы после этого сотрутся с игрового поля
    }

    this.usedCells = []; //обнуляем использованные ячейки

    snakePointsArray.forEach((point, index) => {  //point - часть(точка) змейки, по index определяем тело или голова
      const snakeCell = this.cells[`x${point.x}_y${point.y}`]; //определяем ячейку змейки по координатам
      snakeCell.classList.add(index === 0 ? 'snakeHead' : 'snakeBody'); //тернальный оператор: если index=0, то это snakeHead, иначе - snakeBody
      this.usedCells.push(snakeCell); //добавляем методом .push в массив usedCells ячейки snakeCell
    });

    const foodCell = this.cells[`x${foodPoint.x}_y${foodPoint.y}`]; // добавл. инф.(координаты точки) об ячейке еды
    foodCell.classList.add('food'); // добавляем класс 'food'
    this.usedCells.push(foodCell); // добавляем методом .push в массив usedCells ячейку foodCell
  
    const barrierCell = this.cells[`x${barrierPoint.x}_y${barrierPoint.y}`]; // добавл. инф.(координаты точки) об ячейке препятствия
    barrierCell.classList.add('barrier'); // добавляем класс 'barrier'
    this.usedCells.push(barrierCell); // добавляем методом .push в массив usedCells ячейку barrierCell
  },

};

const snake = { //создание объекта зейки
  body: [], //тело -массив из ячеек (координат xy)
  direction: null, //текущеее направление движения
  lastStepDirection: null,  //какое было последнее направление для валидации смены направления (можем поворач. только на 90 гардусов)

  init(startBody, direction) { //инициализация стартовой позиции змейки и направления
    this.body = startBody;
    this.direction = direction;
    this.lastStepDirection = direction;
  },

  getBody() { //метод получения информации о body змейки
    return this.body;
  },

  getLastStepDirection() { //метод получения о последнем направлении змейки
    return this.lastStepDirection;
  },

  setDirection(direction) { //смена направления змейки в процессе игры
    this.direction = direction;
  },

  isOnPoint(point) { //метод проверки есть ли переданная ячейка (point(xy))  в теле змейки
    return this.getBody().some((snakePoint) => { // .some() -метод возвращает True или False
      return snakePoint.x === point.x && snakePoint.y === point.y; // True - если хотя бы одна пара xy найдена в змеике
    });
  },

  makeStep() { // метод описания перемещения змейки (добавляем нулевой элемент в массиве(голова), а хвостик сдвигается влево)
    this.lastStepDirection = this.direction;
    this.getBody().unshift(this.getNextStepHeadPoint()); //через unshift добавл. в массив новую точку головы(а ее получаем в getNextStepHeadPoint())
    this.getBody().pop(); //с конца (справа в массиве) удаляется точка
  },

  growUp() { //отравщивание хвоста змейки
    const lastBodyIdx = this.getBody().length - 1; //получение индекса хвоста (индекса последнего элемента в массиве)
    const lastBodyPoint = this.getBody()[lastBodyIdx]; //получаем сам эелемент массива (координаты xy)
    const lastBodyPointClone = Object.assign({}, lastBodyPoint); //создаем копию этого эемента(хвостика)

    this.getBody().push(lastBodyPointClone); //добавляем этот клон в массив змеи, у нас будут 2 ячейки с одинаковыми координатами
  },

  getNextStepHeadPoint() { //метод получения координат головы, когда совершили движение
    const firstPoint = this.getBody()[0]; //получение текущих координат головы (firstPoint)
    switch (this.direction) {
      case 'up':
        return { x: firstPoint.x, y: firstPoint.y - 1 };
      case 'right':
        return { x: firstPoint.x + 1, y: firstPoint.y };
      case 'down':
        return { x: firstPoint.x, y: firstPoint.y + 1 };
      case 'left':
        return { x: firstPoint.x - 1, y: firstPoint.y };
    }
  },
};

const food = { //объект еды описываем координатами 
  x: null,
  y: null,

  getCoordinates() { //метод getCoordinates возвращает эти коодинат
    return {
      x: this.x,
      y: this.y,
    };
  },

  setCoordinates(point) { //метод устанавливает координаты еды
    this.x = point.x;
    this.y = point.y;
  },

  isOnPoint(point) { //проверяем координты (съели/несъели), передаем точку с координатами
    return this.x === point.x && this.y === point.y; //проверяем если текущ. координта еды совпадает с переданной
    // точкой, то метод вернет TRUE, что означает, мы попали головой на еду, и нам надо ее съесть и поставить на говое место
  },
};

const barrier = { //объект препятствия описываем координатами 
  x: null,
  y: null,

  getCoordinates() { //метод getCoordinates возвращает эти коодинат
    return {
      x: this.x,
      y: this.y,
    };
  },

  setCoordinates(point) { //метод устанавливает координаты препятствия
    this.x = point.x;
    this.y = point.y;
  },

  isOnPoint(point) { //проверяем координты (передаем точку с координатами)
    return this.x === point.x && this.y === point.y; //проверяем если текущ. координты препятствия совпадает с переданной
    // точкой, то метод вернет TRUE, что означает, мы попали головой на препятствие
  },
};

const status = { //описание статуса игры 
  condition: null, //состояние игры по умолчаению null

  setPlaying() { //перевод игры(установить состояние игры) в 'playing'
    this.condition = 'playing';
  },

  setStopped() { //перевод игры в 'stopped'
    this.condition = 'stopped';
  },

  setFinished() { //перевод игры в 'finished'
    this.condition = 'finished';
  },

  isPlaying() { //метод проверки состояния 'playing'
    return this.condition === 'playing';
  },

  isStopped() { //метод проверки состояния 'stopped'
    return this.condition === 'stopped';
  },
};

const scoreCount = { //создаем объект счетчика
  score: 0, //переменная счетчика

  init() {
    this.renderScore();
  },

  renderScore() {
    const scoreElement = document.getElementById('scoreBlock').firstChild;
    scoreElement.nodeValue = 'Ваши очки: ' + this.score;
  },

  incrementScore() {
    this.score++;

    this.renderScore();
  }
};

const game = { //собираем объекты в единый объект игры game
  config,
  map,
  snake,
  food,
  barrier,
  status,
  tickInterval: null,
  scoreCount,

  init(userSettings = {}) { //инициализация настроек 
    this.config.init(userSettings); ////объект config отвечает за валидацию settings, переопределение данных
    const validation = this.config.validate(); //записываем результата валидации

    if (!validation.isValid) { //проверяем если не isValid, выводим сообщение об ошибке
      for (const err of validation.errors) {
        console.error(err);
      }
      return; //если ошибка, прерываем игру
    }

    this.map.init(this.config.getRowsCount(), this.config.getColsCount()); //инициализирууем карту, обращ. к map

    this.scoreCount.init();

    this.setEventHandlers();
    this.reset(); //сброс игры (описан приблизительно на 294 строчке)
  },

  setEventHandlers() { //обработчик события
    document.getElementById('playButton').addEventListener('click', () => { //по клику  будет срабатывать метод
      this.playClickHandler();//playClickHandler()
    });
    document.getElementById('newGameButton').addEventListener('click', () => { //по клику  будет срабатывать метод
      this.newGameClickHandler();//newGameClickHandler()
    });
    document.addEventListener('keydown', (event) => this.keyDownHandler(event)); //движение по стрелкам клавиатуры
  },

  playClickHandler() { // во время клика по кнопке play, запускаем игру, если статус isStoped
    if (this.status.isPlaying()) this.stop(); //запускаем игру, если статус isStopped
    else if (this.status.isStopped()) this.play(); // запускается метод play
  },

  newGameClickHandler() {
    this.reset(); //вызываем метод reset(сброс игры)
  },

  keyDownHandler(event) {
    if (!this.status.isPlaying()) return; //выходим из этой функции, если находимся не в статусе игры

    const direction = this.getDirectionByCode(event.code); //получили направление

    if (this.canSetDirection(direction)) this.snake.setDirection(direction); //если canSetDirection вернул true,то в snake.setDirection передаем направление 
  },

  getDirectionByCode(code) { //метод - получать направление в зависимости от кода клавиши
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        return 'up';
      case 'KeyD':
      case 'ArrowRight':
        return 'right';
      case 'KeyS':
      case 'ArrowDown':
        return 'down';
      case 'KeyA':
      case 'ArrowLeft':
        return 'left';
    }
  },

  canSetDirection(direction) { //метод описывает логику движения , возвращает булево выражение
    const lastStepDirection = this.snake.getLastStepDirection();

    return direction === 'up' && lastStepDirection !== 'down' ||
      direction === 'right' && lastStepDirection !== 'left' ||
      direction === 'down' && lastStepDirection !== 'up' ||
      direction === 'left' && lastStepDirection !== 'right';
  },

  reset() { //метод сброса игры
    this.stop(); //останавливаем игру
    this.snake.init(this.getStartSnakeBody(), 'up'); //инициализируем змейку
    this.food.setCoordinates(this.getRandomFreeCoordinates()); //инициализируем еду
    this.barrier.setCoordinates(this.getRandomFreeCoordinates()); //инициализируем препятствие
    this.render()
  },

  getStartSnakeBody() { //создаем голову змейки, приблизительно центр поля
    return [
      {
        x: Math.floor(this.config.getColsCount() / 2),
        y: Math.floor(this.config.getRowsCount() / 2),
      }
    ];
  },

  getRandomFreeCoordinates() { // метод рандомно создает координаты еды 
    const exclude = [this.food.getCoordinates(), this.barrier.getCoordinates(), ...this.snake.getBody()]; //собираем все уже занятые координтаты

    while (true) {
      const rndPoint = { //генерируем точку
        x: Math.floor(Math.random() * this.config.getColsCount()),
        y: Math.floor(Math.random() * this.config.getRowsCount()),
      }

      if (!exclude.some((exPoint) => exPoint.x === rndPoint.x && exPoint.y === rndPoint.y)) return rndPoint;
    } // сравниваем координаты если .some вернет false, это означ проверка true 
  },

  play() {
    this.status.setPlaying();
    this.tickInterval = setInterval(() => { //запускаем tickInterval, передаем функцию 
      this.tickHandler(); //каждый тик отрабатывается в tickHandler
    }, 1000 / this.config.getSpeed());// и скорость игры 
    this.setPlayButton('Стоп');
  },

  stop() {
    this.status.setStopped(); //игра переводится в статус 'стоп'
    clearInterval(this.tickInterval); //очистить интервал текущего процесса и передаем в него идентификатор запущенного процесса (tickInterval)
    this.setPlayButton('Старт'); //у кнопки старт/стоп установить 'Старт'
  },

  finish() { //метод finish
    this.status.setFinished();
    clearInterval(this.tickInterval);
    this.setPlayButton('Игра закончена', true);
  },

  tickHandler() { // в tickHandler() проверяем можем ли мы двигаться, если не можем, переводим игру в finish
    if (!this.canMakeStep() || this.barrier.isOnPoint(this.snake.getNextStepHeadPoint()))  return this.finish(); //если не можем ходить, то переводим в finish
    if (this.food.isOnPoint(this.snake.getNextStepHeadPoint())) { // если столкнулись с едой, то едим 
      this.snake.growUp(); // змейка увеличивается
      this.food.setCoordinates(this.getRandomFreeCoordinates()); //еда перерисовывается

      if (this.isGameWon()) this.finish(); //если победили , то переводим в финиш
      this.scoreCount.incrementScore();
    }


    this.snake.makeStep();//если не выиграли , то двигаем змейку
    this.render();
  },

  canMakeStep() { //метод проверяет можем ли мы двигаться в этом направлении или нет(границы поля, не укусит ли змейка себя)
    const nextHeadPoint = this.snake.getNextStepHeadPoint();
    return !this.snake.isOnPoint(nextHeadPoint) &&  // проверяем не попали ли на тело змейки
      nextHeadPoint.x < this.config.getColsCount() && //не вышли за поле
      nextHeadPoint.y < this.config.getRowsCount() && //не вышли за поле
      nextHeadPoint.x >= 0 && //не вышли за поле
      nextHeadPoint.y >= 0; ///не вышли за поле
  },

  isGameWon() { //метод проверяет массив змейки с ее выигрышным размером 
    return this.snake.getBody().length > this.config.getWinFoodCount();
  },

  setPlayButton(text, isDisabled = false) { //передается два параметра -текст кнопки и isDisabled(кнопка визуально заблокирована, когда переводим в состояние старт)
    const playButton = document.getElementById('playButton'); //получаем id кнопки

    playButton.textContent = text; // в playButton поставим textContent, который равен переданному значению text

    isDisabled // проверяем если  isDisabled существует (true)
      ? playButton.classList.add('disabled') //то у playButton в classList добавляем 'disabled'
      : playButton.classList.remove('disabled'); //иначе в classList удаляем 'disabled'
  },

  render() {
    this.map.render(this.snake.getBody(), this.food.getCoordinates(), this.barrier.getCoordinates());
  },
};

game.init();


