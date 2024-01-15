import { Entity, Vector3 } from "@minecraft/server";
import { system, world } from "@minecraft/server";
import { Home, PlayerRepo } from "../repo/PlayerRepo";
import { MappedObject } from "../MappedObject";

let instances = new MappedObject<Record<string, PlayerModel>>();

export class PlayerModel {
  private cache = new MappedObject<{ homes?: Home[] }>();

  /** The entity associated with this model. */
  readonly entity: Entity;

  private constructor(entity: Entity) {
    this.entity = entity;
  }

  static get(entity: Entity): PlayerModel {
    return instances.get(entity.id, new this(entity), true);
  }

  /** Clear the dynamic property cache. */
  clearCache(): void {
    this.cache.clear();
  }

  /** Returns a list of names of each home owned by the player. */
  getHomes(): Home[] {
    return this.cache.get("homes", PlayerRepo.getHomes(this.entity), true);
  }

  /**
   * Gets an existing home, or returns undefined if it doesn't exist.
   * @param name The name of the home.
   */
  getHome(name: string): Home {
    name = name.toLowerCase();
    return this.getHomes().find((home) => name === home.name.toLowerCase());
  }

  /**
   * Gets an existing home, or returns undefined if it doesn't exist.
   * @param name The name of the home.
   */
  getHomeIndex(name: string): number {
    name = name.toLowerCase();
    return this.getHomes().findIndex(
      (home) => name === home.name.toLowerCase()
    );
  }

  /**
   * Overwrites the players homes.
   * @param homes A list of homes.
   */
  setHomes(homes: Home[]): void {
    PlayerRepo.setHomes(this.entity, homes);
  }

  /**
   * Sets a new home or overwrites an existing home.
   * @param name The name of the new home.
   * @param location The location of the new home.
   */
  setHome(name: string, location: Vector3, dimensionId: string): void {
    let existingIdx = this.getHomeIndex(name);

    let newHome: Home = { name, location, dimensionId };

    if (existingIdx === -1) {
      this.setHomes([...this.getHomes(), newHome]);
    } else {
      let homes = this.getHomes();
      homes.splice(existingIdx, 1, newHome);
      this.setHomes(homes);
    }
  }

  /**
   * Rename a player's home.
   * @param name The home's name.
   * @param newName The home's new name.
   */
  renameHome(name: string, newName: string): void {
    let homes = this.getHomes();
    homes[this.getHomeIndex(name)].name = newName;
    this.setHomes(homes);
  }

  /** Clears the player's homes. */
  clearHomes(): void {
    this.setHomes([]);
  }

  /**
   * Removes a home from the player.
   * @param name The name of the home.
   * @returns Whether the home existed before removal.
   */
  removeHome(name: string): Home {
    let homes = this.getHomes();
    let existingIdx = this.getHomeIndex(name);

    if (existingIdx === -1) {
      return undefined;
    } else {
      let home = homes[existingIdx];
      homes.splice(existingIdx, 1);
      this.setHomes(homes);
      return home;
    }
  }
}

// clear cache every tick since dynamic properties may have changed
system.runInterval(() => {
  for (let instance of instances.values()) instance.clearCache();
});

// clear instance cache for a player when they leave to avoid memory leaks
world.afterEvents.entityRemove.subscribe((ev) => {
  for (let instance of instances.values()) {
    let id = instance.entity.id;
    if (id === ev.removedEntityId) instances.delete(id);
  }
});
