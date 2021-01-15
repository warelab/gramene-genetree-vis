import React from "react";
import PropTypes from 'prop-types';
import _ from "lodash";
import {Button, Table} from "react-bootstrap";

const NodePopover = props => {
  return (
      <div>
        <div style={{marginBottom: "0.5rem"}}>
          {buttons(props)}
        </div>
        {table(props)}
      </div>
  );
};

function buttons(props) {
  return props.node.displayInfo.leafNode
      ? geneNodeButtons(props)
      : internalNodeButtons(props);
}

function internalNodeButtons({node, collapseClade, expandClade}) {
  const collapseCladeButton = node.displayInfo.expanded ? btn('Collapse', () => collapseClade(node,true), "warning") : undefined;
  // const collapseNodeButton = btn('Collapse node', () => collapseClade(node,false), "warning");
  const expandCladeButton = btn('Expand', () => expandClade(node,true), "success");
  // const expandNodeButton = node.displayInfo.expanded ? undefined : btn('Expand node', () => expandClade(node,false), "success");

  return (
    <div>
      {/*<ButtonGroup size='sm' style={{marginBottom: "0.2rem"}}>*/}
        {expandCladeButton} {collapseCladeButton}
      {/*</ButtonGroup>*/}
    </div>
  )
}

function geneNodeButtons({node, changeParalogVisibility, changeGeneOfInterest}) {
  var button;
  if (node.displayInfo.isGeneOfInterest && node.displayInfo.paralogs) {
    var root = node.parent;
    while (root.parent) {
      root = root.parent;
    }
    button = btn("Show paralogs", () => changeParalogVisibility(root), "success");
  }
  else {
    button = btn("Focus on this gene", () => changeGeneOfInterest(node), "success");
  }
  return button;
}

function btn(name, handler, style = "default") {
  return (
      <Button variant={style}
              onClick={handler}
              size={'sm'}>
        {name}
      </Button>
  );
}

function table({node,geneDocs}) {
  const model = node.model;
  const contents = node.displayInfo.leafNode ? geneProps(model,geneDocs) : internalProps(model);

  return (
      <Table hover style={{fontSize: 12}}>
        {contents}
      </Table>
  );
}

function geneProps(model,geneDocs) {
  const gene = geneDocs[model.gene_stable_id];
  return (
      <tbody>
      {prop('ID', model.gene_stable_id)}
      {prop('Description', model.gene_description)}
      {prop('nTranscripts', model.nTranscripts)}
      {prop('Distance to parent', model.distance_to_parent.toPrecision(3))}
      {prop('Location', `${gene.region}:${gene.start}-${gene.end}:${gene.strand === 1 ? '+':'-'}`)}
      </tbody>
  )
}

function internalProps(model) {
  return (
      <tbody>
      {prop('Bootstrap', model.bootstrap)}
      {model.duplication_confidence_score && prop('Duplication confidence', 100*model.duplication_confidence_score.toPrecision(3) + '%')}
      {prop('Distance to parent', model.distance_to_parent.toPrecision(3))}
      </tbody>
  )
}

function prop(name, value) {
  if (!_.isUndefined(value)) {
    return (
        <tr>
          <td>{name}</td>
          <td>{value}</td>
        </tr>
    )
  }
}

NodePopover.propTypes = {
  node: PropTypes.object.isRequired,
  geneDocs: PropTypes.object.isRequired,
  collapseClade: PropTypes.func.isRequired,
  expandClade: PropTypes.func.isRequired,
  changeParalogVisibility: PropTypes.func.isRequired
};

export default NodePopover;