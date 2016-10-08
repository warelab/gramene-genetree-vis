'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');

var microsoftBrowser = require('../utils/microsoftBrowser');

// import PureRenderMixin from "react-addons-pure-render-mixin";
import {Overlay, Popover, Button} from "react-bootstrap";

import NodePopover from './NodePopover.jsx';

var Edge = require('./Edge.jsx');
var Node = require('./Node.jsx');

var GeneTree = React.createClass({
  propTypes: {
    nodes: React.PropTypes.array.isRequired,
    onGeneSelect: React.PropTypes.func.isRequired,
    onInternalNodeSelect: React.PropTypes.func.isRequired,
    onNodeHover: React.PropTypes.func.isRequired,
    taxonomy: React.PropTypes.object
  },

  componentWillMount: function () {
    var Clade, geneTreeProps, geneTreeCtx;
    geneTreeCtx = this;
    geneTreeProps = geneTreeCtx.props;

    //noinspection JSUnusedAssignment
    Clade = this.Clade = React.createClass({
      propTypes: {
        node: React.PropTypes.object.isRequired,
        cladeHovered: React.PropTypes.bool,
        xOffset: React.PropTypes.number.isRequired,
        yOffset: React.PropTypes.number.isRequired
      },

      // shouldComponentUpdate: PureRenderMixin.shouldComponentUpdate.bind(this),

      getInitialState: function () {
        return {
          popoverVisible: false
        };
      },

      componentWillMount: function () {
        //noinspection JSPotentiallyInvalidUsageOfThis
        this.onSelect = geneTreeCtx.nodeSelectHandler(this.props.node);
      },

      componentDidMount: function () {
        this.setState({mounted: true});
      },

      handleClick: function (e) {
        e.stopPropagation();
        //noinspection JSPotentiallyInvalidUsageOfThis
        // this.onSelect(this.props.node);

        // it's confusing if a newly expanded clade is hovered.
        // and besides, I haven't worked out how to get the
        // internal node to be the correct size.
        //noinspection JSPotentiallyInvalidUsageOfThis
        if (this.props.node.displayInfo.expanded) {
          this.setState({hovered: false});
        }
      },

      hover: function (e) {
        e.stopPropagation();
        //noinspection JSPotentiallyInvalidUsageOfThis
        geneTreeProps.onNodeHover(this.props.node);
        this.setState({hovered: true});
      },

      unhover: function (e) {
        e.stopPropagation();
        //noinspection JSPotentiallyInvalidUsageOfThis
        geneTreeProps.onNodeUnhover(this.props.node);
        this.setState({hovered: false});
      },

      togglePopoverVisibility: function () {
        this.setState({
          popoverVisible: !this.state.popoverVisible
        });
      },

      changeCladeVisibility: function (node) {
        this.setState({popoverVisible: false});
        geneTreeProps.onInternalNodeSelect(node, true);
      },

      changeParalogVisibility: function (node) {
        this.setState({popoverVisible: false});
        geneTreeProps.onInternalNodeSelect2(node);
      },

      changeGeneOfInterest: function (node) {
        this.setState({popoverVisible: false});
        geneTreeProps.onGeneSelect(node);
      },

      transform: function (isStyle) {
        var x, y, px;

        px = isStyle ? 'px' : '';

        if (this.state.mounted) {
          //noinspection JSPotentiallyInvalidUsageOfThis
          x = this.props.node.x - this.props.xOffset;
          //noinspection JSPotentiallyInvalidUsageOfThis
          y = this.props.node.y - this.props.yOffset;
        }
        else {
          //noinspection JSPotentiallyInvalidUsageOfThis
          x = this.props.xOffset;
          //noinspection JSPotentiallyInvalidUsageOfThis
          y = this.props.yOffset;
        }

        return 'translate(' + y + px + ', ' + x + px + ')';
      },

      renderSubClades: function () {
        var node, children, cladeHovered;

        //noinspection JSPotentiallyInvalidUsageOfThis
        node = this.props.node;
        children = node.children;
        //noinspection JSPotentiallyInvalidUsageOfThis
        cladeHovered = !!(this.props.cladeHovered || this.state.hovered);

        if (_.isArray(children) && node.displayInfo.expanded) {
          return children.map(function (childNode, idx) {
            return <Clade key={idx}
                          node={childNode}
                          cladeHovered={cladeHovered}
                          xOffset={node.x}
                          yOffset={node.y}/>
          });
        }
      },

      renderNode: function () {
        var node;

        //noinspection JSPotentiallyInvalidUsageOfThis
        node = this.props.node;

        return (
          <Node node={node}
                onSelect={this.onSelect}
                taxonomy={geneTreeProps.taxonomy}/>
        );
      },

      renderEdge: function () {
        var node, parent, cladeHovered;

        //noinspection JSPotentiallyInvalidUsageOfThis
        node = this.props.node;
        parent = node.parent;
        //noinspection JSPotentiallyInvalidUsageOfThis
        cladeHovered = !!(this.props.cladeHovered || this.state.hovered);

        if (parent) {
          //noinspection JSPotentiallyInvalidUsageOfThis
          return (
            <Edge source={node}
                  target={parent}
                  cladeHovered={cladeHovered}
                  thisCladeHovered={!!this.state.hovered}/>
          );
        }
      },

      overlay: function (node) {
        const model = node.model;
        const titleText = model.gene_display_label
          ? `${model.taxon_name} – ${model.gene_display_label}`
          : `${model.taxon_name} – ${model.node_type}`;
        const id = `nodepopover${model.node_id}`;

        const title = <div>
          <Button className="tooltip-title-button"
                  bsSize="xsmall"
                  onClick={this.togglePopoverVisibility}>
            &times;
          </Button>
          <span>{titleText}</span>
        </div>;

        return (
          <Overlay show={this.state.popoverVisible}
                   container={geneTreeProps.overlaysContainer}
                   target={() => ReactDOM.findDOMNode(this.refs.clickable)}>
            <Popover id={id} title={title}>
              <NodePopover node={node}
                           changeCladeVisibility={this.changeCladeVisibility}
                           changeParalogVisibility={this.changeParalogVisibility}
                           changeGeneOfInterest={this.changeGeneOfInterest}
              />
            </Popover>
          </Overlay>
        );
      },

      cladeProps: function () {
        const props = {
          className: 'clade',
          // onMouseOver: this.hover,
          // onMouseOut: this.unhover,
          onClick: this.handleClick
        };

        if (microsoftBrowser) {
          props.transform = this.transform(false);
        }
        else {
          props.style = {transform: this.transform(true)};
        }

        return props;
      },

      render: function () {
        return (
          <g {...this.cladeProps()}>
            <g ref="clickable" onClick={this.togglePopoverVisibility}>
              {this.renderEdge()}
              {this.renderNode()}
            </g>
            {this.overlay(this.props.node)}

            {this.renderSubClades()}
          </g>
        );
        // return (
        //     <g {...this.cladeProps()}>
        //       <OverlayTrigger
        //           rootClose
        //           placement="bottom"
        //           trigger="click"
        //           overlay={this.overlay(this.props.node)}>
        //         <g>
        //         {this.renderEdge()}
        //         {this.renderNode()}
        //         </g>
        //       </OverlayTrigger>
        //       {this.renderSubClades()}
        //     </g>
        // );
      }
    });
  },

  nodeSelectHandler: function (node) {
    if (node.model.gene_stable_id) {
      return this.props.onGeneSelect;
    }
    else {
      return this.props.onInternalNodeSelect;
    }
  },

  handleHover: function (node) {
    this.props.onNodeHover(node);
  },

  render: function () {
    var Clade = this.Clade;

    return (
      <g className="genetree">
        <Clade node={this.props.nodes[0]} xOffset={0} yOffset={0}/>
      </g>
    )
  }
});

module.exports = GeneTree;