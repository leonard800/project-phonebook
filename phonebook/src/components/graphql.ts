import { gql } from '@apollo/client';

export const ADD_CONTACT = gql`
  mutation AddContact($input: ContactInput!) {
    addContact(input: $input) {
      id
      name
      phoneNumber1
      phoneNumber2
    }
  }
`;

export const ADD_CONTACT_WITH_PHONES = gql`
  mutation AddContactWithPhones(
    $first_name: String!
    $last_name: String!
    $phones: [phone_insert_input!]!
  ) {
    insert_contact(
      objects: {
        first_name: $first_name
        last_name: $last_name
        phones: {
          data: $phones
          on_conflict: {
            constraint: phone_number_key,
            update_columns: [number]
          }
        }
      }
    ) {
      returning {
        first_name
        last_name
        id
        phones {
          number
        }
      }
    }
  }
`;

export const GET_CONTACTS = gql`
  query GetContactList {
    contacts {
      created_at
      first_name
      last_name
      id
      phones{
        number
      }
    }
  }
`;

export const GET_CONTACT_LIST = gql`
  query GetContactList(
    $distinct_on: [contact_select_column!]
    $limit: Int
    $offset: Int
    $order_by: [contact_order_by!]
    $where: contact_bool_exp
  ) {
    contact(
      distinct_on: $distinct_on
      limit: $limit
      offset: $offset
      order_by: $order_by
      where: $where
    ) {
      created_at
      first_name
      id
      last_name
      phones {
        number
      }
    }
  }
`;

export const GET_CONTACT_DETAIL = gql`
  query GetContactDetail($id: Int!){
    contact_by_pk(id: $id) {
    last_name
    id
    first_name
    created_at
    phones {
      number
    }
  }
}`;

export const DELETE_CONTACT = gql`
  mutation MyMutation($id: Int!) {
    delete_contact_by_pk(id: $id) {
      first_name
      last_name
      id
    }
  }
`;

export const UPDATE_CONTACT = gql`
  mutation EditContactById($id: Int!, $_set: contact_set_input) {
    update_contact_by_pk(pk_columns: { id: $id }, _set: $_set) {
      id
      first_name
      last_name
      phones {
        number
      }
    }
  }
`;

export const EDIT_PHONE_NUMBER = gql`
  mutation EditPhoneNumber($pk_columns: phone_pk_columns_input!, $new_phone_number:String!) {
    update_phone_by_pk(pk_columns: $pk_columns, _set: {number: $new_phone_number}) {
      contact {
        id
        last_name
        first_name
        created_at
        phones {
          number
        }
      }
    }
  }
`;
