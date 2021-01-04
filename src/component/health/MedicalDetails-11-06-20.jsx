import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import axios from "../../shared/axios"

import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik'
import * as Yup from "yup";
import mapValues from 'lodash/mapValues';
import swal from 'sweetalert';



const validateMedicalDetails = Yup.object().shape({
    question_id: Yup.lazy(obj =>
        Yup.object(
            mapValues(obj => {     
                console.log('ssss===>',obj);
              //  console.log('aaaaa=====>',key)
           /* if (key.includes('question_id')) {
                return Yup.object().shape({
                question_id: Yup.string().required("Enter")
                })
            }*/
            })
        )
        )
        
}) 
        
// const initialValues = {
//     question_id_1 : "n"
// }
let styleData = {
    background:'blue'
}

let styleDataOuter = {
}

class MedicalDetails extends Component {

    state = {
        questionList: [],
        message: "",
        question_answer: [],
        flag: false,
        selected_answer:[],
        selected_question:[],
        validation_message:"",
        show:false,
        isForwarded : true
      };

    sumInsured = (productId) => {
        this.props.history.push(`/SelectDuration/${productId}`);
    }

    buy_policy = (productId) => {
        this.props.history.push(`/Health/${productId}`);
    } 

    handleClose=()=>{
        this.setState({ show: false });
    }

    handleChangeSubmit = (key,value) => {
        let question_id = [];
        let selected_answer = [];
        let selected_question = [];
        const formData = new FormData(); 
        
        if ( key.match(/question_id/gi)){      
        question_id.push(key.substr(12, 1));                            
        }

        

        formData.append('question_id', question_id[0]);
        formData.append('answer', value);
        selected_answer.push(value);
        selected_answer = [...new Set(selected_answer)];
        selected_question = this.state.selected_question;
        selected_question.push(question_id[0]);
        selected_question = [...new Set(selected_question)];


        this.setState({
            selected_question,
            selected_answer
        })

        formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
        this.props.loadingStart();
        axios
          .post(`/medical-question`, formData)
          .then(res => {
            this.setState({
                message: res.data.msg
            });
            this.props.loadingStop();
          })
          .catch(err => {
            this.setState({
                message: ""
            });
            this.props.loadingStop();
          });        
    }

    handleSubmit = (values) => {
        const {productId} = this.props.match.params
        const questionClass = document.getElementsByClassName('questionClass');
        let count = 0
        for(let i=0;i<questionClass.length;i++){
            if(questionClass[i].checked){              
                count++;
            }            
        }
        let q = questionClass.length/2
        if(count == q){
            if(this.state.isForwarded){
                this.props.history.push(`/SelectDuration/${productId}`);
            }            
        }
        else{
            swal('Please answer all of the questions');

           /* this.setState({
                validation_message:'Please answer all of the questions',
                show:true
            })*/
        }
       /* if(count===questionClass.length){
            alert(all )
        }*/
       //  this.props.history.push(`/SelectDuration/${productId}`);
    }

    getQuestionList = () => {
        this.props.loadingStart();
        axios
          .get(`/questions`)
          .then(res => {
            this.setState({
                questionList: res.data.data
            });
          })
          .catch(err => {
            this.setState({
                questionList: []
            });
            this.props.loadingStop();
          });
          this.props.loadingStop();
      }

    getPolicyHolderDetails = () => {
        this.props.loadingStart();
        axios
          .get(`/policy-holder/${localStorage.getItem('policyHolder_id')}`)
          .then(res => { 
            this.setState({
                flag: true,
                question_answer: res.data.data.policyHolder.request_data.question_answer
            }) 
          })
          .catch(err => {
            this.setState({
                question_answer: [], flag: true
            });
            this.props.loadingStop();
          });
          this.props.loadingStop();
      }

    componentDidMount() {
        this.getQuestionList();
        this.getPolicyHolderDetails();
      }


    showRestriction=(value)=>{
        if(value == 'y'){
            swal('Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 180 22 1111');
            this.setState({
                isForwarded : false
            })
        }
        else{
            this.setState({
                isForwarded : true
            })
        }
        
    }
    render() {
        const {productId } = this.props.match.params
        const {questionList, question_answer, flag,selected_question,selected_answer} = this.state

       let qlength = questionList ? questionList.length:0;
        console.log('Selected Questions==>',selected_question)
        console.log('Selected Answer==>',selected_answer)
        
        let initialValues = {}

        if(questionList && flag && questionList.length > 0) {
            questionList.map((question, qIndex) => {
            if(question_answer && question_answer.length > 0) {
                question_answer.map((answer, aIndex) => {
                initialValues[`question_id_${answer.question_id}`] = answer.response;
            })
            }
            else initialValues[`question_id_${question.id}`] = "";
            
        })
    }

    const checkValidation = (str)=>{    
        let error;
        if(str==''){
            error = 'Please selet an answer'
        }
        return error
    }

    


    
    const newInitialValues =  Object.assign(initialValues) ;

        return (
            <>
                <BaseComponent>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                            <SideNav />
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                        <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                            <section className="d-flex justify-content-center brand m-t-60">
                                <div className="brand-bg pd-30">
                                <div className="d-flex justify-content-left">
                            <div className="brandhead m-b-25">
                                <h4>Please help us with more details to arrive at the best suited plan </h4>
                            </div>
                           
                            </div>

                            {Object.keys(newInitialValues).length > 0 ?
                            <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit}
                           //  validationSchema={validateMedicalDetails}
                            >
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                            return (
                            <Form>
                            <Row>
                            <Col sm={12} md={9}>
                            <FieldArray
                            name="abc"
                            render={flagHelpers => { 
                            return (
                            questionList.map((question, qIndex) => ( 

                            <div className="d-flex justify-content-left">
                                <div className="m-r-25"><img src={require(`../../assets/images/${question.logo}`)} alt="" /></div>
                                    <div className="medinfo"><p className="W500">{question.title}</p>
                                        
                                    <FormGroup>
                                        <div className="d-inline-flex m-b-30">
                                            <div className="p-r-25">
                                                <label className="customRadio3">
                                                <Field
                                                    type="radio"
                                                    name={`question_id_${question.id}`}
                                                    className = 'questionClass'
                                                    value="y"
                                                    key={qIndex}  
                                                    onChange={(e) => {
                                                        setFieldValue(`question_id_${question.id}`, e.target.value);
                                                        this.handleChangeSubmit(`question_id_${question.id}`,e.target.value)
                                                        if(qIndex == qlength -1){
                                                            this.showRestriction('y');
                                                        } 
                                                    }}
                                                    checked={values[`question_id_${question.id}`] == 'y' ? true : false}
                                                />
                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>                      
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                <Field
                                                    type="radio"
                                                    name={`question_id_${question.id}`}
                                                    className = 'questionClass'
                                                    value="n"
                                                    key={qIndex}
                                                    onChange={(e) => {
                                                        setFieldValue(`question_id_${question.id}`, e.target.value);
                                                        this.handleChangeSubmit(`question_id_${question.id}`,e.target.value)
                                                        if(qIndex == qlength -1){
                                                            this.showRestriction('n');
                                                        } 
                                                    }}
                                                    checked={values[`question_id_${question.id}`] == 'n' ? true : false}
                                                   // validation = {checkValidation}
                                                />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>
                                                    {/*!this.state.selected_question.includes(question.id) ? (
                                                    <span className="errorMsg">Please select a question</span>
                                                    ) : null*/}
                                                </label>
                                            </div>
                                        </div>
                                        </FormGroup>

                                    </div>
                                </div>
                                )) 
                            )}}
                            />
                                
                                
                                <div className="d-flex justify-content-left resmb">
                                <Button className={`backBtn`} type="button"  onClick= {this.buy_policy.bind(this, productId )} >
                                    Back
                                </Button>
                                <Button className={`proceedBtn`} type="submit"  >
                                    Continue
                                </Button>
                                </div>
                            </Col>

                            <Col sm={12} md={3}>
                                <div className="regisBox medpd">
                                    <h3 className="medihead">No Medical Test upto the Age of 45 for People with No Medical History </h3>
                                </div>
                            </Col>
                        </Row>
                        </Form>
                            );
                        }}
                        </Formik> : null }
                        </div>
                        </section> 
                        <Footer />  
                        </div>
                        <Modal className="customModal1" bsSize="md" show={this.state.show}
                                onHide={this.handleClose}>
                             <div className="errorMsg">
                                {this.state.validation_message}
                            </div>
                            <div className="d-flex justify-content-left resmb" style={styleDataOuter}>
                            <button className="backBtn" onClick= {this.handleClose} style={styleData}>Close</button>
                            </div>
                            
                        </Modal>
                      </div>      
                      </div>
                </BaseComponent>
            </>
        );
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(MedicalDetails));