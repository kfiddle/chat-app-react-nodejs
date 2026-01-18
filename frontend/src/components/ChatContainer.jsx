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

        // Persist via HTTP – get translation back
        const { data } = await axios.post(sendMessageRoute, {
            from: currentUser.id,
            originalText: msg,
        });

        const saved = data.message;

        // Emit the FULL saved message (including translatedText) over socket
        socket.current.emit("send-msg", {
            from: saved.from,
            originalText: saved.originalText,
            translatedText: saved.translatedText,
            createdAt: saved.createdAt,
        });

        // Add to local state
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

    // Helper to get the text to display based on current user
    const getDisplayText = (message) => {
        // If this is your own message, show what you wrote (originalText)
        // If it's the other person's message, show the translation (translatedText)
        return message.fromSelf ? message.originalText : message.translatedText;
    };

    return (
        <Container>
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div ref={scrollRef} key={index}>
                        <div className={`message ${message.fromSelf ? "sended" : "recieved"}`}>
                            <div className="content">
                                <p>{getDisplayText(message)}</p>
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
    grid-template-rows: 1fr auto;
    width: 100%;
    height: 100%;
    gap: 0.1rem;
    overflow: hidden;

    .chat-messages {
        padding: 1rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;

        &::-webkit-scrollbar {
            width: 0.2rem;
        }

        &::-webkit-scrollbar-thumb {
            background-color: #ffffff39;
            border-radius: 1rem;
        }

        .message {
            display: flex;
            align-items: center;
            width: 100%;

            .content {
                max-width: 60%;
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
