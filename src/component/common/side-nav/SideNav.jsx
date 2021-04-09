import React, { Component } from "react";
import { Router, Route, Link } from "react-router-dom";
import axios from "../../../shared/axios";
import { authLogout } from "../../../store/actions/auth";
import { connect } from "react-redux";
import Encryption from "../../../shared/payload-encryption";
import { withRouter } from "react-router-dom";

class SideNav extends Component {
  handleLogout = () => {
    const formData = new FormData();
    let encryption = new Encryption();
    let post_data = {};
    let bc_data = sessionStorage.getItem("bcLoginData")
      ? sessionStorage.getItem("bcLoginData")
      : "";
    if (bc_data) {
      bc_data = JSON.parse(encryption.decrypt(bc_data));
    }
    post_data = {
      token: bc_data ? bc_data.token : "",
      bc_agent_id: bc_data ? bc_data.user_info.data.user.username : "",
      bc_master_id: bc_data ? bc_data.agent_id : "",
    };

    formData.append("enc_data", encryption.encrypt(JSON.stringify(post_data)));
    axios
      .post("/logout", formData)
      .then((res) => {
        localStorage.removeItem("cons_reg_info");
        // window.location = `${res.data.data.logout_url}`
        this.props.history.push(`/logout`);
        this.props.logout();
      })
      .catch((err) => {
        this.props.logout();
        // this.props.loadingStop();
      });
  };

  render() {
    return (
      <>
        <nav className="flex-fill leftNav">
          <ul className="navPan">
            <li>
              <Link to="/Reports" activeClassName="active">
                <span className="leftIcon01">
                  <img
                    src={require("../../../assets/images/leftIcon02Hover.svg")}
                    alt=""
                  />
                </span>
                Admin 
              </Link>
            </li>
            
          </ul>

          <button className="btn-lg" onClick={this.handleLogout}>
            <a activeClassName="active">
              <span className="leftIcon01">
                <img
                  src={require("../../../assets/images/Logout.svg")}
                  alt=""
                />
              </span>
              Logout
            </a>
          </button>
        </nav>
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(authLogout()),
  };
};

const mapStateToProps = (state) => {
  return {
    loading: state.loader.loading,
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SideNav)
);
