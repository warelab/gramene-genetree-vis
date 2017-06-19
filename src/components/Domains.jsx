import React, { Component } from 'react';
import numeral from 'numeral';
import {OverlayTrigger, Popover} from "react-bootstrap";
import {resolveOverlaps} from '../utils/calculateAlignment';

import domainStats from '../utils/domainsStats';

class Domains extends Component {
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    stats: React.PropTypes.object.isRequired,
    domains: React.PropTypes.object.isRequired,
    alignment: React.PropTypes.object.isRequired
  }

  componentWillMount() {
    if (this.props.node.hasChildren()) {
      this.cladeStats = domainStats(this.props.node);
    }
  }

  componentWillUpdate() {
    if (this.props.node.hasChildren()) {
      this.cladeStats = domainStats(this.props.node);
    }
  }

  render() {
    return (
      <g className="domains">
        {this.renderDomains()}
      </g>
    );
  }


  renderDomains() {
    let nonOverlappingDomains = resolveOverlaps(this.props.domains);
    return nonOverlappingDomains.map(function (domain, idx) {
      var w = domain.end - domain.start + 1;
      var stats = this.props.stats[domain.id];

      var color = stats.color;
      var opacity = 0.1;
      var style = {fill: color, stroke: color, fillOpacity: opacity};

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
  }

  renderPopover(domain) {
    var title = `${domain.id} - ${domain.name}`;
    return <Popover id={domain.name} title={title}>{this.renderPopoverContent(domain)}</Popover>;
  }

  renderPopoverContent(domain) {
    if (this.props.node.isRoot()) {
      return this.renderRootNodePopoverContent(domain);
    }
    if (this.props.node.hasChildren()) {
      return this.renderInternalNodePopoverContent(domain);
    }
    else {
      return this.renderGeneNodePopoverContent(domain);
    }
  }

  renderRootNodePopoverContent(domain) {
    var stats = this.props.stats[domain.id];

    var treeStatement = createStatement(stats, 'genetree');

    return (
      <div>
        <p className="description">{domain.description}</p>
        <p className="stats">{treeStatement}</p>
      </div>
    );
  }

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
  }

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
};

function createStatement(stats, whatIsThis) {
  var geneCount = stats.genesWithDomain;
  var totalGenes = stats.totalGenes;
  var proportion = numeral(geneCount / totalGenes).format('0.0%');
  var statement;

  if (geneCount === totalGenes) {
    statement = `Shared by all ${totalGenes} genes in this ${whatIsThis}.`;
  }
  else if (geneCount === 1) {
    statement = `There is only one gene in the ${whatIsThis} with this domain.`;
  }
  else {
    statement = `Shared by ${geneCount} of ${totalGenes} (${proportion}) genes in this ${whatIsThis}.`;
  }

  return statement;
}

export default Domains;
