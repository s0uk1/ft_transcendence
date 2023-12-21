'use strict';
'use client';
import { useAppSelector } from "@/app/globalRedux/store";
import { Button, ScrollShadow, User, useDisclosure } from "@nextui-org/react";




// import ChatInput from "./components/chatInput";
import SocketManager from "@/app/utils/socketManager";
import { getCookie } from "cookies-next";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import ChatInput from "./components/chatInput";
import { formatMessageDate } from "./components/conversation";
import RoomOptions from "./components/roomSettings";



const sent = <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#fff" d="M5.808 16.923q-.213 0-.357-.144q-.143-.144-.143-.357q0-.212.143-.356q.144-.143.357-.143h5.788l-7.55-7.55q-.14-.14-.153-.349t.152-.36q.139-.139.354-.139q.214 0 .355.14L12 14.905l5.046-5.045q-.12-.283-.179-.52q-.06-.238-.06-.439q0-.766.53-1.295t1.294-.53q.765 0 1.298.53q.533.528.533 1.294t-.531 1.298q-.53.533-1.299.533q-.165 0-.377-.047q-.213-.047-.47-.16l-5.381 5.4h5.788q.213 0 .357.143t.143.357q0 .213-.143.356q-.144.143-.357.143H5.808Z" />
</svg>

export function Mymessage({ message }: any) {
    return (
        <div className="flex flex-row justify-end">

            <div className="bg-[#252341] rounded-lg p-2 m-2 min-w-[10%]  max-w-[80%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[40%]">
                {/* <h3 className="text-cyan-500">{message?.user?.username}</h3> */}
                <p className="text-white text-xs sm:text-sm">{message?.content}</p>

                <div className="flex flex-row justify-between">
                    <p className="text-[#999] text-xs sm:text-sm">{formatMessageDate(message?.createdAt)}</p>
                    {message?.status === "pending" ? (
                        <div className="flex  justify-end mx-3">
                            <l-miyagi
                                size="18"
                                stroke="3.5"
                                speed="0.9"
                                color="white"
                            ></l-miyagi>
                        </div>
                    ) : (
                        <div className="mx-2">{sent}</div>
                    )}
                </div>
            </div>
            <img
                src={message?.user?.profile?.avatar ? message?.user?.profile?.avatar : "/defaultAvatar.png"}
                alt="User Avatar"
                className="w-8 h-8 mt-4 rounded-full"
            />
        </div>
    );
}





export function OtherMessage({ message }: any) {

    return (
        <div className="flex p-3 flex-row justify-start">

            <img src={message?.user?.profile?.avatar ? message?.user?.profile?.avatar : "/defaultAvatar.png"} alt="User Avatar" className="w-8 h-8 mt-4 rounded-full" />

            <div className="bg-[#2F296E] rounded-lg p-2 m-2 max-w-[80%] min-w-[10%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[40%]">
                <p className={`text-sm text-cyan-300`}>{message?.user?.username}</p>
                <p className="text-white text-xs sm:text-sm">{message?.content} </p>
                <p className="text-[#999] text-xs sm:text-sm" > {formatMessageDate(message?.createdAt)}</p>
            </div>
        </div>
    );
}



export function InformationMessage({ message }: any) {
    return (
        <div className="flex flex-row justify-center">
            <div className="bg-[#252341]/40  rounded-lg p-2 m-2 max-w-[80%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[40%]">

                <div className="flex w-full flex-row justify-between">
                    <svg className="mx-2" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <g fill="" stroke="white" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <path stroke-linecap="round" d="M12 7h.01" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 11h2v5m-2 0h4" />
                        </g>
                    </svg>
                    <p className="text-white text-xs sm:text-sm">{message?.content}</p>

                </div>
            </div>
        </div>
    )
}



export default function Chat() {

    const activeConversationId = useAppSelector(state => state?.chatReducer?.activeConversationId);
    const activeConversation = useAppSelector(state => state?.chatReducer?.rooms?.find((room: any) => room?.id === activeConversationId));
    const me = useAppSelector(state => state?.authReducer?.value?.user);
    let messages = activeConversation?.room?.messages;
    const conversations = useAppSelector(state => state?.chatReducer?.rooms);
    const dispatch = useDispatch();
    const token = getCookie("token");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const socketManager = SocketManager.getInstance("http://localhost:3000", token);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    useLayoutEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    };


    useEffect(() => {
    }, [conversations, dispatch, socketManager, activeConversation]);
    console.log(activeConversation);
    return (
        <div className="bg-[#151424] h-full  p-2 ">
            <div className="">

                <>
                    <ScrollShadow hideScrollBar className=" h-[75vh]">
                        {

                            activeConversation === undefined ? (
                                <>
                                    <img src="/empty_chat.svg" alt="hero" className="w-full h-full m- rounded-full" />
                                </>

                            ) : (

                                <>

                                    <div className=" flex justify-center   sticky top-0">
                                        <div className="lg:w-1/3 md:2/3 bg-[#1B1A2D] sm:w-full  rounded-b-full hover:bg-[#252341] flex justify-center ">
                                            <Button onPress={onOpen} >
                                                <User
                                                    className="text-white my-2 p-4"
                                                    name={activeConversation?.room?.roomType !== "DM" ? activeConversation?.room?.name : activeConversation?.room?.members[0]?.user?.username}
                                                    avatarProps={
                                                        activeConversation?.room?.roomType !== "DM"
                                                            ?
                                                            { src: "/groups.svg" }
                                                            :
                                                            { src: activeConversation?.room?.members[0]?.user?.profile?.avatar ?? "/defaultAvatar.png" }
                                                    }
                                                />
                                            </Button>
                                            <RoomOptions isOpen={isOpen} onOpenChange={onOpenChange} />
                                        </div>
                                    </div>

                                    {

                                        (messages ?? []).map((message: any) => (
                                            // message?.user?.id === me?.id ? (

                                            //     <Mymessage message={message} />
                                            // ) : (

                                            //     <OtherMessage message={message} />
                                            // )
                                            message?.user === null ? (
                                                <InformationMessage message={message} />
                                            ) : (
                                                message?.user?.id === me?.id ? (

                                                    <Mymessage message={message} />
                                                ) : (

                                                    <OtherMessage message={message} />
                                                )
                                            )
                                        ))
                                    }

                                </>
                            )

                        }

                        <div ref={messagesEndRef} />
                    </ScrollShadow>

                </>
                {
                    activeConversation === undefined ? (
                        <></>
                    ) : (
                        <div className="w-2/3">
                            <ChatInput />
                        </div>
                    )
                }
            </div>
        </div>
    )
}




