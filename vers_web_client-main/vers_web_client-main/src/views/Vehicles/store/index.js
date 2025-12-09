import { combineReducers } from '@reduxjs/toolkit'
import state from './stateSlice'
import data from './dataSlice'

const VehicleReducer = combineReducers({
    state,
    data,
})

export default VehicleReducer
