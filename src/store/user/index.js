// types
const STORE_USER = 'STORE_USER';

// actions
export function storeUser (user) {
  return {
    type: STORE_USER,
    user
  }
}

// selectors
export const getUser = state => state.user;
export const getUserId = state => getUser(state).id;

// reducers
export default (state = {}, action) => {
  const {type, user} = action;
  switch (type) {
    case STORE_USER:
      return {
        ...user
      }
    default:
      return state;
  }
}
