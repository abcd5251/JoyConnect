"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import TinderCard from "react-tinder-card";
import Image from "next/image";
import circle_icon from "@/assets/circle.svg";
import cross_icon from "@/assets/cross.svg";
import leader_board_img from "@/assets/leaderBoard.jpg";
import { Leaderboard } from "./leaderboard";
import { useChatStore } from "@/store/chatStore";

const db = [
  {
    name: "@Jack870731",
    url: "./4.gif",
  },
  {
    name: "@Lily711201",
    url: "./5.gif",
  },
  {
    name: "@Rose851021",
    url: "./6.gif",
  },
];

function Advanced() {
  const [currentIndex, setCurrentIndex] = useState<number>(db.length - 1);
  const [lastDirection, setLastDirection] = useState();
  // used for outOfFrame closure
  const currentIndexRef = useRef<number>(currentIndex);
  const [showLeaderBoard, setShowLeaderBoard] = useState<boolean>(false);

  const childRefs: any = useMemo(
    () =>
      Array(db.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  );

  const handleShowLeaderBoard = () => {
    setShowLeaderBoard(true);
  };
  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < db.length - 1;

  const canSwipe = currentIndex >= 0;

  // set last direction and decrease current index
  const swiped = (direction: any, nameToDelete: any, index: number) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  };

  const outOfFrame = (name: any, idx: number) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    // handle the case in which go back is pressed before card goes outOfFrame
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
    // TODO: when quickly swipe and restore multiple times the same card,
    // it happens multiple outOfFrame events are queued and the card disappear
    // during latest swipes. Only the last outOfFrame event should be considered valid
  };

  const swipe = async (dir: string) => {
    if (canSwipe && currentIndex < db.length) {
      await childRefs[currentIndex].current.swipe(dir); // Swipe the card!
    }
  };

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    await childRefs[newIndex].current.restoreCard();
  };

  const handleSwipe = (direction: string) => {
    swipe(direction);
  };

  // Get store values
  const chats = useChatStore((state) => state.chats);
  const pushChatInstance = useChatStore((state) => state.pushChatInstance);
  const chatId = useChatStore((state) => state.chatId);
  const toWalletAddress = useChatStore((state) => state.toWalletAddress);

  // Add function to fetch latest chats
  const fetchLatestChats = async () => {
    if (!pushChatInstance) return;

    try {
      const aliceChats = await pushChatInstance.chat.list("CHATS");
      console.log("aliceChats", aliceChats);
      useChatStore.getState().setChats(aliceChats);
    } catch (error) {
      console.error("Failed to fetch latest chats:", error);
    }
  };

  // Add useEffect to periodically update chats
  useEffect(() => {
    // Initial fetch
    fetchLatestChats();

    // Set up interval to fetch chats every 5 seconds
    const interval = setInterval(fetchLatestChats, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [pushChatInstance]);

  // Modify sendMessage function to immediately fetch new chats after sending
  const sendMessage = async (message: string) => {
    if (!pushChatInstance) return;

    try {
      if (chatId) {
        await pushChatInstance.chat.send(chatId, {
          content: message,
          type: "Text",
        });
      }

      if (toWalletAddress) {
        await pushChatInstance.chat.send(toWalletAddress, {
          content: message,
          type: "Text",
        });
      }

      // Immediately fetch latest chats after sending
      await fetchLatestChats();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="w-full h-[80%] flex flex-col justify-center items-center">
      {!showLeaderBoard && (
        <>
          <div className="cardContainer mx-auto">
            {currentIndex >= 0 ? (
              db.map((character, index) => (
                <TinderCard
                  ref={childRefs[index]}
                  className="swipe"
                  key={character.name}
                  onSwipe={(dir) => swiped(dir, character.name, index)}
                  onCardLeftScreen={() => outOfFrame(character.name, index)}
                >
                  <div className="card p-4">
                    <div className="h-[220px] overflow-hidden">
                      <img
                        src={character.url}
                        alt={`Character ${character.name}`}
                        className="w-full mb-5 w-[220px]"
                      />
                    </div>
                    <h3 className="text-black">{character.name}</h3>
                    <div className="flex justify-between px-5">
                      <Image
                        src={cross_icon}
                        alt="dislike"
                        width={50}
                        height={50}
                        onClick={() => handleSwipe("left")}
                      />
                      <Image
                        src={circle_icon}
                        alt="like"
                        width={50}
                        height={50}
                        onClick={() => handleSwipe("right")}
                      />
                    </div>
                  </div>
                </TinderCard>
              ))
            ) : (
              <div className="w-full h-[300px] flex flex-col justify-center items-center">
                <h3 className="text-white text-center text-2xl block">
                  No more videos
                </h3>
              </div>
            )}
          </div>
          <div className="w-[90%]">
            <div className="buttons mt-16 justify-between w-full">
              <button
                style={{ backgroundColor: !canSwipe ? "#c3c4d3" : "#58FFA3" }}
                onClick={() => swipe("left")}
                className="text-black w-1/2"
              >
                Dislike
              </button>
              <button
                style={{ backgroundColor: !canSwipe ? "#c3c4d3" : "#58FFA3" }}
                onClick={() => swipe("right")}
                className="text-black w-1/2"
              >
                Like
              </button>
            </div>

            <div className="text-white w-full mt-4 p-4">
              <h3 className="text-xl mb-4">Chat Messages</h3>
              <div className="chat-container bg-gray-800 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                {chats.map((chat: any, index: number) => (
                  <div key={index} className="mb-2 p-2 bg-gray-700 rounded">
                    {chat.msg?.messageObj?.content ? (
                      // For messages with messageObj structure
                      <p className="text-sm text-gray-300">
                        {chat.msg.messageObj.content}
                      </p>
                    ) : chat.msg?.messageContent ? (
                      // For messages with direct messageContent
                      <p className="text-sm text-gray-300">
                        {chat.msg.messageContent}
                      </p>
                    ) : (
                      // Fallback for empty messages
                      <p className="text-sm text-gray-400">Empty message</p>
                    )}
                    <small className="text-gray-400">
                      From: {chat.msg?.fromDID?.slice(0, 10) || "Unknown"}...
                    </small>
                  </div>
                ))}
                {(!chats || chats.length === 0) && (
                  <p className="text-gray-400">No messages yet</p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded bg-gray-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        sendMessage(target.value);
                        target.value = "";
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
          {currentIndex < 0 && (
            <button
              onClick={handleShowLeaderBoard}
              className="text-black bg-[#9198e5] seelastweekbutton w-full"
            >
              See last week&apos;s ranking
            </button>
          )}
        </>
      )}
      {showLeaderBoard && (
        <div className="flex justify-center items-center w-[90%] h-[100%]">
          <Leaderboard />
        </div>
      )}
    </div>
  );
}

export default Advanced;
