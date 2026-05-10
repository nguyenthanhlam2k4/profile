import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

// Projects
export const getProjects = async () => {
  const projectsCol = collection(db, 'projects');
  const q = query(projectsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  const skillsCol = collection(db, 'skills');
  const snapshot = await getDocs(skillsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  const profileDoc = await getDoc(doc(db, 'profile', 'main'));
  if (profileDoc.exists()) {
    return profileDoc.data();
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
  const messagesCol = collection(db, 'messages');
  const q = query(messagesCol, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Socials
export const getSocials = async () => {
  const socialsCol = collection(db, 'socials');
  const snapshot = await getDocs(socialsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

// Stats & Views
export const incrementViews = async () => {
  const statsRef = doc(db, 'stats', 'views');
  try {
    const statsSnap = await getDoc(statsRef);
    if (!statsSnap.exists()) {
      await setDoc(statsRef, { count: 1 });
    } else {
      await updateDoc(statsRef, {
        count: increment(1)
      });
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

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
      messages: messages.length
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return null;
  }
};
