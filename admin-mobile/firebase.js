import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  setDoc, 
  increment, 
  where, 
  writeBatch, 
  onSnapshot 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Direct Firebase Credentials from .env
const firebaseConfig = {
  apiKey: "AIzaSyBH30uG0Et0mA0FBbXYt5mW5lv1v6XXrSQ",
  authDomain: "thanhlam-profile.firebaseapp.com",
  projectId: "thanhlam-profile",
  storageBucket: "thanhlam-profile.firebasestorage.app",
  messagingSenderId: "132083231647",
  appId: "1:132083231647:web:3fa75310327fd525a2abaa",
  measurementId: "G-5F4NQS688Z"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// --- FIRESTORE CRUD METHODS ---

// Projects
export const getProjects = async () => {
  try {
    const projectsCol = collection(db, 'projects');
    const q = query(projectsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const addProject = async (projectData) => {
  return await addDoc(collection(db, 'projects'), {
    ...projectData,
    createdAt: new Date()
  });
};

export const updateProject = async (id, projectData) => {
  const projectRef = doc(db, 'projects', id);
  return await updateDoc(projectRef, {
    ...projectData,
    updatedAt: new Date()
  });
};

export const deleteProject = async (id) => {
  const projectRef = doc(db, 'projects', id);
  return await deleteDoc(projectRef);
};

// Skills
export const getSkills = async () => {
  try {
    const skillsCol = collection(db, 'skills');
    const snapshot = await getDocs(skillsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
};

export const addSkill = async (skillData) => {
  return await addDoc(collection(db, 'skills'), skillData);
};

export const updateSkill = async (id, skillData) => {
  const skillRef = doc(db, 'skills', id);
  return await updateDoc(skillRef, skillData);
};

export const deleteSkill = async (id) => {
  const skillRef = doc(db, 'skills', id);
  return await deleteDoc(skillRef);
};

// Profile
export const getProfile = async () => {
  try {
    const profileDoc = await getDoc(doc(db, 'profile', 'main'));
    if (profileDoc.exists()) {
      return profileDoc.data();
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
  return null;
};

export const updateProfile = async (profileData) => {
  const profileRef = doc(db, 'profile', 'main');
  const profileDoc = await getDoc(profileRef);
  
  if (profileDoc.exists()) {
    return await updateDoc(profileRef, {
      ...profileData,
      updatedAt: new Date()
    });
  } else {
    return await setDoc(profileRef, {
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

// Messages
export const getMessages = async () => {
  try {
    const messagesCol = collection(db, 'messages');
    const q = query(messagesCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const subscribeMessages = (callback, onError) => {
  const messagesCol = collection(db, 'messages');
  const q = query(messagesCol, orderBy('date', 'desc'));
  return onSnapshot(q, 
    (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const deleteMessage = async (id) => {
  const messageRef = doc(db, 'messages', id);
  return await deleteDoc(messageRef);
};

// Socials
export const getSocials = async () => {
  try {
    const socialsCol = collection(db, 'socials');
    const snapshot = await getDocs(socialsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching socials:', error);
    return [];
  }
};

export const addSocial = async (socialData) => {
  return await addDoc(collection(db, 'socials'), socialData);
};

export const updateSocial = async (id, socialData) => {
  const socialRef = doc(db, 'socials', id);
  return await updateDoc(socialRef, socialData);
};

export const deleteSocial = async (id) => {
  const socialRef = doc(db, 'socials', id);
  return await deleteDoc(socialRef);
};

// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const [projects, skills, viewsSnap, messages] = await Promise.all([
      getProjects(),
      getSkills(),
      getDoc(doc(db, 'stats', 'views')),
      getMessages()
    ]);

    return {
      totalProjects: projects.length,
      totalSkills: skills.length,
      profileViews: viewsSnap.exists() ? viewsSnap.data().count : 0,
      messagesCount: messages.length
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalProjects: 0,
      totalSkills: 0,
      profileViews: 0,
      messagesCount: 0
    };
  }
};

// Gallery
export const getGallery = async () => {
  try {
    const galleryCol = collection(db, 'gallery');
    const q = query(galleryCol, orderBy('postedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }
};

export const addGalleryItem = async (data) => {
  return await addDoc(collection(db, 'gallery'), {
    ...data,
    postedAt: new Date().toISOString()
  });
};

export const subscribeGallery = (callback, onError) => {
  const galleryCol = collection(db, 'gallery');
  const q = query(galleryCol, orderBy('postedAt', 'desc'));
  return onSnapshot(q,
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(items);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const updateGalleryItem = async (id, data) => {
  const ref = doc(db, 'gallery', id);
  return await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const deleteGalleryItem = async (id) => {
  const ref = doc(db, 'gallery', id);
  return await deleteDoc(ref);
};

export const setHomeGalleryImage = async (id) => {
  const galleryCol = collection(db, 'gallery');
  const q = query(galleryCol, where('isHome', '==', true));
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(docSnap => {
    batch.update(docSnap.ref, { isHome: false });
  });
  
  const targetRef = doc(db, 'gallery', id);
  batch.update(targetRef, { isHome: true });
  
  return await batch.commit();
};
