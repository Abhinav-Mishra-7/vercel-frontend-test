import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../authSlice"
import editorialReducer from "../editorialSlice"

export const store = configureStore({
    reducer:{
        auth: authReducer ,
        editorial: editorialReducer
    }
}) ;