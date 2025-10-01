import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ id: 'user2', username: '@user2', followers: [] }); // Mock

  useEffect(() => {
    // Mock online status listener
    // const unsubscribeOnline = firebase.firestore()
    //   .collection('users')
    //   .doc(user.id)
    //   .onSnapshot(doc => {
    //     if (doc.exists) {
    //       setUser(prev => ({ ...prev, online: doc.data().online }));
    //     }
    //   });

    // return () => {
    //   unsubscribeOnline();
    //   firebase.firestore().collection('users').doc(user.id).update({ online: false });
    // };
  }, [user.id]);

  const setTyping = (challengeId, isTyping) => {
    // Mock: firebase.firestore().collection('challenges').doc(challengeId).update({
    //   [`typing.${user.id}`]: isTyping ? new Date().toISOString() : null
    // });
    console.log(`User ${user.id} ${isTyping ? 'started' : 'stopped'} typing in ${challengeId}`);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, setTyping }}>
      {children}
    </AuthContext.Provider>
  );
};
