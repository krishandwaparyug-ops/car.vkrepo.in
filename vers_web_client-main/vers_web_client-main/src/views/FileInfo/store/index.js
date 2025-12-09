import { combineReducers } from '@reduxjs/toolkit'
import data from './dataSlice'

const fileInfoReducer = combineReducers({
    data,
})

export default fileInfoReducer
