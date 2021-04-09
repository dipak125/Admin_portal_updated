import { createStore,combineReducers, applyMiddleware, compose } from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import thunk from 'redux-thunk'

import Auth from "./reducers/auth";
import Loader from "./reducers/loader";
import ProcessData from "./reducers/data";
import Sme from "./reducers/sme_fire";

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const composeEnhancers = compose;

const rootReducer = combineReducers(
    {
        auth: Auth,
        loader: Loader,
        processData: ProcessData,
        sme_fire:Sme
    }
)

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))

export default store