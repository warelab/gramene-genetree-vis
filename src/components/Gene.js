import React, {Component} from 'react';
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

export default class Gene extends Component {

  static availableShapes() {
    return {
      triangle : {
        shape : function(opts) {

          var halfWidth = Math.tan(Math.PI / 6) * opts.height;

          return `M${opts.x + opts.width / 2},${opts.y} \
            l${halfWidth},${opts.height} \
            l${-halfWidth * 2},0 \
            Z`;
        },

      },
      bigSolidPointyRectangle : {
        shape : function(opts) {
          let boxRatio = 0.75;//2 / 3;
          let arrowRatio = 1 - boxRatio;

          opts.cornerRadius = this.cornerRadius(opts.width, opts.height);

          return `M${opts.x},${opts.y + opts.cornerRadius} \
            a${opts.cornerRadius},${opts.cornerRadius} 0 0 1 ${opts.cornerRadius},${-opts.cornerRadius}
            l${opts.width * boxRatio - opts.cornerRadius},0 \
            l${opts.width * arrowRatio},${opts.height / 2} \
            l${-opts.width * arrowRatio},${opts.height / 2} \
            l${-opts.width * boxRatio + opts.cornerRadius},0 \
            a${opts.cornerRadius},${opts.cornerRadius} 0 0 1 ${-opts.cornerRadius},${-opts.cornerRadius} \
            Z`;
        },

      },
      default : {
        shape : function(opts) {

          opts.cornerRadius = this.cornerRadius(opts.width, opts.height);

          return `M${opts.x},${opts.y + opts.height / 2} \
            a${opts.width / 2},${opts.cornerRadius} 0 0 1 ${opts.width / 2},${-opts.cornerRadius} \
            a${opts.width / 2},${opts.cornerRadius} 0 0 1 ${opts.width / 2},${opts.cornerRadius} \
            a${opts.width / 2},${opts.cornerRadius} 0 0 1 ${-opts.width / 2},${opts.cornerRadius} \
            a${opts.width / 2},${opts.cornerRadius} 0 0 1 ${-opts.width / 2},${-opts.cornerRadius} \
            Z`;
        },

      },
      thinSolidPointyRectangle : {
        shape : function(opts) {

          var squeezeFactor = 2 / 3;

          opts.y += opts.height * (1 - squeezeFactor) / 2;

          opts.height = opts.height * squeezeFactor;
          opts.cornerRadius = this.cornerRadius(opts.width, opts.height);
          opts.cornerRadius = opts.cornerRadius * squeezeFactor;

          return Gene.availableShapes().bigSolidPointyRectangle.shape.call(this, opts);

        },

      },

      bigStripedPointyRectangle : {
        shape : function(opts) {
          return Gene.availableShapes().bigSolidPointyRectangle.shape.call(this, opts);
        },
        mask : function() {
          return "url('#mask-stripe')";
        }
      },

      thinStripedPointyRectangle : {
        shape : function(opts) {
          return Gene.availableShapes().thinSolidPointyRectangle.shape.call(this, opts);
        },
        mask : function() {
          return "url('#mask-stripe')";
        }
      }
    }
  }

  static shapeMaster() {

    var availableShapes = Gene.availableShapes();

    return {
      "protein_coding"       : availableShapes.bigSolidPointyRectangle,
      "ncRNA"                : availableShapes.thinSolidPointyRectangle,
      "miRNA"                : availableShapes.thinStripedPointyRectangle,
      "snoRNA"               : availableShapes.thinSolidPointyRectangle,
      "tRNA"                 : availableShapes.thinSolidPointyRectangle,
      "misc_RNA"             : availableShapes.thinSolidPointyRectangle,
      "transposable_element" : availableShapes.bigStripedPointyRectangle,
      "lincRNA"              : availableShapes.thinSolidPointyRectangle,
      "nontranslating_CDS"   : availableShapes.bigStripedPointyRectangle,
      "tRNA_pseudogene"      : availableShapes.thinSolidPointyRectangle,
      "snRNA"                : availableShapes.thinSolidPointyRectangle,
      "rRNA"                 : availableShapes.thinSolidPointyRectangle,
      "pseudogene"           : availableShapes.thinSolidPointyRectangle,
      "SRP_RNA"              : availableShapes.thinSolidPointyRectangle,
      "antisense"            : availableShapes.thinSolidPointyRectangle,
      "tmRNA"                : availableShapes.thinSolidPointyRectangle,
      "ribozyme"             : availableShapes.thinSolidPointyRectangle,
      "RNase_MRP_RNA"        : availableShapes.thinSolidPointyRectangle,
      "telomerase_RNA"       : availableShapes.thinSolidPointyRectangle,
      "P_RNA"                : availableShapes.thinSolidPointyRectangle,
      "RNase_P_RNA"          : availableShapes.thinSolidPointyRectangle,
      "vault_RNA"            : availableShapes.thinSolidPointyRectangle,
    }
  }

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.state = { highlighted : false };

  }

  static biotypes() {
    return Object.keys(Gene.shapeMaster()).sort()
  }

  stroke (highlighted, highlightColor, defaultColor) {
    return highlighted ? highlightColor : defaultColor;
  }

  strokeWidth (highlighted, highlightWidth) {
    return highlighted ? highlightWidth : 0;
  }

  height () {
    return this.props.height || this.props.width * 2 / 3
  }

  cornerRadius (width, height) {
    return Math.floor(Math.min(this.props.width / 7.5, this.props.height / 2));
  }

	render () {

    var shapeStuff = Gene.shapeMaster()[this.props.gene.biotype] || Gene.availableShapes().default;

    let d = shapeStuff.shape.call(this,
      {
        x : this.props.x,
        y : this.props.y,
        width : this.props.width,
        height : this.height(),
      }
    );

    const tooltip = this.props.tooltip
      ?  <Tooltip id="tooltip">{ this.props.tooltip }</Tooltip>
      : null;

		return (
      <OverlayTrigger placement={ this.props.tooltipPlacement } overlay={tooltip} trigger='click' rootClose={true}>
        <g transform={"translate(" + (this.props.gene.orientation === '+' ? 0 : this.props.x * 2 + this.props.width) + ",0) scale(" + (this.props.gene.orientation === '+' ? 1 : -1) + ",1)"}>
          <path d={d} fill = {this.props.fillColor}
            strokeWidth = { this.strokeWidth(this.props.highlighted, this.props.highlightWidth) }
            stroke = { this.stroke(this.props.highlighted, this.props.highlightColor, this.props.strokeColor) }
            //onClick= { this.handleClick }
            //onDoubleClick={ this.handleClick }
            opacity = { this.props.opacity }
            //onMouseOver = { this.tooltipOver.bind(this) }
            //onMouseOut  = { this.tooltipOut.bind(this) }
            mask = {shapeStuff.mask ? shapeStuff.mask() : ''}
                cursor='pointer'
            />
        </g>
      </OverlayTrigger>

		);

	}

	handleClick() {
	  if (this.props.clickHandler) {
	    this.props.clickHandler( this.props.gene.id, this.props.gene.tree_id );
	  }
	}

	tooltipOver(e) {
	  if (this.props.tooltipHandler) {
	    this.props.tooltipHandler(this.props.gene, e.pageX, e.pageY, true);
	  }
	}

	tooltipOut(e) {
	  if (this.props.tooltipHandler) {
	    this.props.tooltipHandler(this.props.gene, e.pageX, e.pageY, false);
	  }
	}
}

Gene.defaultProps = {
  y               : 0,
  orientation     : "-",
  highlightWidth  : 1,
  highlightColor  : 'cyan',
  tooltipPlacement: 'bottom',
  opacity : "0.9"
}
