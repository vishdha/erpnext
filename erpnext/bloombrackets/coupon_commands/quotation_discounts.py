from frappe.utils import flt

CMD_APPLY_DISCOUNT = "Apply Discount"
CMD_APPLY_DISCOUNT_PERCENT = "Apply Discount Percent"

def load_commands(commands, for_doctype):

	def apply_discount(args, ctx):
		value = flt(args[0])
		ctx["#VARS"]["doc"].set("discount_amount", value)

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)
	
	def apply_discount_percent(args, ctx):
		percent = flt(args[0])
		discount = (ctx["#VARS"]["doc"].total_taxes_and_charges * percent) / 100
		ctx["#VARS"]["doc"].set("discount_amount", discount)

		# How we undo this script's data
		ctx["#VARS"]["undo_script"].append(
			["CALL", CMD_APPLY_DISCOUNT, 0]
		)

	commands.update({
		CMD_APPLY_DISCOUNT: apply_discount,
		CMD_APPLY_DISCOUNT_PERCENT: apply_discount_percent
	})

def load_commands_meta(meta, for_doctype):
	meta.update({
		CMD_APPLY_DISCOUNT: {
			"description": "Applies discount value to a quotation",
			"args": [{
				"name": "discount",
				"description": "A discount value",
				"fieldtype": "Currency"
			}]
		},

		CMD_APPLY_DISCOUNT_PERCENT: {
			"description": "Applies discount percentage to a quotation",
			"args": [{
				"name": "percent",
				"description": "A discount percent value",
				"fieldtype": "float"
			}]
		}
	})

