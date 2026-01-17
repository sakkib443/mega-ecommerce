import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    cartReducer,
    authReducer,
    wishlistReducer,
    themeReducer,
    productReducer,
    uiReducer
} from './slices';

const rootReducer = combineReducers({
    cart: cartReducer,
    auth: authReducer,
    wishlist: wishlistReducer,
    theme: themeReducer,
    products: productReducer,
    ui: uiReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
