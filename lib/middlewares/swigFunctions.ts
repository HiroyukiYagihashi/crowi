import { Express } from 'express'
import Crowi from 'server/crowi'
import functions from '../utils/swigFunctions'

export default (crowi: Crowi, app: Express) => {
  return (req, res, next) => {
    functions(crowi, app, req, res)
    next()
  }
}
