import { CommandUsedEvent } from "@mhesus/mcbe-commands";
import { MyCommand } from "./MyCommand";
import { PlayerModel } from "../model/PlayerModel";
import { Player } from "@minecraft/server";

export class HomeCommand extends MyCommand {
  name = "home";
  aliases = ["hm"];
  description = "Manages your personal teleports.";

  execute({ sender, args: [subcommand, ...subargs] }: CommandUsedEvent) {
    let playerModel = PlayerModel.get(sender);

    // set home
    if (subcommand === "set") {
      let name = subargs[0];
      playerModel.setHome(name, sender.location);
    }
    // list all homes
    else if (subcommand === "list") {
      let homeNames = playerModel.getHomes().map((home) => {
        let { x, y, z } = home.location;
        return `- ${home.name} (${x}, ${y}, ${z})`;
      });
      if (homeNames.length > 0) {
        sender.sendMessage("Your current homes:\n" + homeNames.join("\n"));
      } else {
        sender.sendMessage("You don't own any homes.");
      }
    }
    // tp to primary home
    else if (subcommand === undefined) {
      this.tpHome(sender, playerModel, "home");
    }
    // tp to given home
    else {
      this.tpHome(
        sender,
        playerModel,
        subcommand === "tp" ? subargs[0] : subcommand
      );
    }
  }

  tpHome(player: Player, playerModel: PlayerModel, homeName: string) {
    let home = playerModel.getHome(homeName);
    if (home == undefined) {
      player.sendMessage(`You don't own a home called '${homeName}'`);
    } else {
      player.teleport(home.location);
      let { x, y, z } = home.location;
      player.sendMessage(`Teleported you to '${home.name}' (${x}, ${y}, ${z})`);
    }
  }
}
