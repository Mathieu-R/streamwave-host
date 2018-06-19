import decode from 'jwt-decode';

const authenticated = storeUser => {
  const token = localStorage.getItem('streamwave-token');
  if (!token) return false;

  const decoded = decode(token);
  storeUser(decoded);
  return expiredToken(decoded);
}

const expiredToken = decodedToken => {
  const current = new Date().getTime() / 1000;
  return (current < decodedToken.exp);
}

export default authenticated;
