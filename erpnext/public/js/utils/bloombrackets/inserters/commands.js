import { Component } from "../component";
import { CMD_IF, CMD_SET, CMD_EQUALS, CMD_UNDEFINED, CMD_CALL, CMD_STRING } from "../constants";
import { AddRemoveWrapper } from "./add_remove";

export const CommandInsert = (ui, {
  block, 
  open, 
  no_void_cmds=false, 
  insert_directly=false, 
  no_extra_command_insert=false, 
  onRef, 
  fullWidth = true,
  order,
  hideRemoveBtn
}) => {

  const handleDelete = ($container, exp) => {
    const exp_idx = block.indexOf(exp);
    block.splice(exp_idx, 1);
    $container.remove();
    ui.$wrapper.trigger('bb-script-change');
  }

  const handleOptionSelected = (cmd, opt) => {
    let html = undefined;
    let insertHtml = undefined;
    let exp = undefined;

    switch (cmd) {
      case CMD_IF:
        exp = [
          CMD_IF,
          [CMD_EQUALS,
            [CMD_UNDEFINED],
            [CMD_UNDEFINED]
          ],
          [],
          []
        ];
        block.push(exp);
        html = ui.insertIfThenElse({ exp, autofocus: true, onRef });
        insertHtml = ui.insertCommandInsert( { block, open, fullWidth, order: block.length })
        break;
      case CMD_SET:
        exp = [CMD_SET, CMD_UNDEFINED, [CMD_UNDEFINED]];
        block.push(exp);
        html = ui.insertVarSet({ exp, autofocus: true, onRef });
        insertHtml = ui.insertCommandInsert( { block, open, fullWidth, order: block.length })
        break;
      case CMD_CALL:
        let exp_result = undefined;
        // inserts the CMD_CALL directly into the block
        // Used when embedding CommandInsert inside ExpressionInsert to reuse
        // method listing and inserting logic.
        if ( insert_directly ) {
          block[0] = CMD_CALL;
          block.slice(1);
          block.push(opt.name)
          for(let arg of opt.meta.args) {
            block.push([CMD_UNDEFINED]);
          }
          exp_result = block;
        } else {
          exp = [CMD_CALL, opt.name];
          for(let arg of opt.meta.args) {
            exp.push([CMD_UNDEFINED]);
          }
          block.push(exp);
          exp_result = exp;
        }
        html = ui.insertCustomCommand({ exp: exp_result, onRef })
        if ( no_extra_command_insert == false ) {
          insertHtml = ui.insertCommandInsert({
            block, open, 
            fullWidth: !insert_directly?fullWidth:false, 
            order: block.length
          });
        }
        break;
      default:
        break;
    }

    return [html, insertHtml]
  }

  const options = []

  if ( !no_void_cmds ) {
    options.push(
      { value: CMD_IF, label: "IF" },
      { value: CMD_SET, label: "SET" }
    );
  }

  for(const custom_cmd of Object.keys(ui.context['#CALL'])) {
    const custom_cmd_meta = ui.context['#CALL'][custom_cmd];
    if ( no_void_cmds == true && custom_cmd_meta.returns == undefined ) {
      continue;
    }

    options.push({
      value: CMD_CALL,
      label: custom_cmd,
      name: custom_cmd,
      title: custom_cmd_meta.description,
      meta: custom_cmd_meta
    });
  }

  return AddRemoveWrapper(ui, {
    block, 
    options, 
    title: "Select Command", 
    open, 
    onOptionSelected: handleOptionSelected, 
    onDelete: handleDelete,
    fullWidth,
    order,
    hideRemoveBtn
  });
}

export default CommandInsert;