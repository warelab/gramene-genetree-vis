import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

import microsoftBrowser from '../utils/microsoftBrowser';

import {Overlay, Popover, Button} from "react-bootstrap";

import NodePopover from './NodePopover.jsx';

import Edge from './Edge.jsx';
import Node from './Node.jsx';

export default class Clade extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      popoverVisible: false
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  hover(e) {
    e.stopPropagation();
    this.props.onNodeHover(this.props.node);
    this.setState({hovered: true});
  }

  unhover(e) {
    e.stopPropagation();
    this.props.onNodeUnhover(this.props.node);
    this.setState({hovered: false});
  }

  togglePopoverVisibility() {
    this.setState({
      popoverVisible: !this.state.popoverVisible
    });
  }

  collapseClade(node,recurse) {
    this.setState({popoverVisible: false});
    this.props.collapseClade(node,recurse);
  }

  expandClade(node,recurse) {
    this.setState({popoverVisible: false});
    this.props.expandClade(node,recurse);
  }

  changeParalogVisibility(node) {
    this.setState({popoverVisible: false});
    this.props.changeParalogVisibility(node);
  }

  changeGeneOfInterest(node) {
    this.setState({popoverVisible: false});
    this.props.onGeneSelect(node);
  }

  transform(isStyle) {
    let px = isStyle ? 'px' : '';
    let x,y;
    if (this.state.mounted) {
      x = this.props.node.x - this.props.xOffset;
      y = this.props.node.y - this.props.yOffset;
    }
    else {
      x = this.props.xOffset;
      y = this.props.yOffset;
    }

    return 'translate(' + y + px + ', ' + x + px + ')';
  }

  renderSubClades() {
    let node = this.props.node;
    let treeProps = _.clone(this.props);
    let children = node.children;
    let cladeHovered = !!(this.props.cladeHovered || this.state.hovered);

    if (_.isArray(children) && node.displayInfo.expanded) {
      return children.map(function (childNode, idx) {
        treeProps.node = childNode;
        return <Clade {...treeProps}
                      key={idx}
                      cladeHovered={cladeHovered}
                      xOffset={node.x}
                      yOffset={node.y}/>
      });
    }
  }

  renderNode() {
    let node = this.props.node;

    return (
      <Node node={node}
            labelFields={this.props.labelFields}
            onHover={() => this.hover()}
            taxonomy={this.props.taxonomy}/>
    );
  }

  renderEdge() {
    let node = this.props.node;
    let parent = node.parent;
    let cladeHovered = !!(this.props.cladeHovered || this.state.hovered);

    if (parent) {
      return (
        <Edge source={node}
              target={parent}
              cladeHovered={cladeHovered}
              thisCladeHovered={!!this.state.hovered}/>
      );
    }
  }

  overlay(node,geneDocs) {
    const model = node.model;
    const titleText = model.node_type
      ? `${model.taxon_name} – ${model.node_type}`
      : model.gene_display_label
        ? `${model.taxon_name} – ${model.gene_display_label}`
        : `${model.taxon_name} - ${model.gene_stable_id}`;

    const id = `nodepopover${model.node_id}`;

    const title = <div>
      <Button className="tooltip-title-button"
              bsSize="xsmall"
              onClick={this.togglePopoverVisibility.bind(this)}>
        &times;
      </Button>
      <span>{titleText}</span>
    </div>;

    return (
      <Overlay show={this.state.popoverVisible}
               target={ props => ReactDOM.findDOMNode(this.refs.clickable)}>
        <Popover id={id} title={title}>
          <NodePopover node={node}
                       collapseClade={this.collapseClade.bind(this)}
                       expandClade={this.expandClade.bind(this)}
                       changeParalogVisibility={this.changeParalogVisibility.bind(this)}
                       changeGeneOfInterest={this.changeGeneOfInterest.bind(this)}
                       geneDocs={geneDocs}
          />
        </Popover>
      </Overlay>
    );
  }

  cladeProps() {
    const props = {
      className: 'clade'
    };

    if (microsoftBrowser) {
      props.transform = this.transform(false);
    }
    else {
      props.style = {transform: this.transform(true)};
    }

    return props;
  }

  render() {
    return (
      <g {...this.cladeProps()}>
        <g ref="clickable" onClick={this.togglePopoverVisibility.bind(this)}>
          {this.renderEdge()}
          {this.renderNode()}
        </g>
        {this.overlay(this.props.node,this.props.geneDocs)}

        {this.renderSubClades()}
      </g>
    );
  }
}

Clade.propTypes = {
  node: PropTypes.object.isRequired,
  labelFields: PropTypes.array.isRequired,
  cladeHovered: PropTypes.bool,
  xOffset: PropTypes.number.isRequired,
  yOffset: PropTypes.number.isRequired,
  geneDocs: PropTypes.object.isRequired
};
