import React, { Component } from 'react';
import { slide as Menu } from 'react-burger-menu';

export default class HamburgMenu extends Component {
    render() {
        return (
            <div>
                <Menu right noOverlay className={"smMenu"}>
                    <a id="home" className="menu-item" href="/">Dashboard</a>
                    <a id="Profile Summary" className="menu-item" href="/about"> Products</a>
                    <a id="Departments" className="menu-item" href="/contact">Policy Issuance</a>
                    <a id="Quick Links" className="menu-item" href="">Services</a>
                    <a id="Knowedge" className="menu-item" href="">Support</a>
                </Menu>
            </div>
        )
    }
}
