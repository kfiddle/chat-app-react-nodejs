import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Header from "../components/header/Header";

export default function Chat() {
    const socket = useRef();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (currentUser) {
            socket.current = io(host);
            socket.current.emit("add-user", currentUser.id);
        }
    }, [currentUser]);

    const handleUserChange = (user) => {
        setCurrentUser(user);
    };

    return (
        <>
            <Header onUserChange={handleUserChange} currentUser={currentUser} />
            <Container>
                <div className="container">
                    <ChatContainer currentUser={currentUser} socket={socket} />
                </div>
            </Container>
        </>
    );
}

const Container = styled.div`
    height: calc(100vh - 5rem); /* subtract header height */
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #131324;
    padding: 1rem 0;

    .container {
        height: 100%;
        width: 100%;
        max-width: 1400px; /* optional: constrain max width on large screens */
        background-color: #00000076;
        display: flex;
        flex-direction: column;
    }
`;
