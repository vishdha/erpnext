import { Component } from "../component";

export const Block = Component('bb-block', (ui, $container, { cls }) => {
  if ( cls ) {
    $container.addClass(cls);
  }
  $container.removeClass('bb-component');
}, (ui, { block }) => {
  const html = block.map((h, i) => ui.insertCommandInsert({ exp: h, order: i })).join('');

  return `
    ${html}
    ${ ui.insertCommandInsert({ block, order: block.length })}
  `
});

export default Block;