class Load extends Phaser.Scene {
    constructor() {
        super('loadScnee')
    }

    preload() {
        this.load.path = "./assets/"
        this.load.spritesheet('greenMan', "greenMan_sheet.png", {
            frameWidth: 16,
            frameHeight: 32
        })
        
        this.load.image('bee', 'bee.png')

        this.load.image('tilesetImage', 'gameRemakeTileset.png')
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

        this.scene.start('playScene')
        // console.log('scene passed')
    }
}