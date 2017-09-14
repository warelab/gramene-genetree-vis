import React, { Component } from 'react';
import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Label from './Label';
import _ from 'lodash';
import flow from 'lodash.flow';

const style = {
  width: 400,
};

class LabelConfig extends Component {
  constructor(props) {
    super(props);
    this.moveLabel = this.moveLabel.bind(this);
    this.state = {
      labels: [{
        id: 1,
        text: 'Species',
        field: 'model.taxon_name',
        checked: _.includes(props.labelFields,'model.taxon_name')
      }, {
        id: 2,
        text: 'Gene name',
        field: 'model.gene_display_label',
        checked: _.includes(props.labelFields,'model.gene_display_label')
      }, {
        id: 3,
        text: 'Gene ID',
        field: 'model.gene_stable_id',
        checked: _.includes(props.labelFields,'model.gene_stable_id')
      }, {
        id: 4,
        text: 'Protein ID',
        field: 'model.protein_stable_id',
        checked: _.includes(props.labelFields,'model.protein_stable_id')
      }],
    };
  }

  // componentDidUpdate(prevProps,prevState) {
  //   let x = this.state.labels.filter((l)=> l.checked).map((l)=>l.field);
  //   if (!_.isEqual(x, this.props.labelFields)) {
  //     this.props.updateLabelFields(x);
  //   }
  // }

  moveLabel(dragIndex, hoverIndex) {
    const { labels } = this.state;
    const dragLabel = labels[dragIndex];

    this.setState(update(this.state, {
      labels: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragLabel],
        ],
      },
    }));
  }

  toggleLabel(index) {
    const { labels } = this.state;
    let label = labels[index];
    label.checked = !label.checked;
    this.setState(labels)
  }

  render() {
    const { labels } = this.state;

    return (
      <div style={style}>
        {labels.map((label, i) => (
          <Label
            key={label.id}
            index={i}
            id={label.id}
            checked={label.checked}
            text={label.text}
            moveLabel={this.moveLabel}
            toggleLabel={this.toggleLabel.bind(this)}
          />
        ))}
      </div>
    );
  }
};

export default flow(
  DragDropContext(HTML5Backend)
)(LabelConfig)