from erpnext.bloombrackets.commands import COMMANDS
from erpnext.bloombrackets.constants import CMD_UNSUPPORTED, CMD_ARRAY
from erpnext.bloombrackets.types import *
from frappe.model.document import Document

def run_script(script, ctx):
	for statement in script:
		resolve_expression(statement, ctx)

def resolve_expression(expression, ctx):
	expression_type = resolve_type(expression)

	ctx.update({
		"#RUN": lambda script: run_script(script, ctx),
		"#VAR": lambda path: resolve_variable(path, ctx)
	})

	if expression_type == TYPE_EXPRESSION:
		cmd = expression[0]
		args = [ resolve_expression(arg, ctx) for arg in expression[1:] ]

		fn = COMMANDS.get(cmd, CMD_UNSUPPORTED)
		if fn == CMD_UNSUPPORTED:
			args = cmd

		print("[{}] {} => {}".format(cmd, args, fn))
		result = fn(args, ctx)
		print("CTX: {}".format(ctx))
		return result
	elif expression_type == TYPE_LIST:
		args = [ resolve_expression(arg, ctx) for arg in expression[1:] ]

		return args
	else:
		return expression

def resolve_type(value):
	if type(value) == int or type(value) == float:
		return TYPE_STRING
	elif type(value) == bool:
		return TYPE_BOOLEAN
	elif isinstance(value, str):
		return TYPE_STRING
	elif isinstance(value, list):
		if value[0] == CMD_ARRAY:
			return TYPE_LIST
		elif isinstance(value[0], list):
			return TYPE_BLOCK
		else:
			return TYPE_EXPRESSION

	return None

def resolve_variable(path, context):
	if isinstance(path, str):
		path = [path]

	idx = 0
	value = context

	for idx in range(0, len(path)):
		key = path[idx]

		doc = None
		if isinstance(value, Document):
			doc = value
			field_meta = value.meta.get_field(key)
		
		value = value.get(key)
		value_type = resolve_type(value)

		if doc:
			print("-- field: {}".format(key))
			print(field_meta)
			print(value)


	return value