'use strict';
var React = require('react');
var numeral = require('numeral');
import {OverlayTrigger, Popover} from "react-bootstrap";

var colors = require('d3').scale.category10().range();

var positionDomains = require('../utils/positionDomains');
var domainStats = require('../utils/domainsStats').domainStats;

var Domains = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    stats: React.PropTypes.object.isRequired,
    highlight: React.PropTypes.string.isRequired,
    alignment: React.PropTypes.object.isRequred
  },

  getInitialState: function () {
    return {
      domains: positionDomains(this.props.node)
    };
  },

  componentWillMount: function () {
    if (this.props.node.hasChildren()) {
      this.cladeStats = domainStats(this.props.node);
    }
  },

  render: function () {
    var sf = this.props.width / this.props.alignment.size;
    var transform = 'scale(' + sf + ' 1)';
    return (
      <g className="domains" transform={transform}>
        {this.renderHighlight()}
        {this.renderDomains()}
      </g>
    );
  },

  renderHighlight: function () {
    if (this.props.highlight) {
      var hlStyle = {fill: this.props.highlight, stroke: false};
      return (
        <rect key='highlight'
              width={this.state.domains.size}
              height="18"
              style={hlStyle}/>
      );
    }
  },

  renderDomains: function () {
    return this.state.domains.map(function (domain, idx) {
      var w = domain.end - domain.start + 1;
      var stats = this.props.stats[domain.id];

      var color = stats.color;
      var opacity = 0.2;
      var style = {fill: color, stroke: false, fillOpacity: opacity};

      return (
        <OverlayTrigger key={idx}
                        trigger={['click', 'focus']} rootClose
                        placement="bottom"
                        overlay={this.renderPopover(domain)}>
          <rect
            width={w}
            height="18"
            x={domain.start}
            style={style}/>
        </OverlayTrigger>
      )
    }.bind(this));
  },

  renderPopover: function (domain) {
    var title = `${domain.id} - ${domain.name}`;
    return <Popover id={domain.name} title={title}>{this.renderPopoverContent(domain)}</Popover>;
  },

  renderPopoverContent(domain) {
    if (this.props.node.hasChildren()) {
      return this.renderInternalNodePopoverContent(domain);
    }
    else {
      return this.renderGeneNodePopoverContent(domain);
    }
  },
  
  renderInternalNodePopoverContent(domain) {
    var stats = this.props.stats[domain.id];
    var cladeStats = this.cladeStats[domain.id];

    var treeStatement = createStatement(stats, 'genetree');
    var cladeStatement = createStatement(cladeStats, 'clade');

    return (
      <div>
        <p className="description">{domain.description}</p>
        <p className="stats">{treeStatement}</p>
        <p className="stats">{cladeStatement}</p>
      </div>
    );
  },
  
  renderGeneNodePopoverContent(domain) {
    var stats = this.props.stats[domain.id];
    var statement = createStatement(stats, 'genetree');

    return (
      <div>
        <p className="description">{domain.description}</p>
        <p className="stats">{statement}</p>
      </div>
    );
  }
});

function createStatement(stats, whatIsThis) {
  var geneCount = stats.genesWithDomain;
  var totalGenes = stats.totalGenes;
  var proportion = numeral(geneCount / totalGenes).format('0.0%');
  var statement;

  if (geneCount === totalGenes) {
    statement = `Shared by all ${totalGenes} genes in this ${whatIsThis}.`;
  }
  else if (geneCount === 1) {
    statement = `This is the only gene in the ${whatIsThis} with this domain.`;
  }
  else {
    statement = `Shared by ${geneCount} of ${totalGenes} (${proportion}) genes in this ${whatIsThis}.`;
  }

  return statement;
}

module.exports = Domains;