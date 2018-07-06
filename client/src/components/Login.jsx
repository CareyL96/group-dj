import React from 'react';
import styled, { keyframes } from 'styled-components';

const redirect = () => {
  window.location = 'http://localhost:3006/login';
};

const LoginPage = styled.div`
  font-family: "Helvetica Neue";
  font-size: 16px;
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-image: url(welcome.jpg);
  background-size:cover;
  top:0px;
  left:0px;
  width:100%;
  height:100%;
  box-shadow: inset 0 0 0 1000px rgba(0,0,0,.5);
`;

const Wrapper = styled.div`
  display: table;
  text-align: center;
  table-layout: fixed;
  width: 100%;
  `;

const fadeIn = keyframes`{
  0% { opacity: 0; }
  100% { opacity: 1; }
}`;

const WelcomeMsg = styled.div`
  position: relative;
  display: block;
  vertical-align: middle;
  font-size: 4rem;
  font-weight: 700;
  color: white;
  animation-name: ${fadeIn};
  animation-duration: 1.5s; 
`;


const LoginButtonWrapper = styled.div`
  position: relative;
  display: block;
`;

const LoginButton = styled.button`
  background-color: transparent;
  border: 1.5px solid #fff;
  border-radius: 256px;
  color: #fff;
  display: block;
  font-size: 13px;
  letter-spacing: .03em;
  line-height: 1.25em;
  margin: 20px auto;
  max-width: 320px;
  height: 41px;
  overflow: hidden;
  padding: 2px 15px 0;
  text-align: center;
  text-transform: uppercase;
  width: 100%;
  animation-name: ${fadeIn};
  animation-duration: 1.5s; 
  &:hover { cursor: pointer; }
  &:focus { outline:0; }
`;


const Login = () => (
  <LoginPage>
    <Wrapper>
      <WelcomeMsg>Welcome to Group DJ</WelcomeMsg>
      <LoginButtonWrapper>
        <LoginButton onClick={redirect}> Log in with Spotify </LoginButton>
      </LoginButtonWrapper>
    </Wrapper>
  </LoginPage>
);

export default Login;