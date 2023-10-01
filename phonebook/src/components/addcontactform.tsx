import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_CONTACT_WITH_PHONES } from './graphql';
import { css } from '@emotion/css';
import { useNavigate } from 'react-router-dom';

const formContainer = css`
  background-color: #f5f5f5;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 400px;
  margin: 0 auto;
`;

const inputStyle = css`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const formStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const addButtonStyle = css`
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

const submitButtonStyle = css`
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

const ErrorMessageStyle = css`
  background-color: rgb(252 165 165);
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const AddContactForm: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [errorMsg, setErrorMsg] = useState<boolean>(false);
  const navigate = useNavigate();

  const [addContactWithPhones] = useMutation(ADD_CONTACT_WITH_PHONES);

  const handleAddPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const handlePhoneNumberChange = (index: number, value: string) => {
    const updatedPhoneNumbers = [...phoneNumbers];
    updatedPhoneNumbers[index] = value;
    setPhoneNumbers(updatedPhoneNumbers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await addContactWithPhones({
        variables: {
          first_name: firstName,
          last_name: lastName,
          phones: phoneNumbers.map((number) => ({
            number,
          })),
        },
      });

      if (data && data.insert_contact) {
        console.log('Contact added:', data.insert_contact.returning);
        navigate("/");
      }
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message.includes('Uniqueness violation') &&
                error.message.includes('phone_number_key')
            ) {
                console.error('Phone number already used:', error);
                setErrorMsg(true);
            } else {
                console.error('Error updating phone number:', error);
            }
        } else {
            console.error('Error', error);
        }
    }
  };

  return (
    <div className={formContainer}>
      <h2>Add Contact</h2>
      {errorMsg === true ? (
        <div className={ErrorMessageStyle}>
          Phone number already used
        </div>
      ) : <div />}
      <form className={formStyle} onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input
          className={inputStyle}
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <label>Last Name:</label>
        <input
          className={inputStyle}
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <label>Phone Numbers:</label>
        {phoneNumbers.map((phoneNumber, index) => (
          <input
            className={inputStyle}
            key={index}
            type="text"
            value={phoneNumber}
            onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
          />
        ))}
        <button type="button" className={addButtonStyle} onClick={handleAddPhoneNumber}>
          Add Phone Number
        </button>
        <button type="submit" className={submitButtonStyle}>
          Save
        </button>
      </form>
    </div>
  );
};

export default AddContactForm;
