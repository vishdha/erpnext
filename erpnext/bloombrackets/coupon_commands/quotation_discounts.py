from frappe import flt

CMD_APPLY_DISCOUNT = "Apply Discount"
CMD_APPLY_DISCOUNT_PERCENT = "Apply Discount Percent"

def load_commands(commands):

	def apply_discount(args, ctx):
		value = args[1]
		ctx["#VAR"]["quotation"].discount = flt(value)
	
	def apply_discount_percent(args, ctx):
		percent = args[1]
		total = ctx["#VAR"]["quotation"].total
		ctx["#VAR"]["quotation"].discount = (total * percent) / 100

	commands.update({
		[CMD_APPLY_DISCOUNT]: apply_discount,
		[CMD_APPLY_DISCOUNT_PERCENT]: apply_discount_percent
	})

def load_commands_meta(meta):
	meta.update({
		[CMD_APPLY_DISCOUNT]: {
			"description": "Applies discount value to a quotation",
			"args": [{
				"name": "discount",
				"description": "A discount value",
				"fieldtype": "Currency"
			}]
		},

		[CMD_APPLY_DISCOUNT_PERCENT]: {
			"description": "Applies discount percentage to a quotation",
			"args": [{
				"name": "percent",
				"description": "A discount percent value",
				"fieldtype": "float"
			}]
		}
	})

