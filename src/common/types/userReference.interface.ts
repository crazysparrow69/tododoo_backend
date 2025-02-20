export interface UserReference {
  _id: string;
  username: string;
  avatar?: string;
  avatarEffect?: {
    _id: string;
    preview: string;
    animated: string;
  }
}
