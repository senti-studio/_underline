import { _u } from '@tinytales/_underline'
import * as PIXI from 'pixi.js'
import runExample from './example'

const canvas = document.getElementById('app') as HTMLCanvasElement
const app = new PIXI.Application({
  background: '#000',
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  antialias: false,
  width: window.innerWidth - 25,
  height: window.innerHeight - 25,
})
canvas.appendChild(app.view)

const scene = new PIXI.Container()
app.stage.addChild(scene)

runExample()

_u.renderTo({
  container: scene,
  dimensions: {
    w: window.innerWidth - 25,
    h: window.innerHeight - 25,
  },
  position: {
    x: 0,
    y: 0,
  },
})
