"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type NotificationState = {
  friendRequests: number;
  receivedTrips: number;
  profileIncomplete: boolean;
};

type NotificationContextType = {
  notifications: NotificationState;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationState>>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationState>({
    friendRequests: 0,
    receivedTrips: 0,
    profileIncomplete: false
  });

  const prevNotifs = useRef<NotificationState>({ friendRequests: 0, receivedTrips: 0, profileIncomplete: false });

  // Handle toast triggers when notifications increase
  useEffect(() => {
    if (notifications.friendRequests > prevNotifs.current.friendRequests) {
      alert("New friend request received!");
    }
    if (notifications.receivedTrips > prevNotifs.current.receivedTrips) {
      alert("New trip shared with you!");
    }
    prevNotifs.current = notifications;
  }, [notifications]);

  useEffect(() => {
    if (!user) {
      setNotifications({ friendRequests: 0, receivedTrips: 0, profileIncomplete: false });
      return;
    }

    const uid = user.uid;

    // Real-time listener for Friend Requests
    const qFriendRequests = query(
      collection(db, "friendRequests"),
      where("toUserId", "==", uid),
      where("status", "==", "pending")
    );
    const unsubscribeFriendRequests = onSnapshot(qFriendRequests, (snap) => {
      setNotifications((prev) => ({ ...prev, friendRequests: snap.size }));
    });

    // Real-time listener for Received Trips
    const qReceivedTrips = query(
      collection(db, "receivedTrips"),
      where("toUserId", "==", uid)
    );
    const unsubscribeReceivedTrips = onSnapshot(qReceivedTrips, (snap) => {
      setNotifications((prev) => ({ ...prev, receivedTrips: snap.size }));
    });

    // Fetch Profile Completion Status Once
    const checkProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const profileIncomplete = !userData?.dob || !userData?.username || !userData?.name;
          setNotifications((prev) => ({ ...prev, profileIncomplete }));
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };
    checkProfile();

    return () => {
      unsubscribeFriendRequests();
      unsubscribeReceivedTrips();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
};
