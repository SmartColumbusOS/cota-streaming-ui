import reducer from './index'
import { POSITION_UPDATE, ROUTE_FILTER } from '../actions'

describe('cotaApp reducers', () => {
  it('will save the filter when processing a ROUTE_FILTER action', () => {
    let newState = reducer(undefined, {type: ROUTE_FILTER, filter: ['route1']})
    expect(newState.filter).toEqual(['route1'])
  })

  it('will not modify the filter on a unknown event', () => {
    let newState = reducer({filter: ['yahtzee']}, {type: 'UNKNOWN_ACTION', stuff: []})
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

    let newState = reducer(undefined, {type: POSITION_UPDATE, update: message})
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
    let newState = reducer(undefined, {type: POSITION_UPDATE, update: message})
    expect(newState.data['1234'].bearing).toEqual(0)
  })

  it('will not transform the payload on an unknown event', () => {
    let newState = reducer({data: ['yahtzee']}, {type: 'UNKNOWN_ACTION', stuff: []})
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

    let newState = reducer(currentState, {type: 'ROUTE_FILTER', filter: ['003']})
    expect(newState.data).toEqual(expectedData)
  })
})
