class Load extends Phaser.Scene {
    constructor() {
        super('loadScnee')
    }

    preload() {
        this.load.path = "./assets/"

        this.load.bitmapFont('pixel_font', 'font/pixel_type.png', 'font/pixel_type.xml')

        this.load.image('menuFrame1', 'menu1.png')
        this.load.image('menuFrame2', 'menu2.png')
        this.load.image('UI_bar', 'UI_bar.png')
        this.load.image('lifeIcon', 'life_icon.png')
        this.load.image('bee', 'bee.png')
        this.load.image('bunny', 'bunny.png')

        this.load.spritesheet('greenMan', "greenMan_sheet.png", {
            frameWidth: 16,
            frameHeight: 32
        })
        this.load.spritesheet('sun', 'sun.png', {
            frameWidth: 48,
            frameHeight: 48
        })
        this.load.spritesheet('frog', 'frog.png', {
            frameWidth: 48,
            frameHeight: 32
        })
        this.load.spritesheet('points', 'points.png', {
            frameWidth: 48,
            frameHeight: 48
        })
        this.load.spritesheet('tilesetImage', 'gameRemakeTileset.png', {
            frameWidth: 16,
            frameHeight: 16
        })
        
        this.load.tilemapTiledJSON('tilemapJSON', 'gameWorld.json')

        this.load.audio('jump-sfx', 'jump.wav')
        this.load.audio('walk-sfx', 'walk.wav')
    }

    create() {
        // green man animation
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('greenMan', {
                start: 0,
                end: 0
            })
        })

        this.anims.create({
            key: 'walk',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNames('greenMan', {
                start: 1,
                end: 2
            })
        })

        this.anims.create({
            key: 'jump',
            frameRate: 10,
            repeat: 0,
            frames: this.anims.generateFrameNames('greenMan', {
                start: 3,
                end: 12
            })
        })

        this.anims.create({
            key: 'attack',
            frameRate: 15,
            repeat: 0,
            frames: this.anims.generateFrameNames('greenMan', {
                start: 13,
                end: 43
            })
        })
        this.anims.create({
            key: 'death',
            frameRate: 5,
            repeat: -1,
            frames: this.anims.generateFrameNames('greenMan', {
                start: 44,
                end: 45
            })
        })

        this.anims.create({
            key: 'dance',
            frameRate: 5,
            repeat: 1,
            frames: this.anims.generateFrameNames('greenMan', {
                start: 46,
                end: 48
            })
        })

        // sun animation
        this.anims.create({
            key: 'shine',
            frameRate: 5,
            repeat: -1,
            frames: this.anims.generateFrameNames('sun', {
                start:0,
                end: 1
            })
        })

        // frog animation
        this.anims.create({
            key: 'tongue',
            frameRate: 15,
            frames: this.anims.generateFrameNames('frog', {
                start:0,
                end: 16
            })
        })

        // bee points animation
        this.anims.create({
            key: 'scored500',
            frameRate: 10,
            repeat: 3,
            frames: this.anims.generateFrameNames('points', {
                start:0,
                end: 2
            })
        })

        // bunny points animation
        this.anims.create({
            key: 'scored800',
            frameRate: 10,
            repeat: 3,
            frames: this.anims.generateFrameNames('points', {
                start:3,
                end: 5
            })
        })

        this.scene.start('menuScene')
        // console.log('scene passed')
    }
}