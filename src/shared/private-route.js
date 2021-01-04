import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        sessionStorage.getItem('auth_token')
            ? <Component {...props} />
            : <Redirect to={{ pathname: '/logout', state: { from: props.location } }} />
    )} />
)