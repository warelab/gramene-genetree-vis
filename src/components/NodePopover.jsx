import React from "react";
import _ from "lodash";
import {ButtonGroup, Button, Table} from "react-bootstrap";

const NodePopover = props => {
  return (
      <div>
        {buttons(props)}
        {table(props)}
      </div>
  );
};

function buttons(props) {
  return props.node.displayInfo.leafNode
      ? geneNodeButtons(props)
      : internalNodeButtons(props);
}

function internalNodeButtons({node, changeCladeVisibility}) {
  const cladeButton = node.displayInfo.expanded
      ? btn("Collapse", () => changeCladeVisibility(node), "warning")
      : btn("Expand", () => changeCladeVisibility(node), "success");

  return (
      <ButtonGroup style={{marginBottom: 3}}>
        {cladeButton}
      </ButtonGroup>
  )
}

function geneNodeButtons({node, showParalogs}) {
  // return (
  //     <ButtonGroup style={{marginBottom: 3}}>
  //       {btn("Show Paralogs", () => showParalogs(node))}
  //     </ButtonGroup>
  // )
}

function btn(name, handler, style = "default") {
  return (
      <Button bsSize="xsmall"
              bsStyle={style}
              onClick={handler}>
        {name}
      </Button>
  );
}

function table({node}) {
  const model = node.model;
  const contents = node.displayInfo.leafNode ? geneProps(model) : internalProps(model);

  return (
      <Table condensed hover style={{fontSize: 12}}>
        {contents}
      </Table>
  );
}

function geneProps(model) {
  return (
      <tbody>
      {prop('ID', model.gene_stable_id)}
      {prop('Description', model.gene_description)}
      {prop('Distance to parent', model.distance_to_parent.toPrecision(3))}
      </tbody>
  )
}

function internalProps(model) {
  return (
      <tbody>
      {prop('Bootstrap', model.bootstrap)}
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
  node: React.PropTypes.object.isRequired,
  changeCladeVisibility: React.PropTypes.func.isRequired
};

export default NodePopover;