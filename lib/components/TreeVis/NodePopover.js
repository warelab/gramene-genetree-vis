"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _reactBootstrap = require("react-bootstrap");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NodePopover = function NodePopover(props) {
  return _react2.default.createElement(
    "div",
    null,
    buttons(props),
    table(props)
  );
};

function buttons(props) {
  return props.node.displayInfo.leafNode ? geneNodeButtons(props) : internalNodeButtons(props);
}

function internalNodeButtons(_ref) {
  var node = _ref.node,
      collapseClade = _ref.collapseClade,
      expandClade = _ref.expandClade;

  var collapseCladeButton = btn('Collapse clade', function () {
    return collapseClade(node, true);
  }, "warning");
  var collapseNodeButton = btn('Collapse node', function () {
    return collapseClade(node, false);
  }, "warning");
  var expandCladeButton = btn('Expand clade', function () {
    return expandClade(node, true);
  }, "success");
  var expandNodeButton = btn('Expand node', function () {
    return expandClade(node, false);
  }, "success");

  return _react2.default.createElement(
    _reactBootstrap.ButtonGroup,
    { style: { marginBottom: 3 } },
    expandNodeButton,
    " ",
    expandCladeButton,
    collapseNodeButton,
    " ",
    collapseCladeButton
  );
}

function geneNodeButtons(_ref2) {
  var node = _ref2.node,
      changeParalogVisibility = _ref2.changeParalogVisibility,
      changeGeneOfInterest = _ref2.changeGeneOfInterest;

  var button;
  if (node.displayInfo.isGeneOfInterest) {
    var root = node.parent;
    while (root.parent) {
      root = root.parent;
    }
    button = btn("Show paralogs", function () {
      return changeParalogVisibility(root);
    }, "success");
  } else {
    button = btn("Focus on this gene", function () {
      return changeGeneOfInterest(node);
    }, "success");
  }
  return _react2.default.createElement(
    _reactBootstrap.ButtonGroup,
    { style: { marginBottom: 3 } },
    button
  );
}

function btn(name, handler) {
  var style = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "default";

  return _react2.default.createElement(
    _reactBootstrap.Button,
    { bsSize: "xsmall",
      bsStyle: style,
      onClick: handler },
    name
  );
}

function table(_ref3) {
  var node = _ref3.node;

  var model = node.model;
  var contents = node.displayInfo.leafNode ? geneProps(model) : internalProps(model);

  return _react2.default.createElement(
    _reactBootstrap.Table,
    { condensed: true, hover: true, style: { fontSize: 12 } },
    contents
  );
}

function geneProps(model) {
  return _react2.default.createElement(
    "tbody",
    null,
    prop('ID', model.gene_stable_id),
    prop('Description', model.gene_description),
    prop('Distance to parent', model.distance_to_parent.toPrecision(3))
  );
}

function internalProps(model) {
  return _react2.default.createElement(
    "tbody",
    null,
    prop('Bootstrap', model.bootstrap),
    prop('Distance to parent', model.distance_to_parent.toPrecision(3))
  );
}

function prop(name, value) {
  if (!_lodash2.default.isUndefined(value)) {
    return _react2.default.createElement(
      "tr",
      null,
      _react2.default.createElement(
        "td",
        null,
        name
      ),
      _react2.default.createElement(
        "td",
        null,
        value
      )
    );
  }
}

NodePopover.propTypes = {
  node: _propTypes2.default.object.isRequired,
  collapseClade: _propTypes2.default.func.isRequired,
  expandClade: _propTypes2.default.func.isRequired,
  changeParalogVisibility: _propTypes2.default.func.isRequired
};

exports.default = NodePopover;