import { Socket } from 'phoenix'
import sagas from './cotaWebSocket'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { POSITION_UPDATE, ROUTE_FILTER } from '../actions'

jest.mock('phoenix')

// This is kinda weird. The filter represents what the state really looks like,
// but the position event is only used for testing. We really don't have time to
// clean this up now, but might want to look into it in the future
const reducer = (state = { filter: ['yahtzee'], positionEvent: [] }, action) => {
  if (action.type === POSITION_UPDATE) {
    return Object.assign({}, state, { positionEvent: [...state.positionEvent, action] })
  }
  return state
}

describe('websocketSaga', () => {
  let channel, on, push, store, onOpen
  beforeEach(async () => {
    channel = jest.fn()
    on = jest.fn()
    push = jest.fn()
    onOpen = jest.fn()
    Socket.mockImplementation(() => ({
      connect: jest.fn(),
      onOpen: onOpen,
      channel: channel.mockReturnValue({
        on: on,
        push: push,
        join: jest.fn().mockReturnValue({
          receive: jest.fn().mockReturnValue({
            receive: jest.fn().mockReturnValue({
              receive: jest.fn()
            })
          })
        })
      })
    }))

    let sagaMiddleware = createSagaMiddleware()
    store = createStore(reducer, applyMiddleware(sagaMiddleware))
    sagaMiddleware.run(sagas)
  })

  describe('with no route filter action ever sent', () => {
    it('does not establish a connection to socket and channel with an empty filter', () => {
      // global window object doesn't exist when running in node
      expect(Socket).not.toHaveBeenCalledWith('undefined/socket')
      expect(channel).not.toHaveBeenCalledWith('streaming:central_ohio_transit_authority__cota_stream', { 'vehicle.trip.route_id': [] })
    })
  })

  describe('with a route filter action having been sent', () => {
    beforeEach(() => {
      store.dispatch({ type: ROUTE_FILTER, 'filter': ['yahtzee'] })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('sends the current route filter when the socket is opened', () => {
      const onOpenCallback = onOpen.mock.calls[0][0]
      onOpenCallback()

      expect(push).toBeCalledWith('filter', { 'vehicle.trip.route_id': ['yahtzee'] })
    })

    it('puts messages on event bus when position updates come from the server', () => {
      let [eventType, emitter] = on.mock.calls[0]
      emitter({ abc: 'test' })

      expect(eventType).toBe('update')
      expect(store.getState().positionEvent).toContainEqual({ type: POSITION_UPDATE, update: { abc: 'test' } })
    })

    it('pushes a filter to the channel based on a ROUTE_FILTER event', () => {
      store.dispatch({ type: ROUTE_FILTER, 'filter': ['yeet'] })
      expect(push).toBeCalledWith('filter', { 'vehicle.trip.route_id': ['yeet'] })
    })

    it('does not re-establish the websocket based on a ROUTE_FILTER event', () => {
      store.dispatch({ type: ROUTE_FILTER, 'filter': ['yeet'] })
      expect(onOpen).toHaveBeenCalledTimes(1)
    })

    it('pushes no filter to the channel when filter is an empty list', () => {
      store.dispatch({ type: ROUTE_FILTER, 'filter': [] })
      expect(push).toBeCalledWith('filter', {})
    })

    it('pushes no filter to the channel when filter is undefined', () => {
      store.dispatch({ type: ROUTE_FILTER })
      expect(push).toBeCalledWith('filter', {})
    })
  })
})
