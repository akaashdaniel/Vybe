export const currentUser = { id: "u0", name: "You" };

export const conversations = [
  { id: "c1", name: "Priya Raman", avatarColor: "#e8121d", online: true, lastMessage: "Sent the deck, take a look when you can", lastTime: "9:41", unread: 2 },
  { id: "c2", name: "Design Team", avatarColor: "#7a0e14", online: false, lastMessage: "Arjun: pushed the new tokens", lastTime: "9:12", unread: 0 },
  { id: "c3", name: "Karthik S", avatarColor: "#ff3b3b", online: true, lastMessage: "Sounds good, see you then", lastTime: "Yesterday", unread: 0 },
  { id: "c4", name: "Mom", avatarColor: "#c2185b", online: false, lastMessage: "Call me when you're free", lastTime: "Yesterday", unread: 1 },
  { id: "c5", name: "TNSCST Grant Group", avatarColor: "#8a7b7d", online: false, lastMessage: "You: Uploaded the revised proposal", lastTime: "Mon", unread: 0 },
];

export const messagesByConversation = {
  c1: [
    { id: "m1", from: "them", text: "Hey! Did you get a chance to review the deck?", time: "9:38", status: "read" },
    { id: "m2", from: "me", text: "Just opened it, looks great so far", time: "9:39", status: "read" },
    { id: "m3", from: "them", text: "Sent the deck, take a look when you can", time: "9:41", status: "delivered" },
  ],
  c2: [{ id: "m1", from: "them", text: "Arjun: pushed the new tokens", time: "9:12", status: "read" }],
  c3: [
    { id: "m1", from: "me", text: "We still on for tomorrow?", time: "8:02", status: "read" },
    { id: "m2", from: "them", text: "Sounds good, see you then", time: "8:05", status: "read" },
  ],
  c4: [{ id: "m1", from: "them", text: "Call me when you're free", time: "7:20", status: "delivered" }],
  c5: [{ id: "m1", from: "me", text: "Uploaded the revised proposal", time: "Mon", status: "read" }],
};