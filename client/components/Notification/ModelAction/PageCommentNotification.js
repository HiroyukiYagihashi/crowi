import React from 'react'

import NotificationContent from '../NotificationContent'
import PagePath from '../../PageList/PagePath'

export default class PageCommentNotification extends React.Component {
  getActionUsers() {
    const notification = this.props.notification
    const latestUsers = notification.latestActionUsers.map(user => {
      return '@' + user.username
    })

    let actionedUsers = ''
    const latestUsersCount = latestUsers.length
    if (latestUsersCount === 1) {
      actionedUsers = latestUsers[0]
    } else if (notification.actionUsersCount >= 4) {
      actionedUsers = latestUsers.slice(0, 2).join(', ') + ` and ${notification.actionUsersCount - 2} others`
    } else {
      actionedUsers = latestUsers.join(', ')
    }

    return actionedUsers
  }

  render() {
    const notification = this.props.notification

    return (
      <NotificationContent {...this.props} icon="comment">
        <span>
          <b>{this.getActionUsers()}</b> commented on <PagePath page={notification.target} />
        </span>
      </NotificationContent>
    )
  }
}

PageCommentNotification.propTypes = {
  notification: React.PropTypes.object.isRequired,
  onClick: React.PropTypes.func.isRequired,
}

PageCommentNotification.defaultProps = {}
