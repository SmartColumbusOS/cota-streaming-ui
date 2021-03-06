import reducer from './index'
import { POSITION_UPDATE, LEAP_POSITION_UPDATE, ROUTE_FILTER, ROUTE_FETCH, ROUTE_UPDATE } from '../actions'
import { COTA, LEAP } from '../variables'

describe('cotaApp reducers', () => {
  it('will save the filter when processing a ROUTE_FILTER action', () => {
    let newState = reducer(undefined, { type: ROUTE_FILTER, filter: ['route1'] })
    expect(newState.filter).toEqual(['route1'])
  })

  it('will not modify the filter on a unknown event', () => {
    let newState = reducer({ filter: ['yahtzee'] }, { type: 'UNKNOWN_ACTION', stuff: [] })
    expect(newState.filter).toEqual(['yahtzee'])
  })

  it('will transform the data on a POSITION_UPDATE action', () => {
    let message = {
      'vehicle': {
        'vehicle': {
          'label': '1213',
          'id': '11213'
        },
        'trip': {
          'trip_id': '628095',
          'start_date': '20180628',
          'route_id': '002'
        },
        'timestamp': 1530200139,
        'position': {
          'speed': 0.000006558918357768562,
          'longitude': -82.95664978027344,
          'latitude': 39.95763397216797,
          'bearing': 270
        },
        'current_status': 'IN_TRANSIT_TO'
      },
      'id': '1213'
    }

    let state = {
      '11213': {
        'vehicleId': '11213',
        'routeId': '002',
        'latitude': 39.95763397216797,
        'longitude': -82.95664978027344,
        'bearing': 270,
        'timestamp': 1530200139000
      }
    }

    let newState = reducer(undefined, { type: POSITION_UPDATE, update: message })
    expect(newState.data).toEqual(state)
  })

  it('will transform an empty action into a bearing', () => {
    let message = {
      vehicle: {
        vehicle: {
          id: '1234'
        },
        trip: {},
        position: {},
        timestamp: 0
      }
    }
    let newState = reducer(undefined, { type: POSITION_UPDATE, update: message })
    expect(newState.data['1234'].bearing).toEqual(0)
  })

  it('will not transform the payload on an unknown event', () => {
    let newState = reducer({ data: ['yahtzee'] }, { type: 'UNKNOWN_ACTION', stuff: [] })
    expect(newState.data).toEqual(['yahtzee'])
  })

  it('will remove all data records on register filter action', () => {
    let currentState = {
      filter: {},
      data: {
        '98765': {
          'vehicleId': '98765',
          'routeId': '002',
          'latitude': 39.95763397216797,
          'longitude': -82.95664978027344,
          'bearing': 270,
          'timestamp': 1530200139000
        },
        '11213': {
          'vehicleId': '11213',
          'routeId': '003',
          'latitude': 39.95763397216797,
          'longitude': -82.95664978027344,
          'bearing': 270,
          'timestamp': 1530200139000
        }
      }
    }

    let expectedData = {}

    let newState = reducer(currentState, { type: 'ROUTE_FILTER', filter: ['003'] })
    expect(newState.data).toEqual(expectedData)
  })

  it('will transform the data on a ROUTE_UPDATE action', () => {
    let message = [
      {
        'linenum': 1,
        'linename': 'Crazy Town'
      },
      {
        'linenum': 101,
        'linename': 'Smallville'
      }
    ]

    let state = [
      { value: '001', label: '1 - Crazy Town', provider: 'COTA' },
      { value: '101', label: '101 - Smallville', provider: 'COTA' }
    ]

    let newState = reducer(undefined, { type: ROUTE_UPDATE, update: message })
    expect(newState.availableRoutes[0]).toEqual(state[0])
    expect(newState.availableRoutes[1]).toEqual(state[1])
  })

  it('will not transform the availableRoutes on an unknown event', () => {
    let newState = reducer({ availableRoutes: [{ value: '001', label: '1 - Crazy Town' }] }, { type: 'UNKNOWN_ACTION', stuff: [] })
    expect(newState.availableRoutes).toEqual([{ value: '001', label: '1 - Crazy Town' }])
  })

  it('will not remove all availableRoutes on route fetch action', () => {
    const availableRoutes = [
      { value: '001', label: '1 - Crazy Town' },
      { value: '101', label: '101 - Smallville' }
    ]
    let currentState = {
      filter: {},
      data: {},
      availableRoutes: availableRoutes
    }

    let newState = reducer(currentState, { type: ROUTE_FETCH })
    expect(newState.availableRoutes).toEqual(availableRoutes)
  })

  it('sets the provider to COTA by default for all ROUTE_FILTER actions', () => {
    let newState = reducer(undefined, { type: 'ROUTE_FILTER', filter: ['003'] })

    expect(newState.provider).toEqual({ name: COTA })
  })

  describe('LEAP', () => {
    it('has the LEAP route by default', () => {
      let newState = reducer(undefined, { type: 'UNKNOWN_ACTION', stuff: [] })

      expect(newState.availableRoutes).toEqual([{ value: 'LEAP', label: 'SMRT - Linden LEAP', provider: 'LEAP' }])
    })

    it('has the LEAP route last after routes are updated', () => {
      const message = [{ value: '001', label: '1 - Crazy Town', provider: 'COTA' }]
      let newState = reducer(undefined, { type: ROUTE_UPDATE, update: message })

      expect(newState.availableRoutes[newState.availableRoutes.length - 1])
        .toEqual({ value: 'LEAP', label: 'SMRT - Linden LEAP', provider: 'LEAP' })
    })

    it('transforms the data on a LEAP_POSITION_UPDATE action', () => {
      const state = {
        data: {
          'SIMUPONYTAvehicle_api-test-public-v3-2': {
            'stuff': 'that-should-not-be-changed'
          }
        }
      }
      const message = {
        'attributes': {
            'vehicle_id': 'SIMUPONYTAvehicle_api-test-public-v3-5',
            'lat': 43.538284742935346,
            'lon': 1.3600251758143491
        }
      }

      const expected_data = {
        ...state.data,
        ...{
          'SIMUPONYTAvehicle_api-test-public-v3-5': {
            vehicleId: 'SIMUPONYTAvehicle_api-test-public-v3-5',
            latitude: 43.538284742935346,
            longitude: 1.3600251758143491,
            bearing: 0,
            provider: 'LEAP'
          }
        }
      }

      let newState = reducer(state, { type: LEAP_POSITION_UPDATE, update: message })

      expect(newState.data).toEqual(expected_data)
    })

    it('sets the provider to LEAP when ROUTE_FILTER has LEAP filter', () => {
      let newState = reducer(undefined, { type: 'ROUTE_FILTER', filter: ['LEAP'] })

      expect(newState.provider).toEqual({ name: LEAP })
    })
  })
})
