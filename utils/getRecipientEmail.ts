import { User } from 'firebase/auth';
import { Conversation } from './../types/index';

export const getRecipientEmail = (conversationUser: Conversation['users'], loggedInUser?: User | null) =>
  conversationUser.find((userEmail) => userEmail !== loggedInUser?.email);
