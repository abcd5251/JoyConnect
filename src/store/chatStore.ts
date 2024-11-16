import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PushAPI } from '@pushprotocol/restapi';

interface ChatStore {
  chats: any[];
  setChats: (chats: any[]) => void;
  pushChatInstance: PushAPI | null;
  setPushChatInstance: (instance: PushAPI | null) => void;
  chatId: string;
  setChatId: (id: string) => void;
  toWalletAddress: string;
  setToWalletAddress: (address: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      chats: [],
      setChats: (chats) => set({ chats }),
      pushChatInstance: null,
      setPushChatInstance: (instance) => set({ pushChatInstance: instance }),
      chatId: '',
      setChatId: (id) => set({ chatId: id }),
      toWalletAddress: '',
      setToWalletAddress: (address) => set({ toWalletAddress: address }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chats: state.chats,
        chatId: state.chatId,
        toWalletAddress: state.toWalletAddress,
      }),
    }
  )
); 