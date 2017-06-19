import _ from 'lodash';

let colors = require('d3').scale.category10().range();

export default function domainStats(genetree) {
  const speciesNodes = genetree.leafNodes();
  const numGenes = speciesNodes.length;
  let colorIdx = 0;
  return speciesNodes.reduce((map, node) => {
    const domains = _.get(node, 'model.domains');
    const geneId = _.get(node, 'model.gene_stable_id');

    if(_.isArray(domains)) {
      _.forEach(domains, (domain)=>{
        const id = domain.id;
        let mapValue = map[id];
        if(!mapValue) {
          map[id] = mapValue = {
            totalGenes: numGenes,
            genesWithDomain: 0,
            nodes: {},
            color: colors[colorIdx++ % colors.length]
          };
        }
        if(!mapValue.nodes[geneId]) {
          mapValue.nodes[geneId] = node;
          mapValue.genesWithDomain++;
        }
      })
    }

    return map;
  }, {});
}