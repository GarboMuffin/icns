import { PNG } from 'pngjs'
import { encode } from '@fiahfy/packbits'
import { Icns } from './icns'

class Bitmap {
  readonly png: PNG

  constructor(png: PNG) {
    this.png = png
  }

  format(format: string): Buffer | undefined {
    switch (format) {
      case 'MASK':
        return this.mask
      case 'RGB':
        return this.rgb
      case 'ARGB':
        return this.argb
      default:
        return undefined
    }
  }

  get mask(): Buffer {
    return this.getChannel(3)
  }

  get rgb(): Buffer {
    return Buffer.concat([
      encode(this.getChannel(0), { format: 'icns' }),
      encode(this.getChannel(1), { format: 'icns' }),
      encode(this.getChannel(2), { format: 'icns' })
    ])
  }

  get argb(): Buffer {
    const header = Buffer.alloc(4)
    header.write('ARGB', 0, 4, 'ascii')

    return Buffer.concat([
      header,
      encode(this.getChannel(3), { format: 'icns' }),
      encode(this.getChannel(0), { format: 'icns' }),
      encode(this.getChannel(1), { format: 'icns' }),
      encode(this.getChannel(2), { format: 'icns' })
    ])
  }

  private getChannel(index: number): Buffer {
    const data = []
    for (let i = 0; i < this.png.data.length; i += 4) {
      data.push(this.png.data.slice(index + i, index + i + 1))
    }
    return Buffer.concat(data)
  }
}

export class IcnsImage {
  osType: string
  private _bytes: number
  private _image: Buffer

  constructor(osType = '', bytes = 8, image = Buffer.alloc(0)) {
    this.osType = osType
    this._bytes = bytes
    this._image = image
  }

  static from(buffer: Buffer): IcnsImage {
    const image = new IcnsImage()
    image.data = buffer
    return image
  }

  static fromPNG(buffer: Buffer, osType: string): IcnsImage {
    const iconType = Icns.supportedIconTypes.find(
      (iconType) => iconType.osType === osType
    )
    if (!iconType) {
      throw new TypeError('No supported osType')
    }

    const png = IcnsImage.readPNG(buffer)
    if (!png) {
      throw new TypeError('Image must be PNG format')
    }

    const width = png.width
    const height = png.height
    if (width !== height) {
      throw new TypeError('Image must be squre')
    }
    if (width !== iconType.size) {
      throw new TypeError(
        `Image size must be ${iconType.size}x${iconType.size} for '${osType}'`
      )
    }

    const image =
      iconType.format === 'png'
        ? buffer
        : new Bitmap(png).format(iconType.format)
    if (!image) {
      throw new TypeError(`Invalid format '${iconType.format}'`)
    }

    const icnsImage = new IcnsImage(osType)
    icnsImage.image = image
    return icnsImage
  }

  get bytes(): number {
    return this._bytes
  }

  get image(): Buffer {
    return this._image
  }

  set image(image) {
    this._image = image

    this._bytes = 8 + image.length
  }

  get data(): Buffer {
    const buffer = Buffer.alloc(8)
    buffer.write(this.osType, 0, 4, 'ascii')
    buffer.writeUInt32BE(this.bytes, 4)
    return Buffer.concat([buffer, this.image])
  }

  set data(buffer) {
    this.osType = buffer.toString('ascii', 0, 4)
    this._bytes = buffer.readUInt32BE(4)
    this._image = buffer.slice(8, this.bytes)
  }

  private static readPNG(buffer: Buffer): PNG | undefined {
    try {
      return PNG.sync.read(buffer)
    } catch (e) {
      return undefined
    }
  }
}
