import { CommandUsedEvent, Getter } from "@mhesus/mcbe-commands";
import { MyCommand, MyCommandHandler } from "./MyCommand";

function getTopbar(text: string): string {
  return `${"=".repeat(10)}[ §g${text}§r ]${"=".repeat(10)}`;
}

export class HelpCommand extends MyCommand {
  name = "help";
  aliases = ["", "?", "cmds"];
  description = "Lists your usable commands.";
  usage = new Getter(
    "§g?help§r <page number: §8default 1§r>\n§g?help§r <command name>"
  );

  pageLength = 10;

  execute(event: CommandUsedEvent, handler: MyCommandHandler): void {
    let pageNumber = new Number(event.args[0] ?? 1).valueOf();

    if (!isNaN(pageNumber) && Number.isInteger(pageNumber) && pageNumber > 0) {
      this.listCommands(event, handler, pageNumber);
    } else {
      let commandName = event.args[0];

      let command = handler.getCommand(commandName);
      if (command === undefined) {
        event.sender.sendMessage(`§cUnknown command '${commandName}'§r`);
      } else {
        this.displayCommandHelp(event, handler, command);
      }
    }
  }

  protected listCommands(
    event: CommandUsedEvent,
    handler: MyCommandHandler,
    pageNumber: number
  ) {
    let commandHelpMesssages = handler
      .getCommands()
      .map(
        (command) =>
          `§8 > §g${handler.prefix + command.name}${
            command.aliases !== undefined
              ? "§7 " +
                command.aliases.map((alias) => handler.prefix + alias).join(" ")
              : ""
          }§r` +
          (command.description !== undefined ? " - " + command.description : "")
      );

    let numPages = Math.ceil(commandHelpMesssages.length / this.pageLength);
    pageNumber = Math.min(pageNumber, numPages);

    let messageRangeStart = (pageNumber - 1) * this.pageLength;
    let messageRangeEnd = messageRangeStart + this.pageLength;

    event.sender.sendMessage(
      `\n` +
        `${getTopbar(`Help (${pageNumber}/${numPages})`)}\n` +
        `${commandHelpMesssages
          .slice(messageRangeStart, messageRangeEnd)
          .join("\n")}\n` +
        (pageNumber < numPages
          ? `\n` +
            `Type §g${handler.prefix + this.name} ${
              pageNumber + 1
            }§r to view the next page.\n`
          : "") +
        `\n`
    );
  }

  protected displayCommandHelp(
    event: CommandUsedEvent,
    handler: MyCommandHandler,
    command: MyCommand
  ) {
    event.sender.sendMessage(
      `\n` +
        `${getTopbar(`Help (${handler.prefix + command.name})`)}\n` +
        `Name: §g${handler.prefix + command.name}§r\n` +
        (command.aliases !== undefined
          ? `Aliases: §7${command.aliases
              .map((alias) => handler.prefix + alias)
              .join(", ")}§r\n`
          : "") +
        (command.description !== undefined
          ? `Description: §7${command.description}§r\n`
          : "") +
        (command.usage !== undefined
          ? `Usage:\n${command.usage.value(event, handler)}\n`
          : "") +
        `\n`
    );
  }
}
