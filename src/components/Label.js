import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from './ItemTypes';
import flow from 'lodash.flow';
import { Form } from 'react-bootstrap';

const style = {
  // border: '1px dashed gray',
  padding: '0.25rem 0.5rem',
  backgroundColor: 'white',
  cursor: 'move',
  display: 'inline-block',
  zoom: 1,
  verticalAlign: 'top',
  width: '20%'
};

const labelSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

const labelTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveLabel(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

class Label extends Component {
  render() {
    const { text, isDragging, connectDragSource, connectDropTarget, checked } = this.props;
    const opacity = isDragging ? 0 : 1;
    return connectDragSource(connectDropTarget(
      <div style={{ ...style, opacity }}>
        <div style={{border:'1px dashed gray',padding:'1rem'}}>
          <input name={text} onChange={()=>this.props.toggleLabel(this.props.index)} checked={checked} type='checkbox'/>
          <label style={{marginBottom:0, paddingLeft:"0.2rem"}} htmlFor={text}>{text}</label>
        </div>
      </div>,
    ));
  }
}

Label.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  id: PropTypes.any.isRequired,
  text: PropTypes.string.isRequired,
  moveLabel: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
  toggleLabel: PropTypes.func.isRequired
};


export default flow(
  DropTarget(ItemTypes.LABEL, labelTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
  })),
  DragSource(ItemTypes.LABEL, labelSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }))
)(Label)