//const { OP_LABELS } = require('./constants');
import { gen_id } from '../utils';
import { Component } from '../component';
import { ALL_OPERATORS, OP_LABELS } from "../constants";

export const ComparisonOperatorSelector = (ui, { exp, autofocus, reference_exp }) => {
  const ops = ALL_OPERATORS;
  let $containerRef = null;
  let rightApi = undefined;

  const handleRightRef = (ref) => {
    rightApi = ref;
  }

  const handleLeftChange = (exp, meta) => {
    console.log("ON LEFT CHANGE: ", exp, meta);
    $containerRef.find('.bb-control').trigger('bb-change', [exp, meta, 'left']);
    if ( rightApi ) {
      rightApi.updateFieldType(meta.fieldtype);
    }
  }

  const handleRightChange = (exp, meta) => {
    console.log("ON RIGHT CHANGE: ", exp, meta);
    $containerRef.find('.bb-control').trigger('bb-change', [exp, meta, 'right']);
  }

  return Component((ui, $container) => {
    const $select = $container.find('.bb-operator:first select');
    $containerRef = $container;

    $select.on('change', () => {
      if (!$select.hasClass('hidden')) {
        console.log("OP CHANGE: ", $select.val());
        // update expression operator command
        exp[0] = $select.val();
        ui.$wrapper.trigger('bb-script-change');
      }
    });
  }, (ui) => {
    const options = ops.map((op, i) => `<option ${i == 0 ? 'selected' : ''} value="${op}">${OP_LABELS[op]}</option>`).join('');

    return `
      <div class="bb-left">
        ${ ui.insertExpressionInsert({
          exp: exp[1],
          autofocus, 
          open: true, 
          reference_exp,
          onChange: handleLeftChange
        })}
      </div>
      <div class="bb-control bb-operator">
        <select>${options}</select>
      </div>
      <div class="bb-right">
        ${ ui.insertExpressionInsert({
          exp: exp[2], 
          autofocus: undefined, 
          open: true, 
          reference_exp: reference_exp, 
          onChange: handleRightChange,
          ref: handleRightRef
        })}
      </div>
      <div class="bb-group bb-between">
        <div class="bb-text">AND</div>
        <div class="bb-right2"></div>
      </div>
    `;
  })(ui);
}

export default ComparisonOperatorSelector;