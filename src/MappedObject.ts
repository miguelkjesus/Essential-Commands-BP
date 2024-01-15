export class MappedObject<T extends { [K in keyof T]?: T[K] } = any> {
  protected data = <T>{};

  get(
    key: keyof T,
    default_?: T[keyof T],
    setDefault: boolean = false
  ): T[keyof T] {
    if (default_ !== undefined && !(key in this.data)) {
      if (setDefault) this.data[key] = default_;
      return default_;
    }
    return this.data[key];
  }

  set(key: keyof T, value: T[keyof T]): void {
    this.data[key] = value;
  }

  delete(key: keyof T): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = <T>{};
  }

  entries(): [keyof T, T[keyof T]][] {
    return Object.entries(this.data) as [keyof T, T[keyof T]][];
  }

  keys(): (keyof T)[] {
    return Object.keys(this.data) as (keyof T)[];
  }

  values(): T[keyof T][] {
    return Object.values(this.data);
  }
}
