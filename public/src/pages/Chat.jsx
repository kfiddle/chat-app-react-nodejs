import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
// import Contacts from "../components/Contacts";
// import Welcome from "../components/Welcome";
import Header from "../components/header/Header";

export default function Chat() {
    // const navigate = useNavigate();
    const socket = useRef();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (currentUser) {
            socket.current = io(host);
            socket.current.emit("add-user", currentUser.id); // "ken" or "julie"
        }
    }, [currentUser]);

    const handleUserChange = (user) => {
        setCurrentUser(user);
    };

    // const handleChatChange = (chat) => {
    //     setCurrentChat(chat);
    // };

    return (
        <>
            <Header onUserChange={handleUserChange} />
            <Container>
                <div className="container">
                    {/* <Contacts contacts={contacts} changeChat={handleChatChange} /> */}
                    {/* {currentChat === undefined ? <Welcome /> : <ChatContainer currentChat={currentChat} socket={socket} />} */}
                    <ChatContainer currentUser={currentUser} socket={socket}/>
                </div>
            </Container>
        </>
    );
}

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    align-items: center;
    background-color: #131324;
    // background-color: red;
    .container {
        height: 85vh;
        width: 85vw;
        background-color: #00000076;
        display: grid;
        grid-template-columns: 25% 75%;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
            grid-template-columns: 35% 65%;
        }
    }
`;
