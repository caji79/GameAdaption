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
        this.playerSpawn = map.findObject('Spawns', (obj) => obj.name === 'playerSpawn')

        // sound effect and background music
        this.danceSound = this.sound.add('dance-sfx', {
            volume: 0.1,
            rate: 1.5,
            loop: true
        })
        this.jumpSound = this.sound.add('jump-sfx')
        this.walkSound = this.sound.add('walk-sfx', {
            volume: 0.1,
            rate: 2,
            loop:true
        })
        this.kickSound = this.sound.add('kick-sfx')
        this.scoreSound = this.sound.add('score-sfx')
        this.bgm = this.sound.add('bgm', {
            volume: 0.1,
            loop: true
        })

        // sun
        this.sun = this.add.sprite(80, 80, 'sun').setScale(2)
        this.sun.play('shine')

        // player sprite
        this.player = this.physics.add.sprite(this.playerSpawn.x, this.playerSpawn.y, 'greenMan', 0)
        this.player.body.setCollideWorldBounds(true)
        this.player.body.setMaxVelocity(this.MAX_VELOCITY_X, this.MAX_VELOCITY_Y = 1000)
        this.player.dead = false    // flag: track player death

        // dance animation at the beginning
        this.updateEnabled = false      // prevent 'idle animation' taking place in update method (see update)
        this.danceSound.play()
        this.player.anims.play('dance').once('animationcomplete', () => {
            this.danceSound.stop()
            this.bgm.play()
            this.updateEnabled = true
        })

        // bee
        this.bee = this.physics.add.sprite(1024, 224, 'bee')
        this.bee.body.setSize(48, 48)
        this.bee.body.setImmovable(true)

        // bunny
        this.bunny = this.physics.add.sprite(1616, 192, 'bunny')
        this.bunny.body.setSize(10, 48)
        this.bunny.body.setOffset(8, 16)
        this.bunny.body.setImmovable(true)
        this.bunny.isJumping = false

        // frog
        this.frog = this.physics.add.sprite(2320, 288, 'frog', 0)
        this.frog.body.setSize(24, 20)
        this.frog.body.setOffset(24, 12)
        this.frog.body.setImmovable(true)
        this.frog.isEating = false

        // lava pool
        this.lavaTile = map.createFromObjects('Lava', {
            name: 'lava',
            frame: 33
        })

        // coins
        this.coins = map.createFromObjects('Coins', {
            name: 'coin',
            frame: 22
        })

        // lava/coin physics
        // https://docs.phaser.io/api-documentation/class/physics-arcade-world
        // Mappy/src/Scenes/TiledPlatform.js from Nathan's repo
        this.physics.world.enable(this.lavaTile, 1)    // 0 is DYNAMIC_BODY, 1 is STATIC_BODY
        this.lavaGroup = this.add.group(this.lavaTile)
        
        this.physics.world.enable(this.coins, 1)
        this.coins.map((coin) => {
            coin.body.setSize(8, 8)
        })
        this.coinsGroup = this.add.group(this.coins)

        // UI
        this.uiBar = this.add.image(0, -50, 'UI_bar').setOrigin(0).setScrollFactor(0)
        // life system
        this.lives = 3    // track player lives
        this.livesIcons = this.add.group()
        for (let i = 0; i < this.lives; i++) {
            let life = this.add.image(35 + i * 30, -25, 'lifeIcon').setScrollFactor(0).setScale(1.5)
            this.livesIcons.add(life)
        }
        // score (see function 'attackHitbox')
        this.score = 0
        this.scoreText = this.add.bitmapText(centerX, -25, 'pixel_font', `0`, 20).setOrigin(0.5, 0.5).setScrollFactor(0)
        this.bee.pointValue = 500
        this.bunny.pointValue = 800
        this.coinsGroup.pointValue = 100
        // UI tweens
        this.time.delayedCall(5500, () => {
            this.tweens.add({
                targets: [this.uiBar, this.scoreText, ...this.livesIcons.getChildren()],
                y: '+=50',
                duration: 800,
                ease: 'Quad.easeOut'
            })
        })

        // world physics
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.physics.world.gravity.y = 1000

        // layers collision 
        platformLayer.setCollisionByProperty({ collision: true})
        this.physics.add.collider(this.player, platformLayer)
        this.physics.add.collider(this.bee, platformLayer)
        this.physics.add.collider(this.bunny, platformLayer)
        this.physics.add.collider(this.frog, platformLayer)

        // lava-coin collision
        //lava
        this.physics.add.overlap(this.player, this.lavaGroup, () => {
            if (!this.player.dead) {
                this.playerDeath()
            }
        })
        // coin
        this.physics.add.overlap(this.player, this.coinsGroup, (player, coin) => {
            this.sound.play('coin-sfx')
            let gotCoin = this.add.sprite(coin.x, coin.y, 'points', 6)
            coin.destroy()
            this.updateScore(this.coinsGroup.pointValue)
            this.tweens.chain({
                targets: gotCoin,
                tweens: [
                    {
                        duration: 100,
                        y: coin.y + 3,
                        yoyo: true,
                        repeat: 4,
                        ease: 'Power1',
                    },
                    {
                        duration: 50,
                        alpha: 0,
                        onComplete: () => {
                            gotCoin.destroy()
                        }
                    }
                ]
            })
        })

        // falling detection between gaps
        // fall box group
        this.fallDetectors = this.physics.add.group({
            allowGravity: false,
            immovable: true
        })
        // position for each box
        let detectorPositions = [
            {x: 1128, y: 400},
            {x: 1240, y: 400}
        ]
        // box for falling death
        // iterate over the position array to create each fall detector box (total 2)
        detectorPositions.forEach(pos => {
            let fallBox = this.fallDetectors.create(pos.x, pos.y, null)
            fallBox.setSize(48, 16)
            fallBox.setOrigin(0, 0)
            fallBox.setVisible(false)
        })
        // player-fallbox collision
        this.physics.add.overlap(this.player, this.fallDetectors, () => {
            this.playerDeath()
        })

        // player-enemy collision
        this.physics.add.collider(this.player, this.bee, this.playerDeath, null, this)
        this.physics.add.collider(this.player, this.bunny, this.playerDeath, null, this)
        this.physics.add.collider(this.player, this.frog, this.playerDeath, null, this)

        // main camera
        this.cameras.main.setBounds(0, 0, map.widthInPixels, 400)
        this.cameras.main.startFollow(this.player, true, 0.5, 0.5, 0, 35)

        // key setting
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        this.keyJump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        this.keyAttack = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)

        // slope mechanics
        //directly force the player sprite to move along the slope by using tweens (see functions below the update)
        // 1st set
        this.slopeStartBox1 = this.physics.add.staticSprite(176, 144, null).setBodySize(4, 64)
        this.slopeStartBox1.setVisible(false)
        this.slopeEndBox1 = this.physics.add.staticSprite(316, 224, null).setBodySize(4, 64)
        this.slopeEndBox1.setVisible(false)

        this.downOverlap1 = this.physics.add.overlap(this.player, this.slopeStartBox1, this.moveDown1, null, this)
        this.upOverlap1 = this.physics.add.overlap(this.player, this.slopeEndBox1, this.moveUp1, null, this)

        // 2nd set
        this.slopeStartBox2 = this.physics.add.staticSprite(1728, 224, null).setBodySize(4, 64)
        this.slopeStartBox2.setVisible(false)
        this.slopeEndBox2 = this.physics.add.staticSprite(1772, 240, null).setBodySize(4, 64)
        this.slopeEndBox2.setVisible(false)

        this.downOverlap2 = this.physics.add.overlap(this.player, this.slopeStartBox2, this.moveDown2, null, this)
        this.upOverlap2 = this.physics.add.overlap(this.player, this.slopeEndBox2, this.moveUp2, null, this)

        // 3rd set
        this.slopeStartBox3 = this.physics.add.staticSprite(1840, 256, null).setBodySize(4, 64)
        this.slopeStartBox3.setVisible(false)
        this.slopeEndBox3 = this.physics.add.staticSprite(1884, 272, null).setBodySize(4, 64)
        this.slopeEndBox3.setVisible(false)

        this.downOverlap3 = this.physics.add.overlap(this.player, this.slopeStartBox3, this.moveDown3, null, this)
        this.upOverlap3 = this.physics.add.overlap(this.player, this.slopeEndBox3, this.moveUp3, null, this)
    }

    update() {
        if (!this.updateEnabled) return    // exit update() immediately (line 54)
        /*
         "BUG FIXED": jumping-walking animation overwrite is fixed
         if the player is in the air, jump animation plays
         if not, then play the "on-ground animation" (left/right/idle)
         jumping animation will not be overwritten
        */
        if (!this.player.dead) {
            if (!this.player.body.blocked.down) {
                if (this.isOnSlope) {                    // the slope tileset is not collidable,
                    this.player.play('walk', true)       // so make sure the walking is playing instead of jumping
                    if (!this.walkSound.isPlaying) this.walkSound.play()
                } else {
                    this.player.anims.play('jump', true)      // play 'jump' during the jumping stage (!this.player.body.blocked.down)
                    this.walkSound.stop()
                }
            } else if (this.isAttacking) {                // flag: this.isAttacking (representing the attacking stage)
                this.player.anims.play('attack', true)    // play 'attack' during the attacking stage
                this.walkSound.stop()
            } else {                                      // on ground stage: 'walk' and 'idle'
                if (this.keyLeft.isDown) {
                    this.player.body.setAccelerationX(-this.ACCELERATION)
                    this.player.setFlip(true, false)
                    this.player.play('walk', true)
                    if (!this.walkSound.isPlaying) this.walkSound.play();
                    // console.log('walk-left')
                } else if (this.keyRight.isDown) {
                    this.player.body.setAccelerationX(this.ACCELERATION)
                    this.player.resetFlip()
                    this.player.play('walk', true)
                    if (!this.walkSound.isPlaying) this.walkSound.play();
                    // console.log('walk-right')
                } else {
                    this.player.play('idle')
                    this.player.body.setAccelerationX(0)
                    this.player.body.setDragX(this.DRAG)
                    this.walkSound.stop()
                }
            }
        }

        // single jump
        if (this.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.keyJump)) {
            this.player.body.setVelocityY(this.JUMP)
            this.jumpSound.play()
            // console.log('jumped')
        }

        // single attack (2s cooldown)
        if (Phaser.Input.Keyboard.JustDown(this.keyAttack) && !this.isAttacking) {
            this.kickSound.play()
            this.isAttacking = true                                                   // flag: attacking state starts
            this.player.body.setAccelerationX(0)                                      // prevent gliding
            this.time.delayedCall(200, () => {this.attackHitbox()})                   // create a hitbox in front of the player
            this.time.delayedCall(2000, () => {this.isAttacking = false})             // attacking state ends
        }

        // monsters' actions
        // bee moving forward
        if (this.bee.body) {
            // check the distance between player and monster
            // https://stackoverflow.com/questions/73676319/phaser3-matter-physics-calculate-distance-between-a-point-and-a-physics-shape
            // https://photonstorm.github.io/phaser3-docs/Phaser.Math.Distance.html#:~:text=Between(x1%2C,sets%20of%20coordinates%20(points).
            let beeDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bee.x, this.bee.y)

            if (beeDistance < 256) {
                // moving forward
                this.bee.setVelocityX(-200)
                this.time.delayedCall(500, () => {
                    if (this.bee.body) {
                        this.bee.setVelocityX(0)
                        this.bee.setAccelerationX(0)
                        this.bee.setDragX(900)
                    }
                })
            }
        }
        // bunny jumping
        // bunny jumps toward player only when the distance is close enough
        if (!this.bunny.isJumping) {
            let bunnyDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bunny.x, this.bunny.y)

            if (bunnyDistance < 128) {
                this.bunny.isJumping = true   // flag: prevent bunny continuously jumping while in the air
                // jumping forward
                this.bunny.setVelocityX(-200)
                this.bunny.setVelocityY(-200)
                this.bunny.setDragX(900)
                // jumping cooldown and reset
                this.time.delayedCall(2000, () => {
                    if (this.bunny.body) {
                        this.bunny.isJumping = false
                        this.bunny.setVelocityX(0)
                        this.bunny.setAccelerationX(0)
                    }
                })
            }
        }
        // frog eating
        // frog shoots out its tongue only when the distance is close enough
        if (!this.frog.isEating) {
            let frogDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.frog.x, this.frog.y)

            if (frogDistance < 96) {
                this.frog.isEating = true
                // shooting out tongue
                this.frog.anims.play('tongue', true)
                // set an animation event listener on the frog to catch specific frame of the current animation
                // https://docs.phaser.io/api-documentation/event/animations-events
                // https://phaser.discourse.group/t/on-frame-update-callback/2513
                // similar example: https://phaser.io/examples/v3.55.0/animation/view/on-update-event
                this.frog.on('animationupdate', (anim, frame) => {
                    if (frame.index === 4) {    // 4th frame (tongue out)
                        this.tongueHitbox()     // create a hitbox for tongue
                    }
                })
                // cooldown
                this.time.delayedCall(750, () => {
                    if (this.frog.body) {
                        this.frog.isEating = false
                    }
                })
            }
        }

    }

    // for player
    attackHitbox() {
        let hitBox = this.physics.add.staticSprite(this.player.x + (this.player.flipX ? -10 : 10), 
            this.player.y, 
            null
        ).setSize(15, 15).setOrigin(0.5, 0.5).setAlpha(0)

        this.time.delayedCall(150, () => {
            hitBox.destroy()
        })
        // hit box-enemy collision
        // bee
        this.physics.add.overlap(hitBox, this.bee, (hitBox, bee) => {
            bee.destroy()
            hitBox.destroy()
            this.updateScore(bee.pointValue)
            // bee points animation (500)
            this.beePoints = this.add.sprite(this.bee.x + 10, this.bee.y - 10, 'points').setScale(1.25)
            this.scoreSound.play()
            this.beePoints.play('scored500').once('animationcomplete', () => {
                this.beePoints.destroy()
            })
        })
        // bunny
        this.physics.add.overlap(hitBox, this.bunny, (hitBox, bunny) => {
            bunny.destroy()
            hitBox.destroy()
            this.updateScore(bunny.pointValue)
            // bunny points animation (800)
            this.bunnyPoints = this.add.sprite(this.bunny.x + 10, this.bunny.y, 'points', 3).setScale(1.25)
            this.scoreSound.play()
            this.bunnyPoints.play('scored800').once('animationcomplete', () => {
                this.bunnyPoints.destroy()
            })
        })
        // frog
        this.physics.add.overlap(hitBox, this.frog, (hitBox, frog) => {
            frog.destroy()
            hitBox.destroy()
            this.scoreSound.play()
            this.bgm.stop()
            this.time.delayedCall(3000, () => {
                this.scene.start('winScene')
            })
        })
    }
    // for frog only
    tongueHitbox() {
        let tongue = this.physics.add.staticSprite(this.frog.x - 12, this.frog.y + 4, null).setSize(24, 2).setOrigin(0.5, 0.5).setAlpha(0)
        this.time.delayedCall(200, () => {
            tongue.destroy()
        })
        this.physics.add.overlap(tongue, this.player, (tongue, player) => {
            if (!this.player.dead) {
                this.playerDeath()
            }
            tongue.destroy()
        })
    }

    playerDeath() {
        this.bgm.stop()
        this.walkSound.stop()
        this.physics.pause()
        this.player.setVelocity(0)
        this.player.setAcceleration(0)
        // health mechanics
        if (this.lives > 0) {
            this.lives --
            this.player.dead = true
            let icons = this.livesIcons.getChildren()
            // remove the last icon
            // icons array [ icon1 (0), icon2 (1), icon3 (2) ]
            if (icons.length > 0) {
                icons[icons.length - 1].destroy()
            }
            this.keyJump.enabled = false
            this.keyAttack.enabled = false
            this.isAttacking = false        // BUF FIXED
            // reset score and highScore
            this.score = 0
            highScore = 0
            // update score on UI
            this.scoreText.setText(`${this.score}`)
            this.player.play('death', true)
            this.time.delayedCall(1500, () => {
                this.resetGame()
            })
        } else {
            this.updateEnabled = false    // exit update() immediately, prevent animation overwriting (see update)
            this.player.anims.play('death', true)
            this.time.delayedCall(1500, () => {
                this.scene.start('gameoverScene')
            })
        }
    }

    resetGame() {
        this.player.setPosition(this.playerSpawn.x, this.playerSpawn.y)
        this.player.dead = false
        this.keyJump.enabled = true
        this.keyAttack.enabled = true
        this.isAttacking = false
        // send the monsters back
        this.bee.setPosition(1024, 224)
        this.bunny.setPosition(1616, 192)
        this.physics.resume()
        this.bgm.play()
        // send the UI back
        this.uiBar.y = -50; 
        this.livesIcons.getChildren().forEach(icon => icon.y = -25);
        this.scoreText.y = -25;
        // UI tweens 
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: [this.uiBar, this.scoreText, ...this.livesIcons.getChildren()],
                y: '+=50',
                duration: 800,
                ease: 'Quad.easeOut'
            })
        })
    }

    updateScore(points) {
        this.score += points
        this.scoreText.setText(`${this.score}`) // update score
        if (this.score > highScore) {
            highScore = this.score 
        }
    }

    moveDown1(player, trigger) {
        this.isOnSlope = true
        player.body.moves = false
        this.upOverlap1.active = false
        this.downOverlap1.active = false
        this.tweens.add({
            targets: player,
            x: player.x + 160,
            y: player.y + 80,
            duration: 1250,
            ease: 'Linear',
            onComplete: () => {
                this.isOnSlope = false
                player.body.moves = true
                this.upOverlap1.active = true
                this.downOverlap1.active = true
                // console.log('down completed')
            }
        })
    }

    moveUp1(player, trigger) {
        this.isOnSlope = true
        player.body.moves = false
        this.upOverlap1.active = false
        this.downOverlap1.active = false
        this.tweens.add({
            targets: player,
            x: player.x - 160,
            y: player.y - 80,
            duration: 1250,
            ease: 'Linear',
            onComplete: () => {
                this.isOnSlope = false
                player.body.moves = true
                this.upOverlap1.active = true
                this.downOverlap1.active = true
                // console.log('up completed')
            }
        })
    }

    moveDown2(player, trigger) {
        this.isOnSlope = true
        player.body.moves = false
        this.upOverlap2.active = false
        this.downOverlap2.active = false
        this.tweens.add({
            targets: player,
            x: player.x + 64,
            y: player.y + 32,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                this.isOnSlope = false
                player.body.moves = true
                this.upOverlap2.active = true
                this.downOverlap2.active = true
                // console.log('down completed')
            }
        })
    }

    moveUp2(player, trigger) {
        this.isOnSlope = true
        player.body.moves = false
        this.upOverlap2.active = false
        this.downOverlap2.active = false
        this.tweens.add({
            targets: player,
            x: player.x - 64,
            y: player.y - 32,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                this.isOnSlope = false
                player.body.moves = true
                this.upOverlap2.active = true
                this.downOverlap2.active = true
                // console.log('up completed')
            }
        })
    }

    moveDown3(player, trigger) {
        this.isOnSlope = true
        player.body.moves = false
        this.upOverlap3.active = false
        this.downOverlap3.active = false
        this.tweens.add({
            targets: player,
            x: player.x + 64,
            y: player.y + 32,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                this.isOnSlope = false
                player.body.moves = true
                this.upOverlap3.active = true
                this.downOverlap3.active = true
                // console.log('down completed')
            }
        })
    }

    moveUp3(player, trigger) {
        this.isOnSlope = true
        player.body.moves = false
        this.upOverlap3.active = false
        this.downOverlap3.active = false
        this.tweens.add({
            targets: player,
            x: player.x - 64,
            y: player.y - 32,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                this.isOnSlope = false
                player.body.moves = true
                this.upOverlap3.active = true
                this.downOverlap3.active = true
                // console.log('up completed')
            }
        })
    }
}