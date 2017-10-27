/**
* 贪吃蛇数据结构
*/

var dotSize = 10;

// 基本像素点
function Dot(x, y) {
	this.x = x;
	this.y = y;
	this.light = false;
	var el = document.createElement('i');
	el.setAttribute('class', 'dot');
	this.el = el;
}
Dot.prototype.turnOn = function() {
	this.light = true;
	this.el.setAttribute('class', 'dot on');
}
Dot.prototype.turnOff = function() {
	this.light = false;
	this.el.setAttribute('class', 'dot');
}

// 舞台
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

// 游戏
function Game(stage) {
	this.stage = stage;
	// 构造蛇
	var snake = new Snake(stage);
	this.snake = snake;
	this.watchingYou(snake);

}
Game.prototype.start = function() {
	this.snake.move();
}
Game.prototype.watchingYou = function(observer) {
	observer.beWatchedBy(this);
}
Game.prototype.recieveMsg = function(msg) {
	console.log(msg);
}

// 蛇
// @stage: 舞台点阵
// @body: 数组，点集
function Snake(stage) {
	this.config = {
		speed: 500,
	};
	this.dots = stage.dots;
	this.maxX = stage.width - 1;
	this.maxY = stage.height - 1;
	this.body = [];
	this.direction = 'right';  //up,left,right,down
	this.length = this.body.length;

	this.watcher = [];// 观察者模式

	this.timmer = null;

	this.init();
}
Snake.prototype.beWatchedBy = function(watcher) {
	this.watcher.push(watcher);
}
Snake.prototype.sendMsg = function(msg) {
	this.watcher.forEach(function(item) {
		item.recieveMsg(msg)
	});
}
Snake.prototype.init = function() {
	this.body = [this.dots[5][6],this.dots[6][6],this.dots[7][6],this.dots[8][6]];
	this.refresh();
}
Snake.prototype.refresh = function() {
	this.head = this.body[0];
	this.length = this.body.length;
	for (var i = 0; i < this.length; i++) {
		this.body[i].turnOn();
	}
}
Snake.prototype.moveToNext = function() {
	var newX = this.head.x;
	var newY = this.head.y;
	switch(this.direction) {
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
	if (newX > this.maxX || newX < 0 || newY > this.maxY || newY < 0) {
		this.sendMsg('snake dead');
		clearTimeout(this.timmer);
		return;
	}
	var newHead = this.dots[newY][newX];
	this.body.unshift(newHead);
	var loss = this.body.pop();
	loss.turnOff();

	this.refresh();
}
Snake.prototype.move = function() {
	var that = this;
	this.timmer = setInterval(function() {
		that.moveToNext();
	}, this.config.speed);
}
Snake.prototype.eat = function() {
	
}
Snake.prototype.block = function(){};
