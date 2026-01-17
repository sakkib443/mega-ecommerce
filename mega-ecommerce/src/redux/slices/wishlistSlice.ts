import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
    id: number;
    name: string;
    price: number;
    mrp: number;
    image: string;
    category: string;
    rating: number;
}

interface WishlistState {
    items: WishlistItem[];
    totalItems: number;
}

const initialState: WishlistState = {
    items: [],
    totalItems: 0,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
            const exists = state.items.find(item => item.id === action.payload.id);
            if (!exists) {
                state.items.push(action.payload);
                state.totalItems = state.items.length;
            }
        },

        removeFromWishlist: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            state.totalItems = state.items.length;
        },

        toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.items.splice(index, 1);
            } else {
                state.items.push(action.payload);
            }
            state.totalItems = state.items.length;
        },

        clearWishlist: (state) => {
            state.items = [];
            state.totalItems = 0;
        },
    },
});

export const {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
