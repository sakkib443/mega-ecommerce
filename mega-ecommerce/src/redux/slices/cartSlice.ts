import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    mrp: number;
    image: string;
    category: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    totalQuantity: number;
    totalPrice: number;
}

const initialState: CartState = {
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
};

const calculateTotals = (items: CartItem[]) => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { totalQuantity, totalPrice };
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
            const existingItem = state.items.find(item => item.id === action.payload.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ ...action.payload, quantity: 1 });
            }

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalPrice = totals.totalPrice;
        },

        removeFromCart: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.id !== action.payload);

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalPrice = totals.totalPrice;
        },

        increaseQuantity: (state, action: PayloadAction<number>) => {
            const item = state.items.find(item => item.id === action.payload);
            if (item) {
                item.quantity += 1;
            }

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalPrice = totals.totalPrice;
        },

        decreaseQuantity: (state, action: PayloadAction<number>) => {
            const item = state.items.find(item => item.id === action.payload);
            if (item) {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    state.items = state.items.filter(i => i.id !== action.payload);
                }
            }

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalPrice = totals.totalPrice;
        },

        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalPrice = 0;
        },

        updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
            const item = state.items.find(item => item.id === action.payload.id);
            if (item && action.payload.quantity > 0) {
                item.quantity = action.payload.quantity;
            }

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalPrice = totals.totalPrice;
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    updateQuantity
} = cartSlice.actions;

export default cartSlice.reducer;
