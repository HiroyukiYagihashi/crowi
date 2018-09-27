import React from 'react'

import DropdownMenu from './HeaderNotification/DropdownMenu'
import Icon from './Common/Icon'

export default class HeaderNotification extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      count: '',
      loaded: false,
      notifications: [],
      isRead: true,
    }
  }

  componentDidMount() {
    this.initializeSocket()
    this.fetchList()
    this.fetchStatus()
  }

  initializeSocket() {
    this.props.crowi.getSocket().on('notification updated', data => {
      if (this.props.me === data.status.user) {
        this.fetchList()
        this.fetchStatus()
      }
    })
  }

  fetchStatus() {
    this.props.crowi
      .apiGet('/notification.status')
      .then(res => {
        if (res.status !== null) {
          if (res.status.isRead === false && res.status.count > 0) {
            this.setState({
              count: res.status.count,
              isRead: res.status.isRead,
            })
          }
        }
      })
      .catch(err => {
        // TODO: error handling
      })
  }

  updateStatus() {
    this.props.crowi
      .apiPost('/notification.status_read')
      .then(res => {
        this.setState({
          count: '',
          isRead: true,
        })
      })
      .catch(err => {
        // TODO: error handling
      })
  }

  fetchList() {
    const limit = 6

    this.props.crowi
      .apiGet('/notification.list', { limit: limit })
      .then(res => {
        this.setState({
          loaded: true,
          notifications: res.notifications,
        })
      })
      .catch(err => {
        // TODO: error handling
      })
  }

  handleOnClick(e) {
    e.preventDefault(e)
    this.updateStatus()
  }

  handleNotificationOnClick(notification) {
    this.props.crowi
      .apiPost('/notification.read', { id: notification._id })
      .then(res => {
        // jump to target page
        window.location.href = notification.target.path
      })
      .catch(err => {
        // TODO: error handling
      })
  }

  render() {
    let badge = ''
    if (this.state.count > 0) {
      badge = <span className="badge badge-danger notification-badge">{this.state.count}</span>
    }

    return (
      <div className="notification-wrapper">
        <a href="#" id="notif-opener" className="dropdown-toggle" data-toggle="dropdown" onClick={this.handleOnClick.bind(this)}>
          <Icon name="bell" /> {badge}
        </a>
        <DropdownMenu
          loaded={this.state.loaded}
          notifications={this.state.notifications}
          notificationClickHandler={this.handleNotificationOnClick.bind(this)}
        />
      </div>
    )
  }
}

HeaderNotification.propTypes = {}

HeaderNotification.defaltProps = {}
