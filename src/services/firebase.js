import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, setDoc, increment, where, writeBatch, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// Projects
export const getProjects = async () => {
  const projectsCol = collection(db, 'projects');
  const snapshot = await getDocs(projectsCol);
  const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return projects.sort((a, b) => {
    const orderA = a.order !== undefined ? Number(a.order) : Number.MAX_SAFE_INTEGER;
    const orderB = b.order !== undefined ? Number(b.order) : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    
    const dateA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
    const dateB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
    return dateB - dateA;
  });
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

export const updateProjectsOrder = async (orderedProjects) => {
  const batch = writeBatch(db);
  orderedProjects.forEach((proj, index) => {
    const ref = doc(db, 'projects', proj.id);
    batch.update(ref, { order: index });
  });
  return await batch.commit();
};

export const subscribeProjects = (callback, onError) => {
  const projectsCol = collection(db, 'projects');
  return onSnapshot(projectsCol, 
    (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = projects.sort((a, b) => {
        const orderA = a.order !== undefined ? Number(a.order) : Number.MAX_SAFE_INTEGER;
        const orderB = b.order !== undefined ? Number(b.order) : Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        
        const dateA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
        const dateB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
        return dateB - dateA;
      });
      callback(sorted);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

// Skills
export const getSkills = async () => {
  const skillsCol = collection(db, 'skills');
  const snapshot = await getDocs(skillsCol);
  const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return skills.sort((a, b) => {
    const orderA = a.order !== undefined ? Number(a.order) : Number.MAX_SAFE_INTEGER;
    const orderB = b.order !== undefined ? Number(b.order) : Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
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

export const updateSkillsOrder = async (orderedSkills) => {
  const batch = writeBatch(db);
  orderedSkills.forEach((skill, index) => {
    const ref = doc(db, 'skills', skill.id);
    batch.update(ref, { order: index });
  });
  return await batch.commit();
};

export const subscribeSkills = (callback, onError) => {
  const skillsCol = collection(db, 'skills');
  return onSnapshot(skillsCol,
    (snapshot) => {
      const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = skills.sort((a, b) => {
        const orderA = a.order !== undefined ? Number(a.order) : Number.MAX_SAFE_INTEGER;
        const orderB = b.order !== undefined ? Number(b.order) : Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
      callback(sorted);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
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

export const subscribeProfile = (callback, onError) => {
  const profileRef = doc(db, 'profile', 'main');
  return onSnapshot(profileRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        callback(null);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

// Messages
export const getMessages = async () => {
  const messagesCol = collection(db, 'messages');
  const q = query(messagesCol, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

export const sendMessage = async (messageData) => {
  return await addDoc(collection(db, 'messages'), {
    ...messageData,
    date: new Date()
  });
};
export const deleteMessage = async (id) => {
  const messageRef = doc(db, 'messages', id);
  return await deleteDoc(messageRef);
};

export const replyMessage = async (id, replyText) => {
  const messageRef = doc(db, 'messages', id);
  return await updateDoc(messageRef, {
    replied: true,
    replyText: replyText,
    repliedAt: new Date()
  });
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

// Helper: Normalize timestamp from Firestore to milliseconds
const normalizeTimestamp = (timestamp) => {
  if (typeof timestamp === 'number') return timestamp;
  if (timestamp?.seconds) return timestamp.seconds * 1000;
  if (timestamp instanceof Date) return timestamp.getTime();
  return 0;
};

// Helper: Normalize gallery items
const normalizeGalleryItem = (item) => ({
  ...item,
  postedAt: normalizeTimestamp(item.postedAt),
  createdAt: normalizeTimestamp(item.createdAt)
});normalizeGalleryItem

// Gallery
export const getGallery = async () => {
  const galleryCol = collection(db, 'gallery');
  const q = query(galleryCol, orderBy('postedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => normalizeGalleryItem({ id: doc.id, ...doc.data() }));
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

export const addGalleryItem = async (data) => {
  const now = Date.now();
  return await addDoc(collection(db, 'gallery'), {
    ...data,
    postedAt: now,
    createdAt: now,
    updatedAt: now
  });
};

export const updateGalleryItem = async (id, data) => {
  const ref = doc(db, 'gallery', id);
  return await updateDoc(ref, {
    ...data,
    updatedAt: Date.now()
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

// AI Knowledge Base (ai_kb)
export const getAiKb = async () => {
  const kbCol = collection(db, 'ai_kb');
  const snapshot = await getDocs(kbCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeAiKb = (callback, onError) => {
  const kbCol = collection(db, 'ai_kb');
  return onSnapshot(kbCol,
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(items);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const addAiKb = async (data) => {
  return await addDoc(collection(db, 'ai_kb'), {
    ...data,
    createdAt: new Date()
  });
};

export const updateAiKb = async (id, data) => {
  const ref = doc(db, 'ai_kb', id);
  return await updateDoc(ref, {
    ...data,
    updatedAt: new Date()
  });
};

export const deleteAiKb = async (id) => {
  const ref = doc(db, 'ai_kb', id);
  return await deleteDoc(ref);
};

// AI Unanswered Questions (ai_unanswered)
export const getAiUnanswered = async () => {
  const unansweredCol = collection(db, 'ai_unanswered');
  const q = query(unansweredCol, orderBy('askedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeAiUnanswered = (callback, onError) => {
  const unansweredCol = collection(db, 'ai_unanswered');
  const q = query(unansweredCol, orderBy('askedAt', 'desc'));
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

export const addAiUnanswered = async (question) => {
  const unansweredCol = collection(db, 'ai_unanswered');
  const q = query(unansweredCol, where('question', '==', question.trim()));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return null;

  return await addDoc(collection(db, 'ai_unanswered'), {
    question: question.trim(),
    askedAt: new Date(),
    resolved: false
  });
};

export const deleteAiUnanswered = async (id) => {
  const ref = doc(db, 'ai_unanswered', id);
  return await deleteDoc(ref);
};

