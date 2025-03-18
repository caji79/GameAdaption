/*
    Name: Eli Chen
    Class: CMPM 120
    Professor: Nathan Altice
    Date: 3/17/2025
    TECHNICAL EXECUTION:
    Physics (Arcade), Cameras, Text object (Bitmap Text), Animation manager, Tween manager, Timers, Tilemaps
    Credits/Sources: cite in the code
*/

'use strict'

let config = {
    type: Phaser.AUTO,
    width: 400,
    height: 320,
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true
        }
    },
    scene: [ Load, Menu, Instruction, Play, Win, GameOver, Credits ]
}

let game = new Phaser.Game(config)

let width = game.config.width
let height = game.config.height
let centerX = game.config.width/2
let centerY = game.config.height/2
let oneTenthX = game.config.width/10
let oneTenthY = game.config.height/10
let highScore = 0
