import fs from 'fs'
import Icns from '../src'

describe('icns', () => {
  describe('constructor', () => {
    test('should work', () => {
      const icns = new Icns()
      expect(icns.images.length).toBe(0)
    })

    test('should work with buffer', () => {
      const buf = fs.readFileSync('./test/sample.icns')
      const icns = new Icns(buf)
      expect(icns.images.length).toBe(10)
    })
  })

  describe('data property', () => {
    test('should work', () => {
      const icns = new Icns()
      expect(icns.data.length).toBeGreaterThan(0)
      icns.data = fs.readFileSync('./test/sample.icns')
      expect(icns.images.length).toBe(10)
    })
  })

  describe('appendImage', () => {
    test('should work for PNG', () => {
      const buf = fs.readFileSync('./test/1024x1024.png')
      const icns = new Icns()
      expect(icns.images.length).toBe(0)
      icns.appendImage(buf, 'ic10')
      expect(icns.images.length).toBe(1)
      icns.appendImage(buf, 'ic10')
      expect(icns.images.length).toBe(2)
    })

    test('should work for ARGB', () => {
      const buf = fs.readFileSync('./test/16x16.png')
      const icns = new Icns()
      expect(icns.images.length).toBe(0)
      icns.appendImage(buf, 'ic04')
      expect(icns.images.length).toBe(1)
      icns.appendImage(buf, 'ic04')
      expect(icns.images.length).toBe(2)
    })

    test('should throw error if buffer is not PNG format', () => {
      const buf = fs.readFileSync('./test/1024x1024.jpg')
      const icns = new Icns()
      expect(() => icns.appendImage(buf, 'ic10')).toThrowError(TypeError)
    })

    test('should throw error if buffer is not square', () => {
      const buf = fs.readFileSync('./test/256x128.png')
      const icns = new Icns()
      expect(() => icns.appendImage(buf, 'ic10')).toThrowError(TypeError)
    })

    test('should throw error if buffer is not supported size', () => {
      const buf = fs.readFileSync('./test/100x100.png')
      const icns = new Icns()
      expect(() => icns.appendImage(buf, 'ic10')).toThrowError(TypeError)
    })
  })
})
