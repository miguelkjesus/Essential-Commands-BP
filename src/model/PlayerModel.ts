import { Entity, Vector3, system, world } from "@minecraft/server";
import { Home, PlayerRepo } from "../repo/PlayerRepo";
import { MappedObject } from "../MappedObject";

export { Home };

export class PlayerModel {
  private static instances = new MappedObject<Record<string, PlayerModel>>();
  private cache = new MappedObject<{ homes?: Home[] }>();

  // clear cache every tick since dynamic properties may have changed
  private static _cacheCleaner = system.runInterval(() => {
    for (let instance of this.instances.values()) instance.clearCache();
  });

  // clear instance cache for a player when they leave to avoid memory leaks
  private static _instanceCleaner = world.afterEvents.entityRemove.subscribe(
    (ev) => {
      for (let instance of this.instances.values()) {
        let id = instance.entity.id;
        if (id === ev.removedEntityId) this.instances.delete(id);
      }
    }
  );

  /** The entity associated with this model. */
  readonly entity: Entity;

  private constructor(entity: Entity) {
    this.entity = entity;
  }

  static get(entity: Entity): PlayerModel {
    return this.instances.get(entity.id, new this(entity), true);
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
    return this.getHomes().find((home) => name === home.name);
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
  setHome(name: string, location: Vector3): void {
    let existing = this.getHome(name);

    if (existing === undefined) {
      this.setHomes([...this.getHomes(), { name, location }]);
    } else {
      existing.location = location;
    }
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
  removeHome(name: string): boolean {
    let homes = this.getHomes();
    let existingIdx = homes.findIndex((home) => name === home.name);

    if (existingIdx === -1) {
      return false;
    } else {
      this.setHomes(homes.splice(existingIdx, 1));
      return true;
    }
  }
}
