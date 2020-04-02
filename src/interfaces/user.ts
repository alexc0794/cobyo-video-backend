export default interface User {
  user_id: string,
  facebook_user_id: string|null,
  email: string,
  first_name: string,
  last_name: string,
  profile_picture_url: string|null,
};
