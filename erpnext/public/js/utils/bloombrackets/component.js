import { gen_id } from "./utils"

/**
 * Simple jquery based component wrapper. Helps to quickly build component based ui.
 * @param {BloomBracketsComponent} ui The Bloombrackest instance
 * @param {function} init A callback function triggered when the component is inserted on dom.
 * @param {function} renderer A callback function expecting html string to insert into dom.
 * @returns A component wrapped in a function. Calling this function will return html for the component.
 */
export function Component(...compArgs) {
  let init = undefined;
  let render = undefined;
  let cls = undefined;
  let first = undefined;
  let last = undefined;
  if (compArgs.length > 2) {
    [cls, init, render] = compArgs;
  } else if (compArgs.length > 1) {
    [first, last] = compArgs;
    if ( typeof first == 'string' ) {
      cls = first;
      render = last;
    } else {
      init = first;
      render = last;
    }
  } else {
    [render] = compArgs;
  }

  return (ui, props) => {
    const id = `bb-component-${gen_id()}`;

    if (ui == undefined) {
      throw new ReferenceError("ui refenrece is undefined...");
    }

    if (init) {
      let initialized = false;
      // Wait for widget to be ready before init
      ui.$wrapper.one('bb-init', () => {
        // Sanity check, only run init once for this component
        if ( !initialized ) {
          initialized = true;
          const $comp = ui.$wrapper.find(`#${id}`);
          init(ui, $comp, props, cls);
        }
      });
    }

    return `
      <div id="${id}" class="bb-component${ cls ? ` ${cls}` : ''}">
        ${render(ui, props, cls)}
      </div>
    `
  }
}