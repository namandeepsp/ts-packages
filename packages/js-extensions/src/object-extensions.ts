// Object prototype extensions
import { withCache } from './performance';

export function extendObject() {
  Object.prototype.isEmpty = function (): boolean {
    return Object.keys(this).length === 0;
  };

  Object.prototype.pick = function <T extends Record<string, any>, K extends keyof T>(keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    const obj = this as T;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  };

  Object.prototype.omit = function <T extends Record<string, any>, K extends keyof T>(keys: K[]): Omit<T, K> {
    const result = { ...this } as T;
    keys.forEach(key => {
      delete result[key];
    });
    return result as Omit<T, K>;
  };


  Object.prototype.deepClone = function <T>(): T {
    return withCache(`clone_${JSON.stringify(this)}`, () => {
      if (this === null || typeof this !== 'object') return this;

      // Handle Date objects
      if (this instanceof Date) return new Date(this.getTime()) as unknown as T;

      // Handle Array objects  
      if (Array.isArray(this)) {
        return this.map(item => {
          if (item && typeof item === 'object' && typeof (item as any).deepClone === 'function') {
            return (item as any).deepClone();
          }
          return item;
        }) as unknown as T;
      }

      // Handle regular objects
      const cloned = {} as Record<string, unknown>;
      Object.keys(this).forEach(key => {
        const value = (this as Record<string, unknown>)[key];
        if (value && typeof value === 'object' && typeof (value as any).deepClone === 'function') {
          cloned[key] = (value as any).deepClone();
        } else {
          cloned[key] = value;
        }
      });
      return cloned as T;
    });
  };


  Object.prototype.merge = function <T extends Record<string, unknown>>(other: Partial<T>): T {
    return { ...this, ...other } as T;
  };

  Object.prototype.deepFreeze = function <T>(): T {
    const propNames = Object.getOwnPropertyNames(this);
    for (const name of propNames) {
      const value = (this as any)[name];
      if (value && typeof value === 'object') {
        value.deepFreeze();
      }
    }
    return Object.freeze(this) as T;
  };

  Object.prototype.hasPath = function (path: string): boolean {
    const keys = path.split('.');
    let current: any = this;
    for (const key of keys) {
      if (current == null || !(key in current)) return false;
      current = current[key];
    }
    return true;
  };

  Object.prototype.getPath = function (path: string, defaultValue?: any): any {
    const keys = path.split('.');
    let current: any = this;
    for (const key of keys) {
      if (current == null || !(key in current)) return defaultValue;
      current = current[key];
    }
    return current;
  };

  Object.prototype.setPath = function (path: string, value: any): any {
    const keys = path.split('.');
    let current: any = this;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    return this;
  };
}