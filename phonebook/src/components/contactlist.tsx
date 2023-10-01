import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CONTACT_LIST, DELETE_CONTACT } from './graphql';
import { css } from '@emotion/css';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import { atom, useAtom } from 'jotai';

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  phones: { number: string }[];
}

const containerStyles = css`
  padding: 16px;
`;

const favoriteContactsAtom = atom<number[]>([]);

const buttonStyles = css`
  background-color: #007aff;
  color: #fff;
  padding: 12px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const editButtonStyles = css`
  background-color: #fcd835;
  color: #fff;
  padding: 8px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 8px;

  &:hover {
    background-color: #f59e0b;
    color: #fff;
  }
`;

const deleteButtonStyles = css`
  background-color: #ff3b30;
  color: #fff;
  padding: 8px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 8px;

  &:hover {
    background-color: #d93732;
  }
`;

const listItemStyles = css`
  padding: 16px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 8px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 24rem;
  place-items: center;
`;

const profileImageStyles = css`
  width: 96px;
  height: 96px;
  border-radius: 5rem;
`;

const inputStyle = css`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  margin-bottom: 16px;
`;

const paginationControlsStyles = css`
  display: flex;
  justify-content: space-between;
`;

const ContactListPage: React.FC = () => {
  const [deleteContact] = useMutation(DELETE_CONTACT);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filtered, setFiltered] = useState<Contact[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const { loading, error, data, refetch } = useQuery<{ contact: Contact[] }>(GET_CONTACT_LIST, {
    variables: {
      limit: 10,
      offset: offset,
    },
  });

  const [favoriteContacts, setFavoriteContacts] = useAtom(favoriteContactsAtom);

  useEffect(() => {
    if (data) {
      const contacts = data.contact;
      setFiltered(contacts);
    }
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading contact list</div>;
  }

  const handleDelete = async (contactId: number) => {
    try {
      await deleteContact({ variables: { id: contactId } });
      refetch();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const toggleFavorite = (contactId: number) => {
    setFavoriteContacts((prevFavoriteContacts) => {
      if (prevFavoriteContacts.includes(contactId)) {
        return prevFavoriteContacts.filter((id) => id !== contactId);
      } else {
        return [...prevFavoriteContacts, contactId];
      }
    });
  };

  const sortedContacts = [...filtered].sort((a, b) => {
    const isAFavorite = favoriteContacts.includes(a.id);
    const isBFavorite = favoriteContacts.includes(b.id);

    if (isAFavorite && !isBFavorite) {
      return -1;
    } else if (!isAFavorite && isBFavorite) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <div className={containerStyles}>
      <h1>Contact List</h1>

      <input
        className={inputStyle}
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => {
          const query = e.target.value.toLowerCase();
          setSearchQuery(query);

          const filteredData = data!.contact.filter((entry) =>
            entry.first_name.toLowerCase().includes(query)
          );
          setFiltered(filteredData);
        }}
      />

    <Link to="/add">
        <button className={buttonStyles}>Add Contact</button>
      </Link>

      <div>
        {sortedContacts.length === 0 ? (
          <p>No contacts found.</p>
        ) : (
          sortedContacts.map((contact: Contact) => (
            <div key={contact.id}>
              <div className={listItemStyles}>
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.first_name}`}
                  className={profileImageStyles}
                />
                <div>
                  <h3>
                    {`${contact.first_name} ${contact.last_name}`}
                    <IconContext.Provider
                      value={{ color: favoriteContacts.includes(contact.id) ? 'gold' : 'gray' }}
                    >
                      <FaStar
                        onClick={() => toggleFavorite(contact.id)}
                        style={{ marginLeft: '8px', cursor: 'pointer' }}
                      />
                    </IconContext.Provider>
                  </h3>
                  <p>Phone Numbers:</p>
                  <ul>
                    {contact.phones.map((phone: any, index: number) => (
                      <li key={index}>{phone.number}</li>
                    ))}
                  </ul>
                  <div>
                    <Link to={`/edit/${contact.id}`} className={editButtonStyles}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className={deleteButtonStyles}
                      onClick={() => handleDelete(contact.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className={paginationControlsStyles}>
        <button
          onClick={() => {
            if (offset > 0) {
              setOffset(offset - 10);
            }
          }}
          disabled={offset === 0}
        >
          Previous
        </button>
        <button
          onClick={() => {
            setOffset(offset + 10);
          }}
          disabled={data!.contact.length < 10}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ContactListPage;
