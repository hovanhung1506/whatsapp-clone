import ChatIcon from '@mui/icons-material/Chat';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVerticalIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { signOut } from 'firebase/auth';
import styled from 'styled-components';
import { auth, db } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState } from 'react';
import * as EmailValidator from 'email-validator';
import { addDoc, collection, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Conversation } from '../types';
import ConversationSelect from './ConversationSelect';

const StyledContainer = styled.div`
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: auto;
  border-right: 1px solid whitesmoke;
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
`;

const StyledSearch = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
`;

const StyledUserAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const StyledSearchInput = styled.input`
  outline: none;
  border: none;
  flex: 1;
`;

const StyledSideBarButton = styled(Button)`
  width: 100%;
  border-top: 1px solid whitesmoke;
  border-bottom: 1px solid whitesmoke;
  font-weight: 600;
`;

const SideBar = () => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  const [isOpenNewConversationDiaLog, setIsOpenNewConversationDiaLog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const toggleNewConversationDialog = (isOpen: boolean) => {
    setIsOpenNewConversationDiaLog(isOpen);
    if (!isOpen) {
      setRecipientEmail('');
    }
  };
  const closeNewConversationDialog = () => {
    toggleNewConversationDialog(false);
  };
  const queryGetConversationsForCurrentUser = query(
    collection(db, 'conversations'),
    where('users', 'array-contains', loggedInUser?.email)
  );
  const [conversationsSnapshot, __loading, __error] = useCollection(queryGetConversationsForCurrentUser);
  const isConversationAlreadyExists = (email: string) => {
    return conversationsSnapshot?.docs.find((conversation) =>
      (conversation.data() as Conversation).users.includes(email)
    );
  };
  const isInvitingSelf = loggedInUser?.email === recipientEmail;
  const createConversation = async () => {
    if (!recipientEmail) return;
    if (
      EmailValidator.validate(recipientEmail) &&
      !isInvitingSelf &&
      !isConversationAlreadyExists(recipientEmail)
    ) {
      await addDoc(collection(db, 'conversations'), {
        users: [loggedInUser?.email, recipientEmail],
      });
    }
    closeNewConversationDialog();
  };
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <StyledContainer>
      <StyledHeader>
        <Tooltip title={loggedInUser?.email as string} placement="right">
          <StyledUserAvatar src={loggedInUser?.photoURL || ''} />
        </Tooltip>
        <div>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVerticalIcon />
          </IconButton>
          <IconButton onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </div>
      </StyledHeader>

      <StyledSearch>
        <SearchIcon />
        <StyledSearchInput placeholder="Search in conversations" />
      </StyledSearch>

      <StyledSideBarButton onClick={() => toggleNewConversationDialog(true)}>
        Start a new converstation
      </StyledSideBarButton>

      {conversationsSnapshot?.docs.map(conversation => <ConversationSelect key={conversation.id} id={conversation.id} conversationUser={(conversation.data() as Conversation).users}/>)}

      <Dialog open={isOpenNewConversationDiaLog} onClose={() => toggleNewConversationDialog(false)}>
        <DialogTitle>New converstation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a Google email address for the user you wish to chat with
          </DialogContentText>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewConversationDialog}>Cancel</Button>
          <Button disabled={!recipientEmail} onClick={createConversation}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default SideBar;
