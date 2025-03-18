class Win extends Phaser.Scene {
    constructor() {
        super('winScene')
    }

    create() {
        this.add.bitmapText(centerX, centerY - 80, 'pixel_font', 'CONGRATS, HERO!', 24).setOrigin(0.5)
        this.add.bitmapText(centerX, centerY - 20, 'pixel_font', 'YOU', 32).setOrigin(0.5)
        this.add.bitmapText(centerX, centerY + 20, 'pixel_font', 'WIN', 32).setOrigin(0.5)
        this.add.bitmapText(centerX, 25, 'pixel_font', `HIGH SCORE: ${highScore}`, 18).setOrigin(0.5)
        this.add.bitmapText(oneTenthX*8, oneTenthY*9, 'pixel_font', 'CREDITS (C)', 16).setOrigin(0.5)

        // restart text
        this.restart = this.add.bitmapText(centerX, centerY + 60, 'pixel_font', 'PRESS R TO RESTART', 18).setOrigin(0.5)
        this.time.addEvent({
            delay:750,
            callback: () => {
                this.restart.visible = !this.restart.visible
            },
            loop: true
        })

        // restart key
        this.keyRestart = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        // credits key
        this.keyCredits = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C)
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyRestart)) {
            this.scene.start('playScene')
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyCredits)) {
            this.scene.start('creditScene', { prevScene: 'winScene'})
        }
    }
}