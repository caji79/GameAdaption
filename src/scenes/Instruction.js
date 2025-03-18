class Instruction extends Phaser.Scene {
    constructor() {
        super('instructionScene')
    }

    create() {
        this.add.bitmapText(oneTenthX, oneTenthY, 'pixel_font', 'LEFT: A', 20)
        this.add.bitmapText(oneTenthX, oneTenthY*2, 'pixel_font', 'RIGHT: D', 20)
        this.add.bitmapText(oneTenthX, oneTenthY*3, 'pixel_font', 'JUMP: W', 20)
        this.add.bitmapText(oneTenthX, oneTenthY*4, 'pixel_font', 'KICK: K', 20)
        
        this.goal = this.add.bitmapText(centerX, oneTenthY*7, 'pixel_font', 'CAN YOU BEAT SLEEPY SAM?', 18).setOrigin(0.5)

        // countdown text
        this.countdownText = this.add.bitmapText(oneTenthX*9, oneTenthY*9, 'pixel_font', '... 7', 22).setOrigin(0.5);
        this.countdown = 7
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            repeat: 6,
            callback: () => {
                this.countdown--
                this.countdownText.setText('... ' + this.countdown.toString())   // update text

                if (this.countdown <= 0) {
                    this.scene.start('playScene')
                }
            }
        })
    }
}