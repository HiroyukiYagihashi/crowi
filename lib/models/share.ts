import { Types, Document, Model, Schema, model } from 'mongoose'
// import Debug from 'debug'
import uuidv4 from 'uuid/v4'
import mongoosePaginate from 'mongoose-paginate'

const STATUS_ACTIVE = 'active'
const STATUS_INACTIVE = 'inactive'

export interface ShareDocument extends Document {
  uuid: string
  page: Types.ObjectId
  status: string
  creator: Types.ObjectId
  secretKeyword: string
  createdAt: Date
  updatedAt: Date

  isActive(): boolean
  isInactive(): boolean
  isCreator(userData): boolean
}

export interface ShareModel extends Model<ShareDocument> {
  isExists(query): Promise<any>
  findShares(query, options: object): Promise<any>
  findShare(query, options: object): Promise<any>
  findShareByUuid(uuid, query, options): Promise<any>
  findShareByPageId(pageId, query, options): Promise<any>
  createShare(pageId: Types.ObjectId, user: Types.ObjectId): Promise<ShareDocument>
  delete(query: object): Promise<any>
  deleteById(id): Promise<any>
  deleteByPageId(pageId): Promise<any>

  STATUS_ACTIVE: string
  STATUS_INACTIVE: string
}

export default crowi => {
  // const debug = Debug('crowi:models:share')

  const shareSchema = new Schema<ShareDocument, ShareModel>({
    uuid: { type: String, required: true, index: true, unique: true },
    page: { type: Schema.Types.ObjectId, ref: 'Page', required: true, index: true },
    status: { type: String, default: STATUS_ACTIVE, index: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    secretKeyword: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  })
  shareSchema.virtual('accesses', {
    ref: 'ShareAccess',
    localField: '_id',
    foreignField: 'share',
  })
  shareSchema.set('toObject', { virtuals: true })
  shareSchema.set('toJSON', { virtuals: true })
  shareSchema.plugin(mongoosePaginate)

  const Share = model<ShareDocument, ShareModel>('Share', shareSchema)

  shareSchema.methods.isActive = function() {
    return this.status === STATUS_ACTIVE
  }

  shareSchema.methods.isInactive = function() {
    return this.status === STATUS_INACTIVE
  }

  shareSchema.methods.isCreator = function(userData) {
    this.populate('creator')
    const creatorId = this.creator._id.toString()
    const userId = userData._id.toString()

    return creatorId === userId
  }

  shareSchema.statics.isExists = async function(query) {
    const count = await this.count(query)
    return count > 0
  }

  shareSchema.statics.findShares = async function(query, options = {}) {
    const page = options.page || 1
    const limit = options.limit || 50
    const sort = options.sort || { createdAt: -1 }

    const { populateAccesses = false } = options
    const optionalDocs = populateAccesses
      ? [
          {
            path: 'accesses',
            populate: { path: 'tracking' },
            options: { sort: { lastAccessedAt: -1 } },
          },
        ]
      : []

    return this.paginate(query, {
      page,
      limit,
      sort,
      populate: [
        ...optionalDocs,
        {
          path: 'page',
        },
        {
          path: 'creator',
        },
      ],
    })
  }

  shareSchema.statics.findShare = async function(query, options = {}) {
    const Page = crowi.model('Page')

    const { populateAccesses = false } = options
    const optionalDocs = populateAccesses
      ? [
          {
            path: 'accesses',
            populate: { path: 'tracking' },
          },
        ]
      : []

    const shareData = await this.findOne(query)
      .findOne(query)
      .populate([...optionalDocs, { path: 'page' }, { path: 'creator' }])
      .exec()

    if (shareData === null) {
      const shareNotFoundError = new Error('Share Not Found')
      shareNotFoundError.name = 'Crowi:Share:NotFound'
      throw shareNotFoundError
    }

    shareData.page = await Page.populatePageData(shareData.page)
    return shareData
  }

  shareSchema.statics.findShareByUuid = async function(uuid, query, options) {
    query = Object.assign({ uuid }, query !== undefined ? query : {})
    return this.findShare(query, options)
  }

  shareSchema.statics.findShareByPageId = async function(pageId, query, options) {
    query = Object.assign({ page: pageId }, query !== undefined ? query : {})

    return this.findShare(query, options)
  }

  shareSchema.statics.createShare = async function(pageId, user) {
    const isExists = await Share.isExists({
      page: pageId,
      status: STATUS_ACTIVE,
    })
    if (isExists) {
      throw new Error('Cannot create new share.')
    }

    return Share.create({
      uuid: uuidv4(),
      page: pageId,
      creator: user,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: STATUS_ACTIVE,
    })
  }

  shareSchema.statics.delete = async function(query = {}) {
    const defaultQuery = { status: STATUS_ACTIVE }
    return Share.findOneAndUpdate({ ...query, ...defaultQuery }, { status: STATUS_INACTIVE }, { new: true }).exec()
  }

  shareSchema.statics.deleteById = async function(id) {
    return Share.delete({ _id: id })
  }

  shareSchema.statics.deleteByPageId = async function(pageId) {
    return Share.delete({ page: pageId })
  }

  shareSchema.statics.STATUS_ACTIVE = STATUS_ACTIVE
  shareSchema.statics.STATUS_INACTIVE = STATUS_INACTIVE

  return Share
}
