class Play extends Phaser.Scene {
    constructor() {
        super('playScene')
    }

    init() {
        this.ACCELERATION = 200
        this.MAX_VELOCITY_X = 150
        this.MAX_VELOCITY_Y = 1000
        this.DRAG = 900
        this.JUMP = -300
    }

    create() {
        // tilemap
        const map = this.add.tilemap('tilemapJSON')
        const tilesetIMG = map.addTilesetImage('gameTileset', 'tilesetImage')
        const backgroundLayer = map.createLayer('Background', tilesetIMG, 0, 0)
        const platformLayer = map.createLayer('Platform', tilesetIMG, 0, 0)

        // spawn
        const playerSpawn = map.findObject('Spawns', (obj) => obj.name === 'playerSpawn')

        // player sprite
        this.player = this.physics.add.sprite(playerSpawn.x, playerSpawn.y, 'greenMan', 0)
        this.player.body.setCollideWorldBounds(true)
        this.player.body.setMaxVelocity(this.MAX_VELOCITY_X, this.MAX_VELOCITY_Y = 1000)
        this.player.anims.play('idle')
        this.player.dead = false

        // bee
        this.bee = this.physics.add.sprite(960, 224, 'bee')

        // world physics
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.physics.world.gravity.y = 1000

        // layers collision 
        platformLayer.setCollisionByProperty({ collision: true})
        this.physics.add.collider(this.player, platformLayer)
        this.physics.add.collider(this.bee, platformLayer)

        // player-enemy collision
        this.physics.add.collider(this.player, this.bee, this.playerDeath, null, this)

        // main camera
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.cameras.main.startFollow(this.player, true, 0.5, 0.5)
        this.cameras.main.setFollowOffset(0, 20)
        this.cameras.main.setZoom(1.5)

        // key setting
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        this.keyJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)

        // sound effect
        
        // instruction
        document.getElementById('description').innerHTML = '<p>A: Left</p><p>D: Right</p><p>W: Jump</p><p>K: Attack</p>'

    }

    update() {
        /*
         "BUG FIXED": jumping-walking animation overwrite is fixed
         if the player is in the air, jump animation plays
         if not, then play the "on-ground animation" (left/right/idle)
         jumping animation will not be overwritten
        */
        if (!this.player.dead) {
            if (!this.player.body.blocked.down) { 
                this.player.anims.play('jump', true)      // play 'jump' during the jumping stage
            } else if (this.isAttacking) {
                this.player.anims.play('attack', true)    // play 'attack' during the attacking stage
            } else {                                      // on ground stage: 'walk' and 'idle'
                if (this.keyLeft.isDown) {
                    this.player.body.setAccelerationX(-this.ACCELERATION)
                    this.player.setFlip(true, false)
                    this.player.play('walk', true)
                    // console.log('walk-left')
                } else if (this.keyRight.isDown) {
                    this.player.body.setAccelerationX(this.ACCELERATION)
                    this.player.resetFlip()
                    this.player.play('walk', true)
                    // console.log('walk-right')
                } else {
                    this.player.play('idle')
                    this.player.body.setAccelerationX(0)
                    this.player.body.setDragX(this.DRAG)
                }
            }
        }

        // single jump
        if (this.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.keyJump)) {
            this.player.body.setVelocityY(this.JUMP)
            this.sound.play('jump-sfx')
            // console.log('jumped')
        }

        // single attack
        if (Phaser.Input.Keyboard.JustDown(this.keyAttack) && !this.isAttacking) {
            this.isAttacking = true                                                   // attacking state starts
            this.player.body.setAccelerationX(0)                                      // prevent gliding
            this.time.delayedCall(200, () => {this.attackHitbox()})                   // create a hitbox in front of the player
            this.time.delayedCall(2000, () => {this.isAttacking = false})             // attacking state ends
        }

    }

    attackHitbox() {
        let hitBox = this.physics.add.sprite(this.player.x + (this.player.flipX ? -10 : 10), 
            this.player.y, 
            null
        ).setSize(15, 15).setOrigin(0.5, 0.5).setAlpha(0)

        this.time.delayedCall(150, () => {
            hitBox.destroy()
        })
        // hit box-enemy collision
        this.physics.add.overlap(hitBox, this.bee, (hitBox, bee) => {
            bee.destroy()
            hitBox.destroy()
        })
    }

    playerDeath() {
        this.player.dead = true
        this.physics.pause()
        this.player.play('death', true).once('animationcomplete', () => {
            this.player.destroy()
        })
        this.time.delayedCall(1500, () => {
            this.scene.restart()
        })
    }
}