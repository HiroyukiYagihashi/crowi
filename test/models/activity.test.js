var chai = require('chai')

var expect = chai.expect

var sinon = require('sinon')

var sinonChai = require('sinon-chai')

var utils = require('../utils.js')
chai.use(sinonChai)

describe('Activity', function() {
  var Activity = utils.models.Activity
  var mongoose = utils.mongoose

  describe('.createByParameters', function() {
    context('correct parameters', function() {
      it('should create', function() {
        var user_id = mongoose.Types.ObjectId()
        var target_id = mongoose.Types.ObjectId()

        var parameters = {
          user: user_id,
          targetModel: 'Page',
          target: target_id,
          action: 'COMMENT',
        }

        return Activity.createByParameters(parameters).then(
          function(activity) {
            expect(activity.user).to.be.equal(user_id)
            expect(activity.target).to.be.equal(target_id)
            expect(activity.targetModel).to.be.equal('Page')
            expect(activity.action).to.be.equal('COMMENT')
          },
          function(err) {
            throw new Error(err)
          },
        )
      })
    })

    context('invalid parameters', function() {
      it('should not create', function() {
        var user_id = mongoose.Types.ObjectId()
        var target_id = mongoose.Types.ObjectId()

        var parameters = {
          user: user_id,
          targetModel: 'Page2', // validation error
          target: target_id,
          action: 'COMMENT',
        }

        return Activity.createByParameters(parameters).then(
          function(activity) {
            throw new Error('not fulfilled')
          },
          function(err) {
            expect(err.message).to.be.equal('Activity validation failed')
          },
        )
      })
    })
  })
})
