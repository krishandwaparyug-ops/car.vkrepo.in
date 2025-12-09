import { combineReducers } from '@reduxjs/toolkit'
import state from './stateSlice'
import data from './dataSlice'

const OfficeReducer = combineReducers({
    state,
    data,
})

export default OfficeReducer
