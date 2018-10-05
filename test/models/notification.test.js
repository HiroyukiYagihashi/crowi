var chai = require('chai')

var expect = chai.expect

var sinon = require('sinon')

var sinonChai = require('sinon-chai')

var utils = require('../utils.js')
chai.use(sinonChai)

describe('Notification', function() {
  var Comment = utils.models.Comment
  var Notification = utils.models.Notification
  var Page = utils.models.Page
  var User = utils.models.User
  var Activity = utils.models.Activity
  var mongoose = utils.mongoose
  var conn = utils.mongoose.connection

  var data = {}

  describe('.upsertByActivity', function() {
    context('valid parameters', function() {
      it('should create', function() {
        var user_id_1 = mongoose.Types.ObjectId()
        var user_id_2 = mongoose.Types.ObjectId()
        var user_id_3 = mongoose.Types.ObjectId()

        var target_id = mongoose.Types.ObjectId()

        var sameActivityUsers = [user_id_1, user_id_2, user_id_3]

        var activity = {
          user: user_id_1,
          targetModel: 'Page',
          target: target_id,
          action: 'COMMENT',
        }

        return Notification.upsertByActivity(user_id_1, sameActivityUsers, activity)
          .then(function(notification) {
            expect(notification.user.toString()).to.be.equal(user_id_1.toString())
            expect(notification.targetModel).to.be.equal('Page')
            expect(notification.target.toString()).to.be.equal(target_id.toString())
            expect(notification.action).to.be.equal('COMMENT')
            expect(notification.isRead).to.be.equal(false)
            expect(notification.activities).to.be.length(3)
          })
          .catch(function(err) {
            throw new Error(err)
          })
      })
    })

    context('invalid parameters', function() {
      it('should create', function() {
        var user_id_1 = mongoose.Types.ObjectId()
        var user_id_2 = mongoose.Types.ObjectId()
        var user_id_3 = mongoose.Types.ObjectId()

        var target_id = mongoose.Types.ObjectId()

        var sameActivityUsers = [user_id_1, user_id_2, user_id_3]

        var activity = {
          user: user_id_1,
          targetModel: 'Page2', // invalid
          target: target_id,
          action: 'COMMENT',
        }

        return Notification.upsertByActivity(user_id_1, sameActivityUsers, activity).then(
          function(notification) {
            throw new Error('validation not work')
          },
          function(err) {
            expect(err.message === 'Notification validation failed')
          },
        )
      })
    })
  })
})
