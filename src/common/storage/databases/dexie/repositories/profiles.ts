import { AbstractRepository } from "./abstract";

import type { Profile } from "@/common/profile";

export interface ProfileModelV1 {
  name: string;
  id: number;
  active: number;
}

export class ProfilesRepositoryV1 extends AbstractRepository<
  ProfileModelV1,
  number
> {
  public readonly tableName = "profiles";
  public readonly index = "id, active";

  public async clear() {
    await this.table.clear();
  }

  public async get() {
    return this.table
      .orderBy("id")
      .reverse()
      .toArray()
      .then((profiles) => profiles.map((profile) => this.asProfile(profile)));
  }

  private async getLastGuest() {
    return this.table
      .where("id")
      .below(0)
      .sortBy("id")
      .then((profiles) => {
        const profile = profiles.pop();
        return profile ? this.asProfile(profile) : null;
      });
  }

  public async addGuest() {
    const lastguest = await this.getLastGuest();
    const newId = lastguest ? lastguest.id - 1 : -1;
    const name = `Guest ${-newId}`;
    const profile = { name, id: newId, active: 0 };
    await this.table.add(profile);
    return this.asProfile(profile);
  }

  public async deleteGuest() {
    const lastguest = await this.getLastGuest();
    if (lastguest) {
      await this.table.where({ id: lastguest.id }).delete();
    }
  }

  public async replaceUser(id: number, name: string) {
    const user = await this.getUser();

    if (!user) {
      await this.table.add({ name, id, active: 0 });
    } else if (user.id !== id || user.name !== name) {
      await this.dexie.transaction("rw", this.table, async () => {
        await this.table.where("id").aboveOrEqual(0).delete();
        await this.table.add({ name, id, active: 0 });
      });
    }

    const activeProfile = await this.getActive();
    if (activeProfile === null) {
      await this.setActive(id);
    }
  }

  public async getUser() {
    return this.table
      .where("id")
      .aboveOrEqual(0)
      .first()
      .then((profile) => (profile ? this.asProfile(profile) : null));
  }

  public async addUser(id: number, name: string) {
    await this.table.add({ name, id, active: 0 });
  }

  public async deleteUser() {
    await this.table.where("id").aboveOrEqual(0).delete();
  }

  public async setActive(id: number) {
    await this.dexie.transaction("rw", this.table, async () => {
      await this.table.where({ active: 1 }).modify({ active: 0 });
      await this.table.where({ id }).modify({ active: 1 });
    });
  }

  public async getActive() {
    return this.table
      .where({ active: 1 })
      .first()
      .then((profile) => (profile ? this.asProfile(profile) : null));
  }

  public asProfile(profile: ProfileModelV1): Profile {
    return ProfilesRepositoryV1.asProfile(profile);
  }

  public static asProfile(profile: ProfileModelV1): Profile {
    return {
      id: profile.id,
      name: profile.name,
      active: Boolean(profile.active),
    };
  }
}
