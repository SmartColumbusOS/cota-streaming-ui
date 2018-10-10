import {configure} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ReactDOM from 'react-dom'
import React from 'react'
import a11y from 'react-a11y'

window.React = React
configure({ adapter: new Adapter() })

// react-a11y configuration can be found at https://github.com/reactjs/react-a11y
a11y(React, ReactDOM, {
  rules: {
    'img-uses-alt': 'warn',
    'redundant-alt': [ 'warn', [ 'image', 'photo', 'logo' ] ],
    'button-role-space': 'warn',
    'hidden-uses-tabindex': 'warn',
    'label-uses-for': 'warn',
    'mouse-events-map-to-key-events': 'warn',
    'onclick-uses-role': 'warn',
    'onclick-uses-tabindex': 'warn',
    'tabindex-uses-button': 'warn',
    'use-onblur-not-onchange': 'warn',
    'valid-aria-role': 'warn'
  }
})
