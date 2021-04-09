import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import axios from "../../shared/axios"
import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";

const initialValues = {};
  

class Table extends Component {

    state = {
        motor_list: [],
        health_list: [
            {
              "id": "6",
              "product": "Arogya Sanjeevani",
              "image" : "Miscellaneous-car.svg"
            }            
          ]
      };

    buy_policy = (productId) => {
        if(productId < 6){
            this.props.history.push(`/Registration/${productId}`);
        }else
        this.props.history.push(`/Health/${productId}`);
    }   

    getPolicyList = () => {
        this.props.loadingStart();
        axios.get(`vehicle/types`)
          .then(res => {
            this.setState({
                motor_list: res.data.data
            });
            this.props.loadingStop();
          })
          .catch(err => {
            this.setState({
                motor_list: [] })
            this.props.loadingStop();
          });
    }

    componentDidMount() {
        this.getPolicyList()
    }


    render() {
        const { motor_list, health_list } = this.state;
        return (
            <Row>
                <Col sm={12}>
                    <div className="tablecontent">
                    {motor_list.length > 0 ?
                        <table>
                            {(this.props.tabId == '1') ? 
                                (<tbody>                                
                                    {motor_list.map((part, partIndex) => ( 
                                    <tr key={partIndex}>
                                        <td className="W-10"><img src={require(`../../assets/images/${part.logo}`)} alt="" /></td>
                                        <td className="W-70">{part.name}</td>
                                        <td className="W-10 text-right"> <button className="buy" onClick= {this.buy_policy.bind(this, part.id )}>Buy</button></td>
                                        <td className="W-10 text-right"> <button className="renew">Renew</button></td>
                                    </tr>
                                    ))
                                    }
                                </tbody>) : 

                                (<tbody>
                                    {health_list.map((part, partIndex) => ( 
                                    <tr key={partIndex}>
                                        <td className="W-10"><img src={require(`../../assets/images/${part.image}`)} alt="" /></td>
                                        <td className="W-70">{part.product}</td>
                                        <td className="W-10 text-right"> <button className="buy" onClick= {this.buy_policy.bind(this, part.id )} >Buy</button></td>
                                        {(part.product != 'Arogya Sanjeevani') ? (<td className="W-10 text-right"> <button className="renew">Renew</button></td>):null}
                                    </tr>
                                    ))
                                    }
                                </tbody>)
                            }
                        </table>
                        : null}
                    </div>
                    </Col>
                  </Row>  
        ) 
    }
}

const mapStateToProps = state => {
    return {
      loading: state.loader.loading
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop())
    };
  };


export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Table));