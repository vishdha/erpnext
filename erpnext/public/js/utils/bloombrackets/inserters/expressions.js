import { Component } from "../component";
import { CMD_STRING, CMD_VAR, CMD_ADD, CMD_UNDEFINED, CMD_EQUALS, CMD_CALL, CMD_VAL } from "../constants";

/**
 * Component which inserts expressions (variables, inputs, math and commands which return values)
 * @param {BloomBracketsComponent} ui The BloomBracketsComponent app instance
 * @param {JQuery} $container A jquery object that references this component's container
 * @param {object} props A property object passed to initialize component
 * @param {array} props.exp The expression instance related to this component.
 * @param {array} props.autofocus Focuses the inserted component's input if one is added.
 * @param {boolean} props.open When true the dropdown will be automatically displayed
 * @param {array} props.reference_exp A reference expression (usually a parent expression) used by children expressions to check type changes.
 * @param {function} props.onChange A callback issued by child component when it changes.
 * @param {object} props.exp_meta A callback issued when the delete button is clicked.
 * @param {function} props.onOptionsOpen A callback issued when the dropdown is displayed after clicking + button.
 * @param {function} props.onInit A callback issued when this component first initializes.
 */
export const ExpressionInsert = Component((ui, $container, { 
  exp, autofocus, open, reference_exp, onChange, exp_meta, onRef 
}) => {
  const $btn_min = $container.find('> .btn-minus');
  const $btn_plus = $container.find('.bb-actions > .btn-plus');
  const $select = $container.find('.bb-actions > .bb-control > select');
  const $actions = $container.find('> .bb-actions');
  const $content = $container.find('> .bb-content');

  const handleExpressionDelete = () => {
    exp.splice(1);
    exp[0] = CMD_UNDEFINED;
    $content.empty();
    $actions.show();
    $select.parent().addClass('hidden');
    $btn_plus.removeClass('hidden');
    $btn_min.addClass('hidden');
    $container.trigger('bb-script-change');
  }

  const handleOpenOptions = () => {
    $select.parent().removeClass('hidden');
    $btn_plus.addClass('hidden');
    $btn_min.removeClass('hidden');
  }

  const handleCloseOptions = () => {
    $select.parent().addClass('hidden');
    $btn_plus.removeClass('hidden');
    $btn_min.addClass('hidden');
    if ( $content.children().length > 0 ) {
      handleExpressionDelete();
    }
  }

  const handleSelectChange = () => {
    handleInsert($select.val());
    $select.val('');
  }

  // handles showing/hiding a red highlight over component when hovering on delete button.
  const handleHoverCloseOptionsIn = () => {
    $container.addClass('bb-delete-warning');
  }
  const handleHoverCloseOptionsOut = () => {
    $container.removeClass('bb-delete-warning');
  }

  const handleInsert = (insert) => {
    let html = undefined;

    switch (insert) {
      case "input":
        exp[0] = CMD_VAL;
        html = ui.insertInput({
          exp, 
          autofocus: autofocus != undefined?autofocus:true, 
          reference_exp,
          onDelete: handleExpressionDelete, 
          onChange, 
          exp_meta,
          onRef
        });
        $content.empty().append(html);
        $actions.hide();
        break;
      case "var":
        exp[0] = CMD_VAR;
        html = ui.insertVariable({
          exp, 
          autofocus: autofocus != undefined?autofocus:true, 
          onDelete: handleExpressionDelete, 
          onChange, 
          exp_meta,
          onRef
        });
        $content.empty().append(html);
        $actions.hide();
        break;
      case "math":
        if ( exp[0] == CMD_UNDEFINED ) {
          exp[0] = CMD_ADD;
          exp.splice(1);
          exp[1] = [CMD_UNDEFINED];
          exp[2] = [CMD_UNDEFINED];
        }
        html = ui.insertMathExp({
          exp
        });
        $content.empty().append(html);
        $actions.hide();
        break;
      case "method":
        html = ui.insertCommandInsert({
          block: exp,
          open: true,
          no_void_cmds: true,
          insert_directly: true,
          no_extra_command_insert: true,
          onRef, 
          fullWidth: false,
          hideRemoveBtn: true
        })
        $content.empty().append(html);
        $actions.hide();
    }

    if (html) {
      ui.$wrapper.trigger('bb-init');
    }

    $container.trigger('bb-script-change');
  }

  // Binds
  $select.on('change', handleSelectChange);
  $btn_plus.on('click', handleOpenOptions);
  $btn_min.on('click', handleCloseOptions);
  $btn_min.hover(handleHoverCloseOptionsIn, handleHoverCloseOptionsOut);

  // Initialize inserts if already defined
  if (exp[0] == CMD_VAR) {
    handleInsert('var');
  }

  if (exp[0] == CMD_STRING) {
    handleInsert('input');
  }

  // open options from the start
  if (open) {
    handleOpenOptions();
  }

}, (ui) => `
  <div class="bb-actions">
    <i class="btn btn-plus octicon octicon-plus"></i>
    <div class="bb-control hidden">
      <select>
        <option hidden selected value> -- </option>
        <option value="input">Input</option>
        <option value="var">Variable</option>
        <option value="math">Math</option>
        <option value="method">Method</option>
      </select>
    </div>
  </div>
  <div class="bb-content">
  </div>
  <i class="btn btn-minus octicon octicon-x hidden"></i>
`);