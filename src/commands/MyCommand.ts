import {
  Command,
  CommandHandler,
  CommandPropertyGetter,
  CommandUsedEvent,
} from "@mhesus/mcbe-commands";

export abstract class MyCommand extends Command {
  description: string;
  usage?: CommandPropertyGetter<string, MyCommandHandler>;
  abstract execute(event: CommandUsedEvent, handler: MyCommandHandler): void;
}

export type MyCommandHandler = CommandHandler<MyCommand>;
