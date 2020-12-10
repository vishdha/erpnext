frappe.provide("erpnext.bloombrackets");

const { CMD_CALL } = require('./bloombrackets/constants');
const { CommandInsert, ExpressionInsert } = require('./bloombrackets/inserters');
const { 
  CustomCommand, 
  Input, 
  Block, 
  Variable, 
  IfThenElse, 
  Expression, 
  ComparisonOperatorSelector, 
  VarSet, 
  MathExp 
} = require('./bloombrackets/renderers');

class BloomBracketsComponent {
  constructor($wrapper, frm, script_field) {
    this.$wrapper = $wrapper;
    this.frm = frm;

    // Redefines components here to avoid cyclical dependency.
    // UI Inserters
    this.insertExpressionInsert = ExpressionInsert.bind(null, this);
    this.insertCommandInsert = CommandInsert.bind(null, this);

    // Commands UI
    this.insertVariable = Variable.bind(null, this);
    this.insertIfThenElse = IfThenElse.bind(null, this);
    this.insertBlock = Block.bind(null, this);
    this.insertExpression = Expression.bind(null, this);
    this.insertComparisonOperatorSelector = ComparisonOperatorSelector.bind(null, this);
    this.insertInput = Input.bind(null, this);
    this.insertVarSet = VarSet.bind(null, this);
    this.insertCustomCommand = CustomCommand.bind(null, this);
    this.insertMathExp = MathExp.bind(null, this);

    // Default script to kickoff UI:
    this.script = [];
    this.context = {
      "#VAR": {
        quotation: {
          fieldtype: undefined,
          doctype: "Quotation"
        },
        coupon: {
          fieldtype: undefined,
          doctype: "Coupon Code"
        },
        today: {
          fieldtype: "Date"
        }
      },
      "#CALL": {
        "Apply Discount": {
          description: "Applies a price discount.",
          args: [{
            fieldname: "discount",
            fieldtype: "Currency",
            maxlength: 20,
            description: "The discount value to apply.",
            validate: (value) => {
              return parseFloat(value);
            }
          }]
        },
        "Apply Percent Discount": {
          description: "Applies a percent discount",
          args: [{
            fieldname: "discount",
            fieldtype: "Float",
            maxlength: 20,
            required: true,
            description: "The discount percentage to apply.",
            validate: (value) => {
              value = parseFloat(value);
              if ( value < 0 ) {
                value = 0;
              } else if ( value > 100 ) {
                value = 100;
              }

              return value;
            }
          }]
        },
        "Item Present": {
          description: "Finds the specified item on the document",
          returns: 'boolean',
          args: [{
            fieldname: "item_name",
            fieldtype: "Link",
            option: "Item",
            maxlength: 40,
            required: true
          }]
        }, 
        "Item Present With Min Qty": {
          description: "Finds the specified item on the document",
          returns: 'boolean',
          args: [{
            fieldname: "item_name",
            fieldtype: "Link",
            option: "Item",
            maxlength: 40,
            required: true,
            description: "The item to find"
          }, {
            fieldname: "qty",
            fieldtype: "Int",
            maxlength: 40,
            required: true,
            description: "The item to find"
          }]
        }
      }
    };
    this.script_field = script_field;
    this.id_count = 0;
    if (frm[script_field]) {
      try {
        this.script = JSON.parse(frm[script_field]);
      } catch (err) {
        console.error(err);
      }
    }

    this.make();
  }

  make() {
    const html = Block(this, { block: this.script, cls: 'bb-block-top' });
    //const html = this.render_block(this.script);

    this.$wrapper.closest('.frappe-control').removeAttr('title');
    this.$wrapper.empty().append(html);
    this.$wrapper.trigger('bb-init');

    this.$wrapper.on('bb-script-change', () => {
      console.log(JSON.stringify(this.script, null, 2));
    })
  }

  list_vars() {
    return Object.keys(this.context['#VAR']);
  }

}

erpnext.bloombrackets.Component = BloomBracketsComponent;
module.exports.BloomBracketsComponent = BloomBracketsComponent;