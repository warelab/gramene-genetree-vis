import React from 'react';
import _ from 'lodash';
const shifty = {
  curate : 'okay',
  okay : 'flag',
  // unclear: 'curate',
  flag : 'curate'
  // poor : 'unclear'
};
let reasons = [
  {
    name : "none",
    label: "choose a reason"
  }
];
let groups = [
  {
    name: "none",
    label: "choose a group"
  },
  {
    name: 'A',
    label: 'A'
  },
  {
    name: 'B',
    label: 'B'
  }
];
const combos = [
  'G__',
  'L__',
  '_G_',
  '_L_',
  '__G',
  '__L',
  'GG_',
  'GL_',
  'G_G',
  'G_L',
  'GGG',
  'GGL',
  'GLG',
  'GLL',
  'LG_',
  'LL_',
  'L_G',
  'L_L',
  'LGG',
  'LGL',
  'LLG',
  'LLL',
  '_GG',
  '_GL',
  '_LG',
  '_LL'
];
combos.forEach(c => {
  reasons.push({
    name: c,
    label: c.split('').join(',')
  })
});
reasons.push({
  name: 'split',
  label: 'split gene'
});
reasons.push({
  name: 'fusion',
  label: 'fused gene'
});
reasons.push({
  name: 'other',
  label: 'other'
});

export default class Curation extends React.Component {
  constructor(props) {
    super(props);
    let opinion=[];
    let reason=[];
    let group=[];
    props.nodes.forEach((node) => {
      if (node.model.gene_stable_id && props.curatable[node.model.taxon_id]) {
        opinion[node.model.gene_stable_id] = "curate";
        reason[node.model.gene_stable_id] = "none";
        group[node.model.gene_stable_id] = "none";
      }
    });
    this.state = {opinion,reason,group}
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps,this.state.props)) {
      let opinion = this.state.opinion;
      let doUpdate = false;
      nextProps.nodes.forEach((node) => {
        const id = node.model.gene_stable_id;
        if (id && !this.state.opinion[id] && nextProps.curatable[node.model.taxon_id]) {
          opinion[id] = "curate";
          // doUpdate = true;
        }
      });
      if (doUpdate) this.setState({opinion});
    }
  }

  flipFlop(node) {
    const id = node.model.gene_stable_id;
    let opinion = this.state.opinion;
    let reason = this.state.reason;
    let group = this.state.group;
    opinion[id] = shifty[opinion[id]];
    this.setState({opinion});
    this.props.getCuration(opinion,reason,group);
  }

  changeReason(e,node) {
    const id = node.model.gene_stable_id;
    let opinion = this.state.opinion;
    let reason = this.state.reason;
    let group = this.state.group;
    reason[id] = e.target.value;
    this.setState({reason});
    this.props.getCuration(opinion,reason,group);
  }

  changeGroup(e,node) {
    const id = node.model.gene_stable_id;
    let opinion = this.state.opinion;
    let reason = this.state.reason;
    let group = this.state.group;
    group[id] = e.target.value;
    this.setState({group});
    this.props.getCuration(opinion,reason,group);
  }

  render() {

    return (
      <g className="curation-wrapper"
         transform={`translate(${this.props.xOffset},${this.props.yOffset})`}>
        { this.props.nodes.map((node,idx) => {
          if (node.model.gene_stable_id && this.props.curatable[node.model.taxon_id]) {
            const opinion = this.state.opinion[node.model.gene_stable_id];
            const reason = this.state.reason[node.model.gene_stable_id] || 'none';
            const group = this.state.group[node.model.gene_stable_id] || 'none';
            let reasonSelect;
            if (opinion === 'flag') {
              reasonSelect = (<span className='curation-reason'>
                <select value={reason} name={node.model.gene_stable_id} onChange={(e) => this.changeReason(e,node)}>
                  {reasons.map((r,idx) => (
                    <option key={idx} value={r.name}>{r.label}</option>
                  ))}
                </select>
              </span>)
            }
            let groupSelect;
            // if (opinion === 'unclear') {
            //   groupSelect = (<span className='curation-group'>
            //     <select value={group} name={node.model.gene_stable_id} onChange={(e) => this.changeGroup(e,node)}>
            //       {groups.map((g,idx) => (
            //         <option key={idx} value={g.name}>{g.label}</option>
            //       ))}
            //     </select>
            //   </span>)
            // }
            return <foreignObject key={idx}
                                  x={10} y={node.x - 4}
                                  height={this.props.height}
                                  width={this.props.width}>
              <span
                    className={`curation ${opinion}`}
                    onClick={() => this.flipFlop(node)}>{opinion}</span>
              {reasonSelect}
              {groupSelect}
            </foreignObject>
          }
          return '';
        } ) }
      </g>
    )
  }
}
