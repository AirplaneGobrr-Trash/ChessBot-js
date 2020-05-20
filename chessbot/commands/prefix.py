import chessbot.bot as cb
from chessbot.command import *

class CommandPrefix(Command):
	name = "prefix"
	helpstring = ["prefix <prefix>", "Set a new prefix for your server!"]
	flags = FLAG_MUST_BE_SERVER_OWNER

	@classmethod
	async def run(self,ctx):
		if len(ctx.args) > 0:
			if len(ctx.args[0]) < 3:
				del cb.prefix_cache[ctx.guild.id]
				ctx.dbguild.set("prefix", ctx.args[0])
				await ctx.ch.send("Prefix set!")
			else:
				await ctx.ch.send("That prefix is too long!")
		else:
			await ctx.ch.send("You must specify a prefix!")