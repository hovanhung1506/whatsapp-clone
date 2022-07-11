import styled from 'styled-components';
import Image from 'next/image';
import WhatsAppLogo from '../assets/whatsapplogo.png';
import CircularProgress from '@mui/material/CircularProgress';

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
`;
const StyledImageWrapper = styled.div`
  margin-bottom: 50px;
`;

const Loading = () => {
  return (
    <StyledContainer>
      <StyledImageWrapper>
        <Image src={WhatsAppLogo} alt="Whatsapp Logo" height="200px" width="200px" />
      </StyledImageWrapper>
      <CircularProgress/>
    </StyledContainer>
  );
};

export default Loading;
