import leaflet from 'leaflet'
import busBlueSvg from '../../assets/blue-bus.svg'
import easymileSvg from '../../assets/map-marker-easymile.svg'
import iconFactory from './icon-factory'
import locationPin from '../../assets/ic_location-dot.svg'

describe('Icon Factory', () => {
  beforeEach(() => {
    leaflet.icon = jest.fn()
  })

  it('creates the icon scaled properly with a scale value of 1', () => {
    iconFactory.createLocationIcon(1)

    expect(leaflet.icon).toHaveBeenCalledWith({
      iconUrl: locationPin,
      iconSize: [2, 2]
    })
  })

  it('creates the icon scaled properly with a scale value of 10', () => {
    iconFactory.createBusIcon(10)

    expect(leaflet.icon).toHaveBeenCalledWith({
      iconUrl: busBlueSvg,
      iconSize: [32, 27.5]
    })
  })

  it('creates an easymile icon for easymile route', () => {
    iconFactory.createBusIcon('10', 'LEAP')

    expect(leaflet.icon).toHaveBeenCalledWith({
      iconUrl: easymileSvg,
      iconSize: [20, 20]
    })
  })
})
