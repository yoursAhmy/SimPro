import { createSlice } from "@reduxjs/toolkit"

const quotesSlice = createSlice({
    name: "quotes",
    initialState: {
        quotes:[],
    },
    reducers: {
        setQuotes: (state, action) => {
            state.quotes = action.payload;
        },
        clearQuotes: (state) => {
            state.quotes= [];
        }
    }
})

export const {setQuotes, clearQuotes} = quotesSlice.actions;
export default quotesSlice.reducer;