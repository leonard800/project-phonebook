import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_CONTACT, GET_CONTACT_DETAIL, EDIT_PHONE_NUMBER } from './graphql';
import { css } from '@emotion/css';
import { useParams, useNavigate } from 'react-router-dom';

interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    phones: { number: string }[];
}

const containerStyle = css`
  background-color: #f5f5f5;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 400px;
  margin: 0 auto;
`;

const titleStyle = css`
  font-size: 24px;
  margin-bottom: 16px;
`;

const formStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const labelStyle = css`
  font-size: 18px;
`;

const inputStyle = css`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const buttonStyle = css`
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

const EditForm: React.FC = () => {
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [initialPhone, setInitialPhone] = useState<{ number: string }[]>([]);
    const [phoneNumbers, setPhoneNumbers] = useState<{ number: string }[]>([]);
    const [errorMsg, setErrorMsg] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { loading, error, data } = useQuery<{ contact_by_pk: Contact }>(GET_CONTACT_DETAIL, {
        variables: { id: Number(id) },
    });
    const [updateContact] = useMutation(UPDATE_CONTACT);
    const [editPhoneNumber] = useMutation(EDIT_PHONE_NUMBER);

    useEffect(() => {
        if (data) {
            const contacts = data.contact_by_pk;
            setFirstName(contacts.first_name);
            setLastName(contacts.last_name);
            setInitialPhone(contacts.phones);
            setPhoneNumbers(contacts.phones);
        }
    }, [data]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading contact list</div>;
    }

    const handlePhone = (e: string, i: number) => {
        setPhoneNumbers((prevPhoneNumbers) => {
            return prevPhoneNumbers.map((phone, index) => {
                if (index === i) {
                    return { ...phone, number: e };
                }
                return phone;
            });
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await updateContact({
                variables: {
                    id: Number(id),
                    _set: {
                        first_name: firstName,
                        last_name: lastName,
                    },
                },
            });

            for (let i = 0; i < phoneNumbers.length; i++) {
                await editPhoneNumber({
                    variables: {
                        pk_columns: {
                            number: initialPhone[i].number,
                            contact_id: Number(id),
                        },
                        new_phone_number: phoneNumbers[i].number,
                    },
                });
            }

            if (data && data.update_contact_by_pk) {
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
        <div className={containerStyle}>
            <h2 className={titleStyle}>Edit Contact</h2>
            {errorMsg === true ? (
                <div className={ErrorMessageStyle}>
                    Phone number already used
                </div>
            ) : <div />}
            <form className={formStyle} onSubmit={handleSubmit}>
                <label className={labelStyle}>
                    First Name:
                </label>
                <input
                    className={inputStyle}
                    type="text"
                    name="first_name"
                    value={firstName}
                    onInput={(e) => setFirstName(e.currentTarget.value)}
                    required
                    maxLength={15}
                />
                <label className={labelStyle}>
                    Last Name:
                </label>
                <input
                    className={inputStyle}
                    type="text"
                    name="last_name"
                    value={lastName}
                    onInput={(e) => setLastName(e.currentTarget.value)}
                    required
                    maxLength={15}
                />
                {phoneNumbers.map((item, index) => (
                    <div key={index}>
                        <label className={labelStyle}>
                            Phone:
                        </label>
                        <input
                            className={inputStyle}
                            type="text"
                            name="phones"
                            value={item.number}
                            onInput={(e) => handlePhone(e.currentTarget.value, index)}
                            required
                        />
                    </div>
                ))}
                <button className={buttonStyle} type="submit">Save</button>
            </form>
        </div>
    );
};

export default EditForm;
