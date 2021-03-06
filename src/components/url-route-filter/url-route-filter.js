import React from 'react'
import _ from 'lodash'

const CMAX_LINE_NUMBER = '101'

export default class extends React.Component {
  componentDidMount = () => {
    this.props.fetchAvailableRoutes()
  }

  updateUrl = (id) => {
    return this.props.history.push(id)
  }

  updateState = (id) => {
    return this.props.applyStreamFilter([id])
  }

  routeIsNotValid = (id) => {
    return _.find(this.props.availableRoutes, { value: id }) === undefined
  }

  componentDidUpdate = (previousProps) => {
    const { selectedRouteId, match: { params: { routeId: urlRouteId } } } = this.props

    const stateAndUrlOutOfSync = selectedRouteId !== urlRouteId
    const stateWasUpdated = selectedRouteId !== previousProps.selectedRouteId

    if (this.routeIsNotValid(urlRouteId)) {
      this.updateState(CMAX_LINE_NUMBER)
      return this.updateUrl(CMAX_LINE_NUMBER)
    }

    if (stateAndUrlOutOfSync) {
      if (stateWasUpdated) {
        return this.updateUrl(selectedRouteId)
      } else {
        return this.updateState(urlRouteId)
      }
    }
  }

  render = () => {
    return <url-route-filter />
  }
}
