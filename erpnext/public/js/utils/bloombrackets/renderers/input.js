import { Component } from "../component";

export const Input = Component("bb-control", (ui, $container, {
  exp, autofocus, reference_exp, onDelete, onChange, onRef
}) => {
  const $input = $container.find('input');
  const handleReferenceChange = (ref) => {
    console.log('REF CHANGE: ', ref);
  }

  if ( reference_exp ) {
    handleReferenceChange(reference_exp);
  }

  $input.on('change', () => {
    exp[1] = $input.val();
    if ( onChange ) {
      onChange(exp);
    }

    ui.$wrapper.trigger('bb-script-change');
  });

  if ( autofocus ) {
    $input.focus();
  }

  $container.find('.bb-control').on('bb-change', (e, cexp, meta, side) => {
    console.log("ON BB-CHANGE: ", cexp, meta, side);
    if ( cexp != exp && side ) {
      handleReferenceChange(cexp, meta);
    }
  });

}, () => `
  <input type="text" />
`);