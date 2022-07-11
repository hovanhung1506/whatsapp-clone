import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import { auth } from '../config/firebase';
import { IMessage } from './../types/index';

const StyledMessage = styled.div`
  width: fit-content;
  word-break: break-all;
  max-width: 90%;
  min-width: 30%;
  padding: 15px 15px 30px;
  border-radius: 8px;
  margin: 10px;
  position: relative;
`;

const StyledSenderMessage = styled(StyledMessage)`
  margin-left: auto;
  background-color: #dcf8c6;
`;

const StyledReceiveMessage = styled(StyledMessage)`
  background-color: whitesmoke;
`;

const StyldeTimestamp = styled.div`
  color: gray;
  padding: 10px;
  font-size: x-small;
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: right;
`;

const Message = ({ message }: { message: IMessage }) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  const MessageType = loggedInUser?.email === message.user ? StyledSenderMessage : StyledReceiveMessage;

  return (
    <MessageType>
      {message.text}
      <StyldeTimestamp>{message.sent_at}</StyldeTimestamp>
    </MessageType>
  );
};

export default Message;
