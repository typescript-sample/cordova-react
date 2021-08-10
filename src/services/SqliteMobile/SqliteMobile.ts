import { Attribute, Attributes, Manager, Statement, StringMap } from './metadata';
import { buildToSave, buildToSaveBatch } from './build';


export class PoolMangaer implements Manager  {
  constructor(public database: any) {
    this.exec = this.exec.bind(this);
    this.execBatch = this.execBatch.bind(this);
    this.query = this.query.bind(this);
    this.queryOne = this.queryOne.bind(this);
    this.executeScalar = this.executeScalar.bind(this);
    this.count = this.count.bind(this);
  }
  exec(sql: string, args?: any[]): Promise<number> {
    return exec(this.database, sql, args);
  }
  execBatch(statements: Statement[]): Promise<number> {
  return execBatch(this.database, statements);
  }
  query<T>(sql: string, args?: any[], m?: StringMap, fields?: Attribute[]): Promise<T[]> {
      return query(this.database, sql, args, m, fields);
  }
  queryOne<T>(sql: string, args?: any[], m?: StringMap, fields?: Attribute[]): Promise<T> {
      return queryOne(this.database, sql, args, m, fields);
  }
  executeScalar<T>(sql: string, args?: any[]): Promise<T> {
  return executeScalar<T>(this.database, sql, args);
  }
  count(sql: string, args?: any[]): Promise<number> {
  return count(this.database, sql, args);
  }
}

export function execute(db: any, sql: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
      return db.transaction((txn) => {
          txn.executeSql(sql, [], () => {
          return resolve();
          }, (err: any) => {
              return reject(err);
          });
      });
  });
}
export function execBatch(db: any, statements: Statement[]): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    return db.transaction((txn) => {
        statements.forEach((item) => {
          txn.executeSql(item.query, item.args);
        })
    }, (e: any) => {
      reject(e);
    }, () => {
      resolve(1);
    });
  });
}
export function exec(db: any, sql: string, args?: any[]): Promise<number> {
  const p = args ? toArray(args) : [];
  return new Promise<number>((resolve, reject) => {
    return db.transaction((txn) => {
        txn.executeSql(sql, p, () => {
        return resolve(1);
        }, (err: any) => {
            console.log({err});
            return reject(0);
        });
    });
  });
}
export function query<T>(db: any, sql: string, args?: any[], m?: StringMap, bools?: Attribute[]): Promise<T[]> {
  const p = args ? args : [];
  return new Promise<T[]>((resolve, reject) => {
    return db.transaction((txn) => {
        txn.executeSql(sql, p, (tx, results: any) => {
          console.log(results);
          return resolve(handleResults<T>(results.rows._array, m, bools));
        });
    }, (err: any) => {
        reject(err);
    });
  });
}
export function queryOne<T>(db: any, sql: string, args?: any[], m?: StringMap, bools?: Attribute[]): Promise<T> {
  const p = args ? args : [];
  return new Promise<T>((resolve, reject) => {
    return db.transaction((txn) => {
        txn.executeSql(sql, p, (tx, result: any) => {
            return resolve(handleResult<T>(result.rows._array, m, bools));
        });
    }, (err: any) => {
        reject(err);
    });
  });
}
export function executeScalar<T>(db: any, sql: string, args?: any[]): Promise<T> {
  return queryOne<T>(db, sql, args).then(r => {
    if (!r) {
      return null;
    } else {
      const keys = Object.keys(r);
      return r[keys[0]];
    }
  });
}
export function count(db: any, sql: string, args?: any[]): Promise<number> {
  return executeScalar<number>(db, sql, args);
}
export function save<T>(db: any|((sql: string, args?: any[]) => Promise<number>), obj: T, table: string, attrs: Attributes, buildParam?: (i: number) => string, i?: number): Promise<number> {
  const stm = buildToSave(obj, table, attrs, buildParam, i);
  if (!stm) {
    return Promise.resolve(0);
  } else {
    if (typeof db === 'function') {
      return db(stm.query, stm.args);
    } else {
      return exec(db, stm.query, stm.args);
    }
  }
}
export function saveBatch<T>(db: any|((statements: Statement[]) => Promise<number>), objs: T[], table: string, attrs: Attributes, buildParam?: (i: number) => string): Promise<number> {
  const stmts = buildToSaveBatch(objs, table, attrs, buildParam);
  if (!stmts || stmts.length === 0) {
    return Promise.resolve(0);
  } else {
    if (typeof db === 'function') {
      return db(stmts);
    } else {
      return execBatch(db, stmts);
    }
  }
}
export function toArray<T>(arr: T[]): T[] {
  if (!arr || arr.length === 0) {
    return [];
  }
  const p: T[] = [];
  const l = arr.length;
  for (let i = 0; i < l; i++) {
    if (arr[i] === undefined) {
      p.push(null);
    } else {
      p.push(arr[i]);
    }
  }
  return p;
}
export function handleResult<T>(r: T, m?: StringMap, bools?: Attribute[]): T {
  if (r == null || r === undefined || (!m && (!bools || bools.length === 0))) {
    return r;
  }
  handleResults([r], m, bools);
  return r;
}
export function handleResults<T>(r: T[], m?: StringMap, bools?: Attribute[]): T[] {
  if (m) {
    const res = mapArray(r, m);
    if (bools && bools.length > 0) {
      return handleBool(res, bools);
    } else {
      return res;
    }
  } else {
    if (bools && bools.length > 0) {
      return handleBool(r, bools);
    } else {
      return r;
    }
  }
}
export function handleBool<T>(objs: T[], bools: Attribute[]): T[] {
  if (!bools || bools.length === 0 || !objs) {
    return objs;
  }
  for (const obj of objs) {
    for (const field of bools) {
      const value = obj[field.name];
      if (value != null && value !== undefined) {
        const b = field.true;
        if (b == null || b === undefined) {
          // tslint:disable-next-line:triple-equals
          obj[field.name] = ('1' == value || 'T' == value || 'Y' == value);
        } else {
          // tslint:disable-next-line:triple-equals
          obj[field.name] = (value == b ? true : false);
        }
      }
    }
  }
  return objs;
}
export function map<T>(obj: T, m?: StringMap): any {
  if (!m) {
    return obj;
  }
  const mkeys = Object.keys(m);
  if (mkeys.length === 0) {
    return obj;
  }
  const obj2: any = {};
  const keys = Object.keys(obj);
  for (const key of keys) {
    let k0 = m[key];
    if (!k0) {
      k0 = key;
    }
    obj2[k0] = obj[key];
  }
  return obj2;
}
export function mapArray<T>(results: T[], m?: StringMap): T[] {
  if (!m) {
    return results;
  }
  const mkeys = Object.keys(m);
  if (mkeys.length === 0) {
    return results;
  }
  const objs = [];
  const length = results.length;
  for (let i = 0; i < length; i++) {
    const obj = results[i];
    const obj2: any = {};
    const keys = Object.keys(obj);
    for (const key of keys) {
      let k0 = m[key];
      if (!k0) {
        k0 = key;
      }
      obj2[k0] = (obj as any)[key];
    }
    objs.push(obj2);
  }
  return objs;
}
export function getFields(fields: string[], all?: string[]): string[] {
  if (!fields || fields.length === 0) {
    return undefined;
  }
  const ext: string[] = [];
  if (all) {
    for (const s of fields) {
      if (all.includes(s)) {
        ext.push(s);
      }
    }
    if (ext.length === 0) {
      return undefined;
    } else {
      return ext;
    }
  } else {
    return fields;
  }
}
export function buildFields(fields: string[], all?: string[]): string {
  const s = getFields(fields, all);
  if (!s || s.length === 0) {
    return '*';
  } else {
    return s.join(',');
  }
}
export function getMapField(name: string, mp?: StringMap): string {
  if (!mp) {
    return name;
  }
  const x = mp[name];
  if (!x) {
    return name;
  }
  if (typeof x === 'string') {
    return x;
  }
  return name;
}
export function isEmpty(s: string): boolean {
  return !(s && s.length > 0);
}