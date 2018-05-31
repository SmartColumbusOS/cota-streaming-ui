import React, { Component } from 'react'
import './App.css'
import DataTable from './components/data-table.js'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {tableData: ["start text"]}
  }

  componentDidMount() {
    var websocket = new WebSocket('ws://localhost:8080')
    websocket.addEventListener('open', function open() {})

    websocket.addEventListener('message', (data, flags) => 
  {
    this.state.tableData.unshift(data.data)
    this.setState({tableData: this.state.tableData})
  })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src="https://www.cota.com/wp-content/uploads/2016/04/COTA-Logo-White.png" className="App-logo" alt="logo" />
          <h1 className="App-title">Actual Real-Time COTA Data</h1>
        </header>
        <DataTable tableData={this.state.tableData} />
      </div> 
    )
  }
}

export default App
