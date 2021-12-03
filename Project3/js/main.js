"use strict";

const app = new PIXI.Application({
    width: 900,
    height: 600
});

const sceneWidth = app.view.width
const sceneHeight = app.view.height

window.onload = OnLoad()

function OnLoad(){
    document.body.appendChild(app.view);
    
    // pre-load the images
    app.loader.
        add([
            "images/Donut.png",
            "images/explosions.png",
            "images/heart.png",
            "images/enemy.png",
            "images/enemy2.png",
            "images/enemy3.png",

            //background sprites
            "images/bckgr.png",
            "images/bckgr2.png",
            "images/bckgr3.png"
        ]);
    app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
    app.loader.onComplete.add(setup);
    app.loader.load();

}

//aliases
let stage;

//game variables
let startScene;
let gameScene,ship,scoreLabel,lifeLabel,rocketChargeLabel,shootSound,hitSound,rocketSound,explosionSound,coinSound;
let gameOverScene;

let powerUps = [];
let trackers = [];
let circles = [];
let enemies = [];
let bullets = [];
let rockets = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let rocketCharge = 0;
let bulletCooldown = .3;

let gameOverScoreLabel;

let music;

//Parallax Background varibles
let bckgr1;
let bckgr2;
let bckgr3;
let bgX = 0;
let bgSpeed = 2;

function setup() {
    music = new Howl({
        src: ['sounds/Music.mp3'],
        loop: 'true',
        volume: 0.5,
        autoplay:true
    });

	stage = app.stage;
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
	
	// #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    
	// #4 - Create labels for all 3 scenes
    createLabelsAndButtons();
    
	// #5 - Create ship
    ship = new Ship(0,0);
    gameScene.addChild(ship);
    
	// #6 - Load Sounds
    shootSound = new Howl({
        src: ['sounds/shoot.wav']
    });
    
    hitSound = new Howl({
        src: ['sounds/hit.wav']
    });
    
    rocketSound = new Howl({
        src: ['sounds/rocket.wav']
    });

    explosionSound = new Howl({
        src: ['sounds/fireball.wav'],
        volume: 0.1
    });

    coinSound = new Howl({
        src: ['sounds/coin.wav']
    });

	// #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();    
    
	// #8 - Start update loop
    app.ticker.add(gameLoop);
	
	// #9 - Start listening for click events on the canvas
    app.view.onclick = fireBullet;
    app.view.oncontextmenu = fireRocket;
	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xB5FFE1,
        fontSize: 48,
        fontFamily: "Futura"
    })

    //1 - set up start scene
    
    //1A - make the top start label
    let startLabel1 = new PIXI.Text("PEW-PEW-PEW!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0x222222,
        fontSize: 90,
        fontFamily: 'Futura',
        stroke: 0x18F2B2,
        strokeThickness: 6
    });
    startLabel1.x = 120;
    startLabel1.y = 120;
    startScene.addChild(startLabel1)

    //1B - make the middle start label
    let startLabel2 = new PIXI.Text("PROTECT THE CINNAMON SWIRL!");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 25,
        fontFamily: 'Futura',
        stroke: 0x18F2B2,
        strokeThickness: 2
    })
    startLabel2.x = 235;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    let startLabel3 = new PIXI.Text("Left click for bullets");
    startLabel3.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 25,
        fontFamily: 'Futura',
        stroke: 0x18F2B2,
        strokeThickness: 1
    })
    startLabel3.x = 150;
    startLabel3.y = 450;
    startScene.addChild(startLabel3);

    let startLabel4 = new PIXI.Text("Right click for rockets");
    startLabel4.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 25,
        fontFamily: 'Futura',
        stroke: 0x18F2B2,
        strokeThickness: 1
    })
    startLabel4.x = 500;
    startLabel4.y = 450;
    startScene.addChild(startLabel4);

    //1C - make the start game button
    let startButton = new PIXI.Text("Board your Donut!");
    startButton.style = buttonStyle;
    startButton.x = 250;
    startButton.y = sceneHeight - 230;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup",startGame); 
    startButton.on('pointerover',e=>e.target.alpha = 0.7);
    startButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    //2 - set up gameScene
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 22,
        fontFamily: 'Futura',
        stroke: 0x18F2B2,
        strokeThickness: 1
    })

    //2A - make a score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    //2B - make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 36;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    //2B - make life label
    rocketChargeLabel = new PIXI.Text();
    rocketChargeLabel.style = textStyle;
    rocketChargeLabel.x = 700;
    rocketChargeLabel.y = 5;
    gameScene.addChild(rocketChargeLabel);
    ChargeRocketBy(0);

    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("The Cinnamon Swirl has been destroyed! :(");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 48,
        fontFamily: "Futura",
        stroke: 0x18F2B2,
        strokeThickness: 2
    });
    gameOverText.style = textStyle;
    gameOverText.x = 30;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    
    gameOverScoreLabel = new PIXI.Text(`Your final score: ${score}`);
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Futura",
        stroke: 0x18F2B2,
        strokeThickness: 2
    });
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 310;
    gameOverScoreLabel.y = sceneHeight/2 +20;
    gameOverScene.addChild(gameOverScoreLabel);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Turn back time?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 280;
    playAgainButton.y = sceneHeight - 200;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup",startGame); // startGame is a function reference
    playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);
}

function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    ship.x = 100;
    ship.y = sceneHeight/2;
    loadLevel();
    rocketCharge = 0;

}

function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score: ${score}`;
}

function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life: ${life}%`;
}

function ChargeRocketBy(value){
    rocketCharge+=value;
    rocketChargeLabel.text = `Rockets Charged: ${Math.floor(rocketCharge/5)}`
}

function gameLoop(){
	if (paused) return; // keep this commented out for now
    
    //move background
    updateBckgr();

	// #1 - Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
    
    bulletCooldown -= dt;
	
	// #2 - Move Ship
    let mousePosition = app.renderer.plugins.interaction.mouse.global;
    //ship.position = mousePosition;
    
    let amt = 6 * dt;

    //lerp
    let newX = lerp(ship.x, mousePosition.x, amt);
    let newY = lerp(ship.y, mousePosition.y, amt);

    //keep the ship on the screen with clamp()
    let w2 = ship.width/2;
    let h2 = ship.height/2;
    ship.x = clamp(newX, 0+w2, sceneWidth-w2);
    ship.y = clamp(newY, 0+h2, sceneHeight-h2);
	
	// #3 - Move Enemies
	for(let e of enemies){
        e.move(dt);
        if(e.x <= e.radius || e.x>= sceneWidth-e.radius){
            e.reflectX();
            e.move(dt);
        }
    }

    for(let c of circles){
        c.move(dt);
        if(c.x <= c.radius || c.x>= sceneWidth-c.radius){
            c.reflectX();
            c.move(dt);
        }

        if(c.y <= c.radius || c.y >= sceneHeight-c.radius){
            c.reflectY();
            c.move(dt);
        }
    }

    for(let t of trackers){
        t.move(dt, ship)
    }
	
	// #4 - Move Bullets
	for (let b of bullets){
		b.move(dt);
    }
    
    // Move rockets
    for(let r of rockets){
        if(enemies.length>0){
            r.move(dt,enemies);
        }
        else if(circles.length>0){
            r.move(dt,circles);
        }
        else if(trackers.length>0){
            r.move(dt,trackers);
        }
    }

	
    // #5 - Check for Collisions
    for(let e of enemies){
        //#5A - circles and bullets
        for(let b of bullets){
            if(rectsIntersect(e,b)){
                explosionSound.play();
                createExplosion(e.x,e.y,64,64);
                gameScene.removeChild(e);
                e.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                ChargeRocketBy(1);
            }

            if(b.y<-10) b.isAlive= false;
        }

        // #5B - circles and ship
        if (e.isAlive && rectsIntersect(e, ship)){
            hitSound.play();
            gameScene.removeChild(e);
            e.isAlive = false;
            decreaseLifeBy(20);
        }

        for(let r of rockets){
            if(rectsIntersect(e,r)){
                explosionSound.play();
                createExplosion(e.x,e.y,64,64)
                gameScene.removeChild(e);
                e.isAlive = false;
                r.isAlive = false;
                gameScene.removeChild(r);
                increaseScoreBy(1);
            }
        }
    }

    for(let c of circles){
        //#5A - circles and bullets
        for(let b of bullets){
            if(rectsIntersect(c,b)){
                explosionSound.play();
                createExplosion(c.x,c.y,64,64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                ChargeRocketBy(1);
            }

            if(b.y<-10) b.isAlive= false;
        }

        // #5B - circles and ship
        if (c.isAlive && rectsIntersect(c, ship)){
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }

        for(let r of rockets){
            if(rectsIntersect(c,r)){
                explosionSound.play();
                createExplosion(c.x,c.y,64,64)
                gameScene.removeChild(c);
                c.isAlive = false;
                r.isAlive = false;
                gameScene.removeChild(r);
                increaseScoreBy(1);
            }
        }
    }

    for(let c of trackers){
        //#5A - circles and bullets
        for(let b of bullets){
            if(rectsIntersect(c,b)){
                explosionSound.play();
                createExplosion(c.x,c.y,64,64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                ChargeRocketBy(1);
            }

            if(b.y<-10) b.isAlive= false;
        }

        // #5B - circles and ship
        if (c.isAlive && rectsIntersect(c, ship)){
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }

        for(let r of rockets){
            if(rectsIntersect(c,r)){
                explosionSound.play();
                createExplosion(c.x,c.y,64,64)
                gameScene.removeChild(c);
                c.isAlive = false;
                r.isAlive = false;
                gameScene.removeChild(r);
                increaseScoreBy(1);
            }
        }
    }
    
    for(let p of powerUps){
        if(rectsIntersect(p,ship)){
            p.isAlive = false;
            gameScene.removeChild(p);
            coinSound.play();
            decreaseLifeBy(-20);
        }
    }
	
    // #6 - Now do some clean up
    
    //get rid of used powerups
    powerUps = powerUps.filter(p=>p.isAlive);
    
    // get rid of dead bullets
    bullets = bullets.filter(b=>b.isAlive);
    
    // get rid of dead circles
    enemies = enemies.filter(e=>e.isAlive);

    circles = circles.filter(e=>e.isAlive);

    trackers = trackers.filter(t=>t.isAlive)

    //get rid of explosions
    explosions = explosions.filter(ex=>ex.playing);

    //get rid of rockets
    rockets = rockets.filter(r=>r.isAlive);


	// #7 - Is game over?
    if (life <= 0){
        end();
        return; // return here so we skip #8 below
    }
	
	// #8 - Load next level
    if (enemies.length == 0 && trackers.length ==0 && circles.length ==0){
	    levelNum ++;
	    loadLevel();
    }
}

function createEnemies(numEnemies){
    for(let i=0;i<numEnemies;i++){
        let e = new Enemy(10);
        e.x = sceneWidth-10-(Math.random()*100);
        e.y = 100 + Math.random() * (sceneHeight - 200) ;
        enemies.push(e);
        gameScene.addChild(e);
    }
}

function createCircles(numCircles){
    for(let i=0;i<numCircles;i++){
        let c = new Circle(10);
        c.x = Math.random() * (sceneWidth-50) + 25;
        c.y = Math.random() * (sceneHeight-400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
}

function createTrackers(numTrackers){
    for(let i=0;i<numTrackers;i++){
        let c = new Tracker(10);
        c.x = Math.random() * (sceneWidth-50) + 25;
        c.y = Math.random() * (sceneHeight-400) + 25;
        trackers.push(c);
        gameScene.addChild(c);
    }
}

function loadLevel(){
    
    if(!bckgr2) {bckgr2 = createBckgr(app.loader.resources["images/bckgr2.png"].texture);}
    if(!bckgr3) {bckgr3 = createBckgr(app.loader.resources["images/bckgr3.png"].texture);}
    if(!bckgr1) {bckgr1 = createBckgr(app.loader.resources["images/bckgr.png"].texture);}

    createEnemies(levelNum + 2);

    if(levelNum>=3){
        createCircles(levelNum-2);
    }

    if(levelNum>=5){
        createTrackers(levelNum-2);
    }

    rockets.forEach(r=>gameScene.removeChild(r));
    rockets = [];
    paused = false;
    
    if(life<60){
        let die = Math.random();
        if(die<=.25){
            let powerUp = new PowerUp(Math.random()*sceneWidth, Math.random()* sceneHeight)
            powerUps.push(powerUp)
            gameScene.addChild(powerUp);
        }
        die = Math.random();
        if(die>=.75){
            let powerUp = new PowerUp(Math.random()*sceneWidth, Math.random()* sceneHeight)
            powerUps.push(powerUp)
            gameScene.addChild(powerUp);
        }
    }
}

function end(){
    paused = true;

    //clear out level
    enemies.forEach(e=>gameScene.removeChild(e));
    enemies = [];

    bullets.forEach(b=>gameScene.removeChild(b));
    bullets = [];

    explosions.forEach(e=>gameScene.removeChild(e))
    explosions = [];

    rockets.forEach(r=>gameScene.removeChild(r));
    rockets = [];

    powerUps.forEach(p=>gameScene.removeChild(p));
    powerUps = [];

    trackers.forEach(t=>gameScene.removeChild(t));
    trackers = [];

    circles.forEach(c=>gameScene.removeChild(c));
    circles = [];

    gameOverScene.visible = true;
    gameOverScoreLabel.text = `Your final score: ${score}`;
    gameScene.visible = false;
}

function fireBullet(e){
    //let rect = app.view.getBoundingClientRect();
    // let mouseX = e.clientX - rect.x;
    // let mouseY = e.clientY - rect.y;
    // console.log(`${mouseX}, ${mouseY}`);
    if(paused) return;

    if(bulletCooldown<=0){
        bulletCooldown = .3;

        let bulletDir = {x:1, y:0}

        let b = new bullet(0xFFFFFF, ship.x, ship.y, bulletDir);
        bullets.push(b);
        gameScene.addChild(b);
        shootSound.play();

        if(score >= 10){
            bulletDir = {x:-1, y:0}
            let c = new bullet(0xFFFFFF, ship.x, ship.y, bulletDir);
            bullets.push(c);
            gameScene.addChild(c);

            if(score>=20){
                bulletDir = {x:0, y:1}
                let d = new bullet(0xFFFFFF, ship.x, ship.y,bulletDir);
                bullets.push(d);
                gameScene.addChild(d);

                if(score>=30){
                    bulletDir = {x:0, y:-1}
                    let d = new bullet(0xFFFFFF, ship.x, ship.y, bulletDir);
                    bullets.push(d);
                    gameScene.addChild(d);
                }
            }
        }
    }
}

function loadSpriteSheet(){
    let spriteSheet = PIXI.BaseTexture.from("images/explosions.png");
    let width = 64;
    let height = 64;
    let columns = 2;
    let numFrames = 8;
    let textures = [];
    for(let j=0;j<columns; j++){
        for(let i =0; i<numFrames; i++){
            let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, j*height, width, height));
            textures.push(frame);
        }
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight){
    let w2 = frameWidth/2;
    let h2 = frameHeight/2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);
    expl.x = x-w2;
    expl.y = y-h2;
    expl.animationSpeed = 1/6;
    expl.loop = false;
    expl.onComplete = e=>gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}

function fireRocket(e){
    e.preventDefault();

    if(rocketCharge>=5){ 
        let r = new rocket(0x18F2B2, ship.x, ship.y);
        rockets.push(r);
        gameScene.addChild(r);
        rocketSound.play();

        ChargeRocketBy(-5);
    }
}

function createBckgr(texture){
    let tiling = new PIXI.TilingSprite(texture, 900,600);
    tiling.position.set(0,0);
    gameScene.addChildAt(tiling,0);
    

    return tiling;
}

function updateBckgr(){
    bgX = bgX - bgSpeed;

    bckgr1.tilePosition.x = bgX * .06;
    bckgr2.tilePosition.x = bgX;
    bckgr3.tilePosition.x = bgX * 0.75;
}
