

import type { SpriteWithAttribute, Tile, RenderingData } from '../ppu'
import type { PaletteRam } from '../ppu/palette'
import { colors } from './colors'
// import { imageData2Css } from './imange-data2css'


export default class CanvasRenderer {
  ctx: CanvasRenderingContext2D
  image: ImageData
  background: ReadonlyArray<Tile>

  constructor(elementName: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(elementName)
    this.ctx = canvas.getContext('2d')!;
    if (this.ctx) {
      this.image = this.ctx.createImageData(256, 224);
    }
    // this.div = ((document.getElementById('nes-div'): any): HTMLElement);
  }

  shouldPixelHide(x: number, y: number): boolean {
    const tileX = ~~(x / 8);
    const tileY = ~~(y / 8);
    const backgroundIndex = tileY * 33 + tileX;
    const sprite = this.background[backgroundIndex] &&
      this.background[backgroundIndex].sprite;
    if (!sprite) return true;
    // NOTE: If background pixel is not transparent, we need to hide sprite.
    return !((sprite[y % 8] && sprite[y % 8][x % 8] % 4) === 0);
  }

  render(data: RenderingData) {
    const { background, sprites, palette } = data;
    if (background) {
      this.renderBackground(background, palette);
    }
    if (sprites) {
      this.renderSprites(sprites, palette);
    }
    if (!this.ctx) return;
    this.ctx.putImageData(this.image, 0, 0);
  }

  renderBackground(background: any, palette: PaletteRam) {
    this.background = background;
    // TODO: css renderer, move to css-renderer.js
    // console.time('css renderer');
    // this.div.style.boxShadow = imageData2Css(background);
    // console.timeEnd('css renderer')
    for (let i = 0; i < background.length; i += 1 | 0) {
      const x = (i % 33) * 8;
      const y = ~~(i / 33) * 8;
      this.renderTile(background[i], x, y, palette);
    }
  }

  renderSprites(sprites: any, palette: PaletteRam) {
    for (const sprite of sprites) {
      if (sprite) {
        this.renderSprite(sprite, palette);
      }
    }
  }

  renderTile({ sprite, paletteId, scrollX, scrollY }: Tile, tileX: number, tileY: number, palette: PaletteRam) {
    const offsetX = scrollX % 8;
    const offsetY = scrollY % 8;
    const { data } = this.image;
    for (let i = 0; i < 8; i = (i + 1) | 0) {
      for (let j = 0; j < 8; j = (j + 1) | 0) {
        const paletteIndex = paletteId * 4 + sprite[i][j];
        const colorId = palette[paletteIndex];
        const color = colors[colorId];
        const x = tileX + j - offsetX;
        const y = tileY + i - offsetY;
        if (x >= 0 && 0xFF >= x && y >= 0 && y < 224) {
          const index = (x + (y * 0x100)) * 4;
          data[index] = color[0];
          data[index + 1] = color[1];
          data[index + 2] = color[2];
          data[index + 3] = 0xFF;
        }
      }
    }
  }

  renderSprite(sprite: SpriteWithAttribute, palette: PaletteRam) {
    const { data } = this.image;
    const isVerticalReverse = !!(sprite.attr & 0x80);
    const isHorizontalReverse = !!(sprite.attr & 0x40);
    const isLowPriority = !!(sprite.attr & 0x20);
    const paletteId = sprite.attr & 0x03;
    for (let i = 0; i < 8; i = (i + 1) | 0) {
      for (let j = 0; j < 8; j = (j + 1) | 0) {
        const x = sprite.x + (isHorizontalReverse ? 7 - j : j);
        const y = sprite.y + (isVerticalReverse ? 7 - i : i);
        if (isLowPriority && this.shouldPixelHide(x, y)) {
          continue;
        }
        if (sprite.sprite[i][j]) {
          const colorId = palette[paletteId * 4 + sprite.sprite[i][j] + 0x10];
          const color = colors[colorId];
          const index = (x + y * 0x100) * 4;
          data[index] = color[0];
          data[index + 1] = color[1];
          data[index + 2] = color[2];
          data[index + 3] = 0xFF;
        }
      }
    }
  }
}


