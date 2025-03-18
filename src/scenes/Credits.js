class Credits extends Phaser.Scene {
    constructor() {
        super('creditScene')
    }

    create(data) {
        this.add.bitmapText(centerX, oneTenthY, 'pixel_font', 'Guardians of Sunshine: Remake', 16).setOrigin(0.5)
        this.add.bitmapText(centerX, oneTenthY*2, 'pixel_font', 'A game by Eli Chen', 12).setOrigin(0.5)
        this.add.bitmapText(oneTenthX - 20, oneTenthY*3-15, 'pixel_font', 'Based on:', 12)
        this.add.bitmapText(oneTenthX - 20, oneTenthY*4-15, 'pixel_font', 'Adventure Time: S2, E16', 18)
        this.add.bitmapText(oneTenthX - 20, oneTenthY*5-10, 'pixel_font', 'Developer:', 12)
        this.add.bitmapText(oneTenthX - 20, oneTenthY*6-15, 'pixel_font', 'Eli Chen - Game Design, Programming, Art, Sound', 10)
        this.add.bitmapText(oneTenthX - 20, oneTenthY*7-25, 'pixel_font', 'Special Thanks:', 12)
        this.add.bitmapText(oneTenthX - 20, oneTenthY*7-5, 'pixel_font', 'Pendleton Ward', 10)
        this.add.bitmapText(oneTenthX - 20, oneTenthY*7+10, 'pixel_font', 'Petaporon by Cedric Stoquer', 10)
        this.add.bitmapText(oneTenthX - 20, oneTenthY*8, 'pixel_font', 'Made for:', 12)
        this.add.bitmapText(oneTenthX - 20, oneTenthY*8+25, 'pixel_font', 'Nathan Altice, CMPM120, UCSC, 2025', 10)
        this.add.bitmapText(oneTenthX*9-10, oneTenthY*9+10, 'pixel_font', 'BACK (B)', 12).setOrigin(0.5)

        this.previousScene = data.prevScene || null
        this.input.keyboard.once('keydown-B', () => {
            if (this.previousScene) {
                this.scene.start(this.previousScene)
            }
        })
    }
}