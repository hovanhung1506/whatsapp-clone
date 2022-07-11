import { doc, getDoc, getDocs } from 'firebase/firestore';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import SideBar from '../../components/SideBar';
import { auth, db } from '../../config/firebase';
import { generatorQueryGetMessages, transformMessage } from '../../utils/getMessagesInConversation';
import ConversationScreen from './../../components/ConversationScreen';
import { Conversation, IMessage } from './../../types/index';
import { getRecipientEmail } from './../../utils/getRecipientEmail';

interface Props {
  conversation: Conversation;
  messages: IMessage[];
}

const StyledContainer = styled.div`
  display: flex;
`;

const StyledConversationContainer = styled.div`
  flex-grow: 1;
  overflow: auto;
  height: 100vh;
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const Conversation = ({ conversation, messages }: Props) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  return (
    <StyledContainer>
      <Head>
        <title>Conversation with {getRecipientEmail(conversation.users, loggedInUser)}</title>
      </Head>
      <SideBar />
      <StyledConversationContainer>
        <ConversationScreen conversation={conversation} messages={messages} />
      </StyledConversationContainer>
    </StyledContainer>
  );
};

export default Conversation;

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async (context) => {
  const conversationId = context.params?.id;
  const conversationRef = doc(db, 'conversations', conversationId as string);
  const conversationSnapshot = await getDoc(conversationRef);
  const queryMessages = generatorQueryGetMessages(conversationId);
  const messagesSnapshot = await getDocs(queryMessages);
  const messages = messagesSnapshot.docs.map((doc) => transformMessage(doc));
  return {
    props: {
      conversation: conversationSnapshot.data() as Conversation,
      messages,
    },
  };
};
