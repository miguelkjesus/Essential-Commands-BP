import { Entity, Vector3 } from "@minecraft/server";

export interface Home {
  name: string;
  location: Vector3;
}

export class PlayerRepo {
  private constructor() {}

  static getHomes(entity: Entity): Home[] {
    let homes = entity.getDynamicProperty("homes") as string;
    return homes === undefined ? [] : JSON.parse(homes);
  }

  static setHomes(entity: Entity, homes: Home[]) {
    entity.setDynamicProperty("homes", JSON.stringify(homes));
  }
}
