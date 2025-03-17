class Win extends Phaser.Scene {
    constructor() {
        super('winScene')
    }

    create() {
        this.add.bitmapText(centerX, centerY - 20, 'pixel_font', 'YOU', 32).setOrigin(0.5)
        this.add.bitmapText(centerX, centerY + 20, 'pixel_font', 'WIN', 32).setOrigin(0.5)
    }
}