import React from 'react';
import { FormControl, Form, Container, Row, Col, Button } from 'react-bootstrap';
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

  UNSAFE_componentWillReceiveProps(nextProps) {
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
    let formData = _.cloneDeep(this.state);
    formData.genes = formData.genes.filter(gene => gene.opinion !== 'curate');
    axios.post('/curate', formData)
      .then(function (response) {
        that.setState({submittedForm: true, ticket: response.data.ticket});
      })
      .catch(function (error) {
        console.log(error);
      });
  }


  formIsValid() {
    let notCuratedYet = this.state.genes.filter(gene => gene.opinion === 'curate');
    let curated = this.state.genes.filter(gene => gene.opinion !== 'curate');
    // let missingReasons = this.state.genes.filter(gene => gene.opinion === 'unclear' && (!gene.reason || gene.reason === 'none'));
    let missingReasons = this.state.genes.filter(gene => gene.opinion === 'flag' && (!gene.reason || gene.reason === 'none'));
    // if we require all genes are curated
    // return this.validateField('email') === 'success' && notCuratedYet.length === 0 && missingReasons.length === 0
    // at least one gene was curated
    return this.validateField('email') === 'success' && curated.length > 0// && missingReasons.length === 0
  }

  renderForm() {
    let tally = {
      curate: 0,
      okay: 0,
      flag: 0,
      poor: 0,
      unclear: 0,
      noReason: 0,
      noGroup: 0
    };
    this.props.genes.forEach(function(gene) {
      tally[gene.opinion]++;
      if (gene.opinion === 'flag' && (!gene.reason || gene.reason === 'none')) {
        tally.noReason++;
      }
      if (gene.opinion === 'unclear' && (!gene.reason || gene.reason === 'none')) {
        tally.noGroup++;
      }
    });
    return (
        <Container>
          <Form inline={true} noValidate>
              <Form.Group controlId="progress">
                <Col sm={4}>
                  Progress
                </Col>
                <Col sm={10}>
                  <span className="curation curate">curate</span>&nbsp;{tally.curate}&nbsp;
                  <span className="curation okay">okay</span>&nbsp;{tally.okay}&nbsp;
                  <span className="curation unclear">flag</span>&nbsp;{tally.flag}&nbsp;
                  {/*<span className="curation unclear">unclear</span>&nbsp;{tally.unclear}&nbsp;*/}
                  {/*<span className="curation noGroup">missing group</span>&nbsp;{tally.noGroup}&nbsp;*/}
                  <span className="curation noReason">missing reason</span>&nbsp;{tally.noReason}&nbsp;
                </Col>
              </Form.Group>
              <Form.Group controlId="email">
                <Col sm={3}>
                  Email
                </Col>
                <Col sm={9}>
                  <FormControl
                      type="text"
                      value={this.state.email}
                      onChange={this.handleChange.bind(this)}
                      isValid={this.validateField('email')}
                  />
                  <FormControl.Feedback />
                </Col>
              </Form.Group>
              <Form.Group>
                <Col smoffset={3} sm={9}>
                  <Button disabled={!this.formIsValid()} onClick={this.submitForm.bind(this)}>
                    Submit
                  </Button>
                </Col>
              </Form.Group>
          </Form>
        </Container>
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
