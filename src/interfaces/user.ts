export default interface User {
  userId: string,
  facebookUserId: string|null,
  email: string,
  firstName: string,
  lastName: string,
  profilePictureUrl: string|null,
};
