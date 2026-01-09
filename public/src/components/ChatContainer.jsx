import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ socket, currentUser }) {
    const [messages, setMessages] = useState([]);
    const scrollRef = useRef();
    const [arrivalMessage, setArrivalMessage] = useState(null);

    // Load existing messages once currentUser is known
    useEffect(() => {
        if (!currentUser) return;

        const fetchMessages = async () => {
            const response = await axios.get(recieveMessageRoute);
            // response.data: [{ from, originalText, translatedText, createdAt }, ...]
            const mapped = response.data.map((m) => ({
                ...m,
                fromSelf: m.from === currentUser.id,
            }));
            setMessages(mapped);
        };

        fetchMessages();
    }, [currentUser]);

    const handleSendMsg = async (msg) => {
        if (!currentUser) return;

        // Emit over socket (server should broadcast the saved message object)
        socket.current.emit("send-msg", {
            from: currentUser.id, // "ken" or "julie"
            originalText: msg,
        });

        // Persist via HTTP – matches controller: { from, originalText }
        const { data } = await axios.post(sendMessageRoute, {
            from: currentUser.id,
            originalText: msg,
        });

        // data.message is the saved doc with translatedText etc.
        const saved = data.message;

        setMessages((prev) => [
            ...prev,
            {
                fromSelf: true,
                from: saved.from,
                originalText: saved.originalText,
                translatedText: saved.translatedText,
                createdAt: saved.createdAt,
            },
        ]);
    };

    // Listen for messages from socket
    useEffect(() => {
        if (!socket.current) return;

        const handler = (msg) => {
            // msg expected: { from, originalText, translatedText, createdAt }
            setArrivalMessage({
                fromSelf: msg.from === currentUser?.id,
                from: msg.from,
                originalText: msg.originalText,
                translatedText: msg.translatedText,
                createdAt: msg.createdAt,
            });
        };

        socket.current.on("msg-recieve", handler);

        return () => {
            socket.current.off("msg-recieve", handler);
        };
    }, [currentUser, socket]);

    // Merge newly arrived message into list
    useEffect(() => {
        if (arrivalMessage) {
            setMessages((prev) => [...prev, arrivalMessage]);
        }
    }, [arrivalMessage]);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <Container>
            {/* <div className="chat-header"></div> */}
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div ref={scrollRef} key={index}>
                        <div className={`message ${message.fromSelf ? "sended" : "recieved"}`}>
                            <div className="content">
                                <p>{message.translatedText}</p>
                                <small style={{ opacity: 0.7 }}>{message.originalText}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <ChatInput handleSendMsg={handleSendMsg} />
        </Container>
    );
}

const Container = styled.div`
    display: grid;
    width: 100%;
    // background: red;
    grid-template-rows: 80% 20%;
    gap: 0.1rem;
    overflow: hidden;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
        grid-template-rows: 15% 70% 15%;
    }
    .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2rem;
        .user-details {
            display: flex;
            align-items: center;
            gap: 1rem;
            .username {
                h3 {
                    color: white;
                }
            }
        }
    }
    .chat-messages {
        padding: 1rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        overflow: auto;
        &::-webkit-scrollbar {
            width: 0.2rem;
            &-thumb {
                background-color: #ffffff39;
                width: 0.1rem;
                border-radius: 1rem;
            }
        }
        .message {
            display: flex;
            align-items: center;
            .content {
                max-width: 40%;
                overflow-wrap: break-word;
                padding: 1rem;
                font-size: 1.1rem;
                border-radius: 1rem;
                color: #d1d1d1;
                @media screen and (min-width: 720px) and (max-width: 1080px) {
                    max-width: 70%;
                }
            }
        }
        .sended {
            justify-content: flex-end;
            .content {
                background-color: #4f04ff21;
            }
        }
        .recieved {
            justify-content: flex-start;
            .content {
                background-color: #9900ff20;
            }
        }
    }
`;
