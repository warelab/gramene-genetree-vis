import React from 'react';
import Recaptcha from 'react-recaptcha';
import { FormGroup, FormControl, Form, ControlLabel, Col, Button } from 'react-bootstrap';
import isEmail from 'is-email';
import _ from 'lodash';
import axios from 'axios';

export default class Feedback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      genes: props.genes,
      genetree: props.genetree
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.genes,this.state.genes)) {
      let genes = nextProps.genes;
      this.setState({genes});
    }
  }

  handleChange(e) {
    let nextState = _.cloneDeep(this.state);
    nextState[e.target.id] = e.target.value;
    this.setState(nextState);
  }

  validateField(fieldName) {
    if (fieldName === 'name') {
      const length = this.state.name.length;
      if (length > 4) return 'success';
      else if (length > 2) return 'warning';
      else if (length > 0) return 'error';
    }
    if (fieldName === 'email') {
      const length = this.state.email.length;
      if (isEmail(this.state.email))
        return 'success';
      else if (length > 0)
        return 'error';
    }
  }

  submitForm() {
    let that = this;
    axios.post('/feedback',this.state)
      .then(function (response) {
        that.setState({submittedForm: true, ticket: response.data.ticket});
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  verifyRecaptcha(response) {
    this.setState({recaptcha: response});
  }

  loadRecaptcha() {
    console.log('loaded recaptcha');
  }

  formIsValid() {
    return (this.validateField('name') === 'success'
      && this.validateField('email') === 'success'
      && this.state.recaptcha
    )
  }

  renderForm() {
    return (
      <div style={{width:"500px"}}>
        <Form horizontal>
          <FormGroup controlId="name" validationState={this.validateField('name')}>
            <Col componentClass={ControlLabel} sm={3}>
              Your Name
            </Col>
            <Col sm={9}>
              <FormControl
                type="text"
                value={this.state.name}
                onChange={this.handleChange.bind(this)}
              />
              <FormControl.Feedback />
            </Col>
          </FormGroup>

          <FormGroup controlId="email" validationState={this.validateField('email')}>
            <Col componentClass={ControlLabel} sm={3}>
              Your Email
            </Col>
            <Col sm={9}>
              <FormControl
                type="text"
                value={this.state.email}
                onChange={this.handleChange.bind(this)}
              />
              <FormControl.Feedback />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col smOffset={3} sm={9}>
              <Recaptcha
                sitekey="6LcDFdMSAAAAABJNbBf5O18x3LA4h1cb0dlclHY8"
                render="explicit"
                verifyCallback={this.verifyRecaptcha.bind(this)}
                onloadCallback={this.loadRecaptcha}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col smOffset={3} sm={9}>
              <Button disabled={!this.formIsValid()} onClick={this.submitForm.bind(this)}>
                Send your feedback
              </Button>
            </Col>
          </FormGroup>
        </Form>
      </div>
    );
  }

  renderThanks() {
    return (
      <div>Thank You</div>
    );
  }

  render() {
    if (this.state.submittedForm) {
      return this.renderThanks();
    }
    else {
      return this.renderForm();
    }
  }
}
