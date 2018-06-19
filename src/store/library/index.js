// types
const STORE_LIBRARY = 'STORE_LIBRARY';

// actions
export function storeLibrary (albums) {
  return {
    type: STORE_LIBRARY,
    albums
  }
}

// selectors
export const getLibrary = state => state.library;

// reducers
export default (state = [], action) => {
  const {type, albums} = action;
  switch (type) {
    case STORE_LIBRARY:
      return [
        ...albums
      ]
    default:
      return state;
  }
}
