import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { useSqlite } from './sqlite-hook';
import { User } from './models/User';

function App() {
  const sqliteDb = useSqlite();
  const [inputUser, setInputUser] = useState<User>({
    userId: null,
    name: '',
    email: '',
    status: false
  });
  const [deleteId, setDeleteId] = useState<string>('');
  const [inputId, setInputId] = useState<string>('');

  const handleFetch = () => {
    sqliteDb.all().then(res => console.log(res));
  }

  const handleInputUserId = (e: any) => {
    setInputUser((prev) => ({...prev, userId: e.target.value}));
  };
  const handleInputName = (e: any) => {
    setInputUser((prev) => ({...prev, name: e.target.value}));
  };
  const handleInputEmail = (e: any) => {
    setInputUser((prev) => ({...prev, email: e.target.value}));
  };
  const handleInputDelete = (e: any) => {
    setDeleteId(e.target.value);
  };
  const handleInputId = (e: any) => {
    setInputId(e.target.value);
  };

  const handleInsert = () => {
    sqliteDb.insert(inputUser);
    setInputUser((prev) => ({...prev,userId: null, name: '', email: '', status: false}));
    handleFetch();
  }

  const handleDelete = () => {
    sqliteDb.deleteUser(deleteId);
    setDeleteId('');
    handleFetch();
  }

  const load = () => {
    sqliteDb.load(inputId);
    setInputId('');
  }

  const handleUpdate = () => {
    sqliteDb.update(inputUser);
    setInputUser({userId: null, name: '', email: '', status: false});
    handleFetch();
  }

  const inserMany = () => {
    const users: User[] = [
      {
        userId: '5',
        name: '5',
        email: '5',
        status: false
      },
      {
        userId: '6',
        name: '6',
        email: '6',
        status: false
      },
      {
        userId: '7',
        name: '7',
        email: '7',
        status: false
      },
      {
        userId: '8',
        name: '8',
        email: '8',
        status: false
      },
    ];
    sqliteDb.insertMany(users);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className='list-user'>
        {sqliteDb.users ? sqliteDb.users.map(item => (
          <>
            <p>User Name: {item.name}</p>
            <p>Email: {item.email}</p>
            <hr />
          </>
        )) : (
          <p>
            Hello World!
          </p>
        )}
          </div>
        <button onClick={handleFetch}>Fetch</button>
        <div style={{display: 'contents'}}>
          <input value={inputId} placeholder='Input Id' onChange={handleInputId}/>
        </div>
        <button onClick={load}>Load</button>
        <div style={{display: 'contents'}}>
          <input value={inputUser.userId} placeholder='userId' onChange={handleInputUserId}/>
          <input value={inputUser.name} placeholder='name' onChange={handleInputName}/>
          <input value={inputUser.email} placeholder='email' onChange={handleInputEmail}/>
        </div>
        <div style={{display: 'flex', justifyContent:'space-between'}}>
          <button onClick={handleInsert}>Insert</button>
          <button onClick={handleUpdate}>Update</button>
        </div>
        <button onClick={inserMany}>Insert Many</button>
        <div style={{display: 'contents'}}>
          <input value={deleteId} placeholder='Delete Id' onChange={handleInputDelete}/>
        </div>
        <button onClick={handleDelete}>Delete</button>
      </header>
    </div>
  );
}

export default App;
