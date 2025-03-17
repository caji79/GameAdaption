class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene')
    }

    create() {
        this.menuFrame1 = this.add.image(centerX, centerY+10, 'menuFrame1').setScale(0.45)
        this.menuFrame2 = this.add.image(centerX, centerY+10, 'menuFrame2').setScale(0.45)

        this.time.addEvent({
            delay: 350,
            callback: () => {
                this.menuFrame2.visible = !this.menuFrame2.visible
            },
            loop: true
        })

        this.input.keyboard.on('keydown', () => {
            this.scene.start('instructionScene')
        })
    }
}