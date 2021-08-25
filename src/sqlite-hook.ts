import { useEffect, useState } from "react";
import { User } from "./models/User";
import { Statement } from "./services/SqliteMobile/metadata";
import { DatabaseManager } from "./services/SqliteMobile/SqliteMobile";

export const useSqlite = () => {
  // @ts-ignore: Unreachable code error
  const database = window.sqlitePlugin.openDatabase('database.db', '1.0', 'user database', 1000000);
  const [users, setUser] = useState<User[]>([]);
  const sqliteUser = new DatabaseManager(database);

  useEffect(() => {
    (() => {
      // deleteTable();
      initTable();
    })();
  }, []);

  const initTable = () => {
    const string = `CREATE TABLE IF NOT EXISTS users(
      userId TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      email TEXT,
      status BOOLEAN
    )`;
    sqliteUser.exec(string);
  };

  const deleteTable = () => {
    const string = `DROP TABLE users`;
    sqliteUser.exec(string);
  }

  const all = () => {
    const string = 'select * from users';
    return sqliteUser.query<User>(string).then(res => setUser(res));
  };

  const load = (id: string) => {
    const string = 'SELECT * FROM users WHERE userId = ?';
    const args = [id];
    return sqliteUser.queryOne<User[]>(string, args).then(res => {
      setUser(res);
    });
  };

  const insert = (user: User) => {
    const string = 'INSERT INTO users (userId, name, email, status) VALUES (?,?,?,?)';
    const args = [user.userId, user.name, user.email, user.status];
    sqliteUser.exec(string, args).then(() => {
      alert('Insert Success!');
    }).catch(() => alert('Insert Failed!'));
  };

  const deleteUser = (id: string) => {
    const string = 'DELETE FROM users WHERE userId = ?';
    const args = [id];
    sqliteUser.exec(string, args).then(() => {
      alert('Delete Success!');
    }).catch(() => alert('Delete Failed!'));
  };

  const update = (user: User) => {
    const string = 'UPDATE users SET name=?,email=?,status=? WHERE userId=?';
    const args = [user.name, user.email, user.status, user.userId];
    sqliteUser.exec(string, args).then(() => {
      alert('Update Success!');
    }).catch(() => {
      alert('Update Failed!');
    });
  }

  const insertMany = (users: User[]) => {
    const statements: Statement[] = users.map((item) => {
      return { query: 'INSERT INTO users (userId, name, email, status) VALUES (?,?,?,?)', params: [item.userId, item.name, item.email, item.status] };
    });
    return sqliteUser.execBatch(statements, true).then(() => {
      alert('Success!');
    }).catch(() => alert('Rollback!'));
  }

  return { database, all, insert, users, deleteUser, load, update, insertMany };
};