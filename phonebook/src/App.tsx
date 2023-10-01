import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ContactList from './components/contactlist';
// import EditContact from './components/editcontact';
import AddContactForm from './components/addcontactform';
import EditForm from './components/editform';
import './App.css';

const App: React.FC = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<ContactList />} />
          <Route path="/add" element={<AddContactForm />} />
          <Route path="/edit/:id" element={<EditForm />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;
