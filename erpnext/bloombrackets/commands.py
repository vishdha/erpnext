from functools import reduce
from erpnext.bloombrackets.constants import *

COMMANDS = {
	CMD_ADD: lambda args, ctx: sum(args),
	CMD_SUBSTRACT: lambda args, ctx: reduce(lambda a, b: a - b, args),
	CMD_MULTIPLY: lambda args, ctx: reduce(lambda a, b: a * b, args),
	CMD_DIVIDE: lambda args, ctx: reduce(lambda a, b: a / b, args),

	CMD_TRUE: lambda args, ctx: reduce(lambda a, b: a == b, args),
	CMD_FALSE: lambda args, ctx: reduce(lambda a, b: a != b, args),
	CMD_EQUALS: lambda args, ctx: reduce(lambda a, b: a == b, args),
	CMD_NOT_EQUALS: lambda args, ctx: reduce(lambda a, b: a != b, args),

	CMD_GREATER_THAN: lambda args, ctx: reduce(lambda a, b: a > b, args),
	CMD_GREATER_AND_EQUAL: lambda args, ctx: reduce(lambda a, b: a >= b, args),
	CMD_LESS_THAN: lambda args, ctx: reduce(lambda a, b: a < b, args),
	CMD_LESS_AND_EQUAL: lambda args, ctx: reduce(lambda a, b: a <= b, args),

	CMD_AND: lambda args, ctx: all(args),
	CMD_OR: lambda args, ctx: any(args),
	CMD_XOR: lambda args, ctx: reduce(lambda a, b: bool(a) ^ bool(b), args),
	CMD_NOT: lambda args, ctx: not all(args),

	CMD_INT: lambda args, ctx: int(args[0]),
	CMD_BOOL: lambda args, ctx: bool(args[0]),
	CMD_IN: lambda args, ctx: args[0] in args[1],
	
	CMD_ARRAY: lambda args, ctx: list(args),
	CMD_VAR: lambda args, ctx: ctx.get("#VAR")(args),

	CMD_IF: lambda args, ctx: ctx["#RUN"](args[1]) if args[0] else ctx["#RUN"](args[2] if len(args) > 2 else []),

	CMD_SET: lambda args, ctx: ctx.update({args[0]: args[1]}),
	CMD_CALL: lambda args, ctx: ctx.get(args[0])(*args[1:]),

	CMD_UNSUPPORTED: lambda args, ctx: ctx.update({
		"error": "Unsupported command".format(args[0])
	}),
}