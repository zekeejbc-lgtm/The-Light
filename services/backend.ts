
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment,
  Firestore
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  Auth
} from 'firebase/auth';

// Types
import { 
  Article, 
  User, 
  UserRole,
  ArticleReport,
  SystemConfig,
  Comment,
  SearchResult,
  AccessLog,
  ArticleReactions,
  PageConfig
} from '../types';

// --- Firebase Configuration ---
// REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize variables with explicit types
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let provider: GoogleAuthProvider | undefined;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
} catch (e) {
    console.warn("Firebase not initialized. Check configuration.");
}

// --- Auth Services ---

export const loginWithGoogle = async (): Promise<User> => {
  if (!auth || !provider || !db) throw new Error("Firebase not initialized");
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  let userData: User;

  if (userSnap.exists()) {
    userData = userSnap.data() as User;
  } else {
    // New User Default
    userData = {
      id: user.uid,
      name: user.displayName || 'Anonymous',
      email: user.email || '',
      role: UserRole.GUEST,
      avatar: user.photoURL || '',
      bio: 'New member',
    };
    // In real app use setDoc to specify ID
    await addDoc(collection(db, 'users'), userData); 
  }
  return userData;
};

export const logout = async (): Promise<void> => {
  if (auth) await signOut(auth);
};

// --- Content Services Helpers (Backend Implementation) ---

// Note: To fully replace the mock service, you would map all functions 
// from services/contentService.ts to use these Firestore calls.

export const getArticles = async (categorySlug?: string): Promise<Article[]> => {
  if (!db) return [];
  const articlesRef = collection(db, 'articles');
  let q;
  
  if (categorySlug) {
    q = query(
      articlesRef, 
      where('categorySlug', '==', categorySlug), 
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
  } else {
    q = query(
      articlesRef, 
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
};

export const createArticle = async (article: Article): Promise<void> => {
  if (!db) return;
  const { id, ...data } = article; 
  // Using addDoc allows Firestore to generate ID, or use setDoc with custom ID
  await addDoc(collection(db, 'articles'), {
    ...data,
    publishedAt: new Date().toISOString(),
    views: 0,
    reactions: { like:0, love:0, insightful:0, sad:0 }
  });
};

export const updateArticle = async (article: Article): Promise<void> => {
  if (!db) return;
  const docRef = doc(db, 'articles', article.id);
  await updateDoc(docRef, { ...article });
};

export const deleteArticle = async (id: string): Promise<void> => {
  if (!db) return;
  await deleteDoc(doc(db, 'articles', id));
};

export const getPages = async (): Promise<PageConfig[]> => {
    if (!db) return [];
    const q = query(collection(db, 'pages'), orderBy('orderScore', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PageConfig));
};

export const createPage = async (page: PageConfig): Promise<void> => {
    if (!db) return;
    await addDoc(collection(db, 'pages'), page);
};

export const updatePage = async (id: string, updates: Partial<PageConfig>): Promise<void> => {
    if (!db) return;
    await updateDoc(doc(db, 'pages', id), updates);
};

export const deletePage = async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, 'pages', id));
};
