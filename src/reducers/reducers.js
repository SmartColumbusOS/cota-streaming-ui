import { combineReducers } from 'redux'
import { POSITION_UPDATE, ROUTE_FILTER, ROUTE_UPDATE } from '../actions'
import { COTA } from '../variables'
import _ from 'lodash'

const filter = (filter = [], action) => {
  switch (action.type) {
    case ROUTE_FILTER:
      return action.filter
    default:
      return filter
  }
}

const provider = (provider = { name: COTA }, action) => {
  switch (action.type) {
    case ROUTE_FILTER:
      return Object.assign({}, provider, { name: COTA })
    default:
      return provider
  }
}

const data = (data = {}, action) => {
  switch (action.type) {
    case POSITION_UPDATE:
      let vehicle = action.update.vehicle
      let value = {
        vehicleId: vehicle.vehicle.id,
        routeId: vehicle.trip.route_id,
        latitude: vehicle.position.latitude,
        longitude: vehicle.position.longitude,
        bearing: vehicle.position.bearing || 0,
        timestamp: vehicle.timestamp * 1000,
        provider: vehicle.provider
      }

      return Object.assign({}, data, { [value.vehicleId]: value })
    case ROUTE_FILTER:
      return {}
    default:
      return data
  }
}

const availableRoutes = (availableRoutes = [], action) => {
  switch (action.type) {
    case ROUTE_UPDATE:
      const sorted = _.sortBy(action.update, ({ linenum }) => linenum);
      const uniqueRoutes = _.sortedUniqBy(sorted, ({ linenum }) => linenum)
      let routesToUse = uniqueRoutes.map((route) => {
        const lineNumber = new String(route.linenum).padStart(3, '0')
        const lineName = `${route.linenum} - ${route.linename}`
        return { value: lineNumber, label: lineName, provider: 'COTA' }
      })
      return routesToUse
    default:
      return availableRoutes
  }
}

export default combineReducers({
  filter,
  data,
  availableRoutes,
  provider
})
