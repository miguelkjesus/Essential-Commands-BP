import { CommandHandler } from "@mhesus/mcbe-commands";
import { HelpCommand, HomeCommand } from "./commands/index";

// REGISTER CMDS
new CommandHandler("?")
  .register([HomeCommand, HelpCommand].map((cmd) => new cmd()))
  .start();
