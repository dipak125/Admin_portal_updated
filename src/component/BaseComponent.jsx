import React, { Component } from 'react';

import Header from './common/header/Header';


export default class BaseComponent extends Component {
    render() {
        return (
            <>
                <Header/>
                    {this.props.children}
               
                
            </>
        )
    }
}
