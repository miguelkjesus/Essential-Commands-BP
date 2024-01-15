import { CommandUsedEvent } from "@mhesus/mcbe-commands";
import { MyCommand } from "./MyCommand";
import { PlayerModel } from "../model/PlayerModel";
import { system, Player, Vector3, Dimension, world } from "@minecraft/server";

function vectorToString({ x, y, z }: Vector3): string {
  return `(${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)})`;
}

export class HomeCommand extends MyCommand {
  name = "home";
  aliases = ["hm"];
  description = "Manages your personal teleports.";

  execute({ sender, args: [subcommand, ...subargs] }: CommandUsedEvent) {
    let playerModel = PlayerModel.get(sender);

    // set home
    if (subcommand === "set") {
      let name = subargs[0];
      playerModel.setHome(name, sender.location, sender.dimension.id);

      sender.sendMessage(
        `Set home '${name}' to ${vectorToString(sender.location)}`
      );
    }
    // remove home
    else if (subcommand === "remove") {
      let name = subargs[0];
      let home = playerModel.removeHome(name);
      if (home !== undefined) sender.sendMessage(`Removed home '${home.name}'`);
      else sender.sendMessage(`You don't have a home called '${name}'`);
    }
    // list all homes
    else if (subcommand === "list") {
      let homes = playerModel.getHomes();
      if (homes.length > 0) {
        let homeList = homes.map((home) => {
          return `* ${home.name} ${vectorToString(home.location)} ${
            home.dimensionId
          }`;
        });
        sender.sendMessage("Your current homes:\n" + homeList.join("\n"));
      } else {
        sender.sendMessage("You don't own any homes.");
      }
    }
    // clear all homes
    else if (subcommand === "clearall") {
      playerModel.clearHomes();
      sender.sendMessage("Cleared all homes.");
    }
    // rename home
    else if (subcommand === "rename") {
      let [name, newName] = subargs;
      let oldName = playerModel.getHome(name).name;
      playerModel.renameHome(name, newName);
      sender.sendMessage(`Renamed home '${oldName}' to '${newName}'`);
    }
    // tp to home
    else {
      this.tpHome(
        sender,
        playerModel,
        (subcommand === "tp" ? subargs[0] : subcommand) ?? "home"
      );
    }
  }

  tpHome(player: Player, playerModel: PlayerModel, homeName: string) {
    let home = playerModel.getHome(homeName);
    if (home == undefined) {
      player.sendMessage(`You don't own a home called '${homeName}'`);
    } else {
      system.run(() => {
        let success = player.tryTeleport(home.location, {
          checkForBlocks: true,
          dimension: world.getDimension(home.dimensionId),
        });
        if (success) {
          player.sendMessage(`Teleported you to '${home.name}'`);
        } else {
          player.sendMessage(`Failed to teleport you to '${home.name}'`);
        }
      });
    }
  }
}
