import AttachFileIcon from '@mui/icons-material/AttachFile';
import HomeIcon from '@mui/icons-material/Home';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import MicIcon from '@mui/icons-material/Mic';
import MorevertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { KeyboardEventHandler, MouseEventHandler, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import styled from 'styled-components';
import { auth, db } from '../config/firebase';
import { useRecipient } from './../hooks/useRecipient';
import { Conversation, IMessage } from './../types/index';
import {
  convertFirestoreTimestampToString,
  generatorQueryGetMessages,
  transformMessage
} from './../utils/getMessagesInConversation';
import Message from './Message';
import RecipientAvatar from './RecipientAvatar';

const StyledRecipientHeader = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  align-items: center;
  padding: 11px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;

const StyledHeaderInfo = styled.div`
  flex-grow: 1;
  > h3 {
    margin-bottom: 3px;
    margin-top: 0;
  }
  > span {
    font-size: 14px;
    color: gray;
  }
`;

const StyledH3 = styled.h3`
  word-break: break-all;
`;

const StyledHeaderIcons = styled.div`
  display: flex;
`;

const StyledMessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;

const StyledInputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;

const StyledInput = styled.input`
  flex-grow: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 15px;
  margin-left: 15px;
  margin-right: 15px;
`;

const EndOfMessagesForAutoScroll = styled.div`
  margin-bottom: 30px;
`

const ConversationScreen = ({
  conversation,
  messages,
}: {
  conversation: Conversation;
  messages: IMessage[];
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  const conversationUsers = conversation.users;
  const { recipientEmail, recipient } = useRecipient(conversationUsers);
  const router = useRouter();
  const conversationId = router.query.id;
  const queryGetMessages = generatorQueryGetMessages(conversationId as string);
  const [messagesSnapshot, messagesLoading, __error] = useCollection(queryGetMessages);
  const showMessages = () => {
    if (messagesLoading) return messages.map((message) => <Message key={message.id} message={message} />);
    if (messagesSnapshot)
      return messagesSnapshot.docs.map((message) => (
        <Message key={message.id} message={transformMessage(message)} />
      ));
    return null;
  };
  const addMessageToDbAndUpdateLastSeen = async () => {
    await setDoc(
      doc(db, 'users', loggedInUser?.email as string),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
    await addDoc(collection(db, 'messages'), {
      conversation_id: conversationId,
      sent_at: serverTimestamp(),
      text: newMessage,
      user: loggedInUser?.email,
    });
    setNewMessage('');
    scrollToBottom();
  };
  const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!newMessage) return;
      addMessageToDbAndUpdateLastSeen();
    }
  };
  const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (!newMessage) return;
    addMessageToDbAndUpdateLastSeen();
  };
  const endOfMessageRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    endOfMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
  return (
    <>
      <StyledRecipientHeader>
        <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail} />
        <StyledHeaderInfo>
          <StyledH3>{recipientEmail}</StyledH3>
          {recipient && <span>Last active: {convertFirestoreTimestampToString(recipient.lastSeen)}</span>}
        </StyledHeaderInfo>
        <StyledHeaderIcons>
          <IconButton onClick={() => router.push('/')}>
            <HomeIcon />
          </IconButton>
          <IconButton>
            <AttachFileIcon />
          </IconButton>
          <IconButton>
            <MorevertIcon />
          </IconButton>
        </StyledHeaderIcons>
      </StyledRecipientHeader>

      <StyledMessageContainer>{showMessages()}</StyledMessageContainer>

      <EndOfMessagesForAutoScroll ref={endOfMessageRef}/>

      <StyledInputContainer>
        <InsertEmoticonIcon />
        <StyledInput
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={sendMessageOnEnter}
        />
        <IconButton onClick={sendMessageOnClick} disabled={!newMessage}>
          <SendIcon />
        </IconButton>
        <IconButton>
          <MicIcon />
        </IconButton>
      </StyledInputContainer>
    </>
  );
};

export default ConversationScreen;
