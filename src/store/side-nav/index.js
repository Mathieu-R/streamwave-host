const SHOW_SIDE_NAV = 'SHOW_SIDE_NAV';
const HIDE_SIDE_NAV = 'HIDE_SIDE_NAV';

export function showSideNav () {
  return {
    type: SHOW_SIDE_NAV
  }
}

export function hideSideNav () {
  return {
    type: HIDE_SIDE_NAV
  }
}

export const getShowSideNav = state => state.sideNav.show;

export default (state = {}, action) => {
  switch (action.type) {
    case SHOW_SIDE_NAV:
      return {
        ...state,
        show: true
      }

    case HIDE_SIDE_NAV:
      return {
        ...state,
        show: false
      }

    default:
      return state;
  }
}
