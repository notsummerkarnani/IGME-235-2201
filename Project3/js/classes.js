class Ship extends PIXI.Sprite{
    constructor(x=0, y=0){
        super(app.loader.resources["images/Donut.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}

class Enemy extends PIXI.Sprite{
    constructor(radius, x=0, y=0){
        super(app.loader.resources["images/enemy.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(0.1);


        this.x = x;
        this.y = y;
        this.radius = radius;
        
        //variables
        this.angularSpeed = 0;
        this.fwd = {x:-Math.cos(this.angularSpeed), y:-Math.sin(this.angularSpeed)};
        this.speed = 200;
        this.isAlive = true;
    }

    move(dt=1/60){
        this.angularSpeed += .3 * Math.random();

        this.x += this.fwd.x * this.speed * dt;
        this.y += Math.sin(this.angularSpeed)*2;
    }

    reflectX(){
        this.fwd.x *= -1;
    }
}

class bullet extends PIXI.Graphics{
    constructor(color=0xFFFFFF, x=0, y=0, dir){
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,4,6);
        this.endFill();
        this.x = x;
        this.y = y;

        //variables
        this.dirVector = dir;
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt=1/60){
        this.x += this.dirVector.x * this.speed * dt;
        this.y += this.dirVector.y * this.speed * dt;
    }
}

class Circle extends PIXI.Sprite{
    constructor(radius, x=0, y=0){
        super(app.loader.resources["images/enemy2.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(0.1);

        this.x = x;
        this.y = y;
        this.radius=radius;
        
        //variables
        this.fwd = getRandomUnitVector();
        this.speed = 100;
        this.isAlive = true;
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX(){
        this.fwd.x *= -1;
    }

    reflectY(){
        this.fwd.y *= -1;
    }
}

class Tracker extends PIXI.Sprite{
    constructor(radius,x=0, y=0){
        super(app.loader.resources["images/enemy3.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(0.1);

        this.x = x;
        this.y = y;
        this.radius=radius;
        
        //variables
        this.fwd = getRandomUnitVector();
        this.speed = 100;
        this.isAlive = true;
    }

    move(dt=1/60, object){
        this.fwd.x = object.x-this.x;
        this.fwd.y = object.y-this.y;

        let magnitude = Math.sqrt((this.fwd.x*this.fwd.x) + (this.fwd.y*this.fwd.y))

        this.x += (this.fwd.x/magnitude) * this.speed * dt;
        this.y += (this.fwd.y/magnitude) * this.speed * dt;
    }

    reflectX(){
        this.fwd.x *= -1;
    }

    reflectY(){
        this.fwd.y *= -1;
    }
}

class rocket extends PIXI.Graphics{
    constructor(color=0xDD0000, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,16,16);
        this.endFill();
        this.x = x;
        this.y = y;

        //variables
        this.fwd = {x:0,y:0};
        this.speed = 200;
        this.isAlive = true;
    }

    move(dt=1/60, enemies){
        let index=0;
        let enemy = enemies[index];

        while(!enemy.isAlive && enemies[index+1]){
            index++;
            enemy = enemies[index];
        }

        this.fwd.x = enemy.x-this.x;
        this.fwd.y = enemy.y-this.y;

        let magnitude = Math.sqrt((this.fwd.x*this.fwd.x) + (this.fwd.y*this.fwd.y))

        this.x += (this.fwd.x/magnitude) * this.speed * dt;
        this.y += (this.fwd.y/magnitude) * this.speed * dt;
    }
}

class PowerUp extends PIXI.Sprite{
    constructor(x=0, y=0){
        super(app.loader.resources["images/heart.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(0.3);
        this.x = x;
        this.y = y;

        this.isAlive = true;
    }
}