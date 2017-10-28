/**
 * 贪吃蛇数据结构
 */

var dotSize = 12;

/**
 * 基本像素点
 * @x: <Number> 点横坐标
 * @y: <Number> 点纵坐标
 * return: <Dot> 点实例
 */
function Dot(x, y) {
    this.x = x;
    this.y = y;
    this.light = false;
    var el = document.createElement('i');
    el.setAttribute('class', 'dot');
    this.el = el;
};
Dot.prototype.turnOn = function () {
    this.light = true;
    this.el.setAttribute('class', 'dot on');
};
Dot.prototype.turnOff = function () {
    this.light = false;
    this.el.setAttribute('class', 'dot');
};


/**
 * 构造舞台
 * @target: <DOM Element> 插入舞台的节点
 * @width: <Number> 舞台宽度，像素数量
 * @height: <Number> 舞台高度，像素数量
 * return: <Stage> 舞台实例
 */
function Stage(target, width, height) {

    this.width = width;
    this.height = height;

    // 构造点阵
    var dots = [];
    for (var i = 0; i < height; i++) {
        var cols = [];
        for (var j = 0; j < width; j++) {
            var dot = new Dot(j, i);
            cols.push(dot);
            target.appendChild(dot.el);
        }
        dots.push(cols);
    }
    target.style.width = width * dotSize + 'px';
    target.style.height = height * dotSize + 'px';

    this.dots = dots;
}


/**
 * 构造游戏
 * @stage: <Stage> 舞台对象
 * return: 游戏实例
 */
function Game(stage) {
    this.stage = stage;

    // 构造蛇
    var snake = new Snake(stage);
    this.snake = snake;
    this.watchingYou(snake);

}
Game.prototype.start = function () {
    this.snake.move();
};
Game.prototype.reStart = function () {
    this.snake.destroy();
    this.snake.init();
};
Game.prototype.pause = function () {
    clearTimeout(this.snake.timmer);
};
Game.prototype.resume = function () {
    this.snake.move();
};
Game.prototype.watchingYou = function (observer) {
    observer.beWatchedBy(this);
};
Game.prototype.recieveMsg = function (msg) {
    console.log(msg);
};


/**
 * 构造蛇
 * @stage: <Stage> 舞台对象
 * return: 蛇的实例
 */
function Snake(stage) {
    this.config = {
        speed: 200
    };
    this.stage = stage;
    this.dots = stage.dots;
    this.body = [];  //蛇身体集合
    this.head = null;  //蛇头
    this.length = this.body.length;
    this.direction = 'right';  //up,left,right,down
    this.directionBuffer = [];  //缓存方向改变
    this.length = this.body.length;
    this.watcher = [];  // 观察者模式
    this.timmer = null;  // 移动循环定时器

    this.init();
}
// 观察者模式
Snake.prototype.beWatchedBy = function (watcher) {
    this.watcher.push(watcher);
};
Snake.prototype.sendMsg = function (msg) {
    this.watcher.forEach(function (item) {
        item.recieveMsg(msg);
    });
};
// 初始化
Snake.prototype.init = function () {
    this.direction = 'right';
    this.body = [this.dots[1][7], this.dots[1][6], this.dots[1][5], this.dots[1][4], this.dots[1][3]];
    this.refresh();
    for (var i = 0; i < this.length; i++) {
        this.body[i].turnOn();
    }
    this.randomFood();
};
Snake.prototype.destroy = function () {
    for (var i = 0; i < this.length; i++) {
        this.body[i].turnOff();
    }
    this.body = [];
    this.food.turnOff();
    this.food = null;
};
Snake.prototype.refresh = function () {
    this.head = this.body[0];
    this.length = this.body.length;
};
Snake.prototype.randomFood = function () {
    var that = this;
    function getRandomDot() {
        var randomX = Math.floor(Math.random() * this.stage.width);
        var randomY = Math.floor(Math.random() * this.stage.height);
        var randomDot = that.dots[randomY][randomX];
        // 判断食物是否跟蛇冲突
        if (randomDot.light) {
            return getRandomDot();
        }
        return randomDot;
    }
    var food = getRandomDot();
    food.turnOn();
    this.food = food;

};
Snake.prototype.moveToNext = function () {
    var newX = this.head.x;
    var newY = this.head.y;
    if (this.directionBuffer.length > 0) {
        this.direction = this.directionBuffer.shift();
    }
    switch (this.direction) {
        case 'up':
            newY = newY - 1;
            break;
        case 'down':
            newY = newY + 1;
            break;
        case 'left':
            newX = newX - 1;
            break;
        case 'right':
            newX = newX + 1;
            break;
    }
    // kill by wall
    var maxX = this.stage.width - 1;
    var maxY = this.stage.height - 1;
    if (newX > maxX || newX < 0 || newY > maxY || newY < 0) {
        this.sendMsg('snake killed by wall');
        clearTimeout(this.timmer);
        return;
    }
    var newHead = this.dots[newY][newX];
    // kill by self
    if (this.body.indexOf(newHead) > 0) {
        this.sendMsg('snake killed by self');
        clearTimeout(this.timmer);
        return;
    }

    // move
    this.body.unshift(newHead);
    newHead.turnOn();
    // eat
    if (newHead === this.food) {
        this.randomFood();
    } else {
        var loss = this.body.pop();
        loss.turnOff();
    }

    this.refresh();
};
Snake.prototype.move = function () {
    var that = this;
    this.timmer = setInterval(function () {
        that.moveToNext();
    }, this.config.speed);
};
Snake.prototype.changeDirection = function (direction) {
    var d = ['up', 'left', 'right', 'down'];
    var index = d.indexOf(direction);
    if ( index === -1 || index + d.indexOf(this.direction) === 3) {
        return;
    }
    if (this.directionBuffer.length < 4 && this.directionBuffer.slice(-1) !== direction) {
        this.directionBuffer.push(direction);
    }
};

