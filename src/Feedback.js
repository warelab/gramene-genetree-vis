import React from 'react';
import { FormGroup, FormControl, Form, Col, Button } from 'react-bootstrap';
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
      genetree: props.genetree,
      set: props.set
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
    axios.post('/curate',this.state)
      .then(function (response) {
        that.setState({submittedForm: true, ticket: response.data.ticket});
      })
      .catch(function (error) {
        console.log(error);
      });
  }


  formIsValid() {
    let notCuratedYet = this.state.genes.filter(gene => gene.opinion === 'curate');
    let flaggedForNoGoodReason = this.state.genes.filter(gene => (gene.opinion === 'flag' && gene.reason === 'none'));
    const labRegex = /^pb\d+@cornell.edu$/;
    return (
      (
        this.validateField('email') === 'success' &&
        labRegex.test(this.state.email)
      ) || (
        this.validateField('email') === 'success' &&
        notCuratedYet.length === 0 &&
        flaggedForNoGoodReason.length === 0
      )
    )
  }

  renderForm() {
    let tally = {
      curate: 0,
      okay: 0,
      flag: 0,
      noReason: 0
    };
    this.props.genes.forEach(function(gene) {
      tally[gene.opinion]++;
      if (gene.opinion === 'flag' && (!gene.reason || gene.reason === 'none')) {
        tally.noReason++;
      }
    });
    return (
      <div style={{width:"500px"}}>
        <Form horizontal>
          <FormGroup controlId="progress">
            <Col sm={3}>
              Progress
            </Col>
            <Col sm={9}>
              <span className="curation curate">curate</span>&nbsp;{tally.curate}&nbsp;
              <span className="curation okay">okay</span>&nbsp;{tally.okay}&nbsp;
              <span className="curation flag">flag</span>&nbsp;{tally.flag}&nbsp;
              <span className="curation noReason">missing reason</span>&nbsp;{tally.noReason}&nbsp;
            </Col>
          </FormGroup>
          <FormGroup controlId="email" validationState={this.validateField('email')}>
            <Col sm={3}>
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
