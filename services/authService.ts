
import { User, UserRole } from '../types';
import { logUserActivity } from './contentService';

// Mock Users
let MOCK_USERS: User[] = [
  { 
      id: '1', 
      name: 'Auditor Admin', 
      username: 'auditor_main',
      email: 'auditor@light.edu', 
      schoolId: '2020-0001',
      role: UserRole.AUDITOR, 
      avatar: 'https://i.pravatar.cc/150?u=auditor', 
      bio: 'Overseeing the quality and integrity of The Light Publication. I ensure every story meets our high standards.',
      specialization: 'System Administration',
      socialLinks: { twitter: '@auditor', linkedin: 'in/auditor' }
  },
  { 
      id: '2', 
      name: 'Jane EIC', 
      username: 'jane_writes',
      email: 'eic@light.edu', 
      schoolId: '2021-0055',
      role: UserRole.EIC, 
      avatar: 'https://i.pravatar.cc/150?u=eic', 
      bio: 'Editor-in-Chief. Passionate about student journalism and bringing the truth to light.',
      specialization: 'Editorial Writing'
  },
  { 
      id: '3', 
      name: 'John Head', 
      username: 'sports_john',
      email: 'head@light.edu', 
      schoolId: '2022-1024',
      role: UserRole.HEAD, 
      avatar: 'https://i.pravatar.cc/150?u=head', 
      bio: 'Head of Sports Section. I live for the game and the stories behind the scores.',
      specialization: 'Sports Journalism'
  },
  { 
      id: '4', 
      name: 'Jimmy Pen', 
      username: 'jimmy_p',
      email: 'writer@light.edu', 
      schoolId: '2023-0512',
      role: UserRole.JOURNALIST, 
      avatar: 'https://i.pravatar.cc/150?u=writer', 
      bio: 'Aspiring writer and coffee enthusiast. Always chasing the next big scoop on campus.',
      specialization: 'Features'
  },
];

// Mock Guest Applications
export const getGuestApplications = async () => {
    return [
        { id: '101', name: 'New Student', email: 'student1@light.edu', requestedRole: 'JOURNALIST', reason: 'I want to join the club.' },
        { id: '102', name: 'Photo Enthusiast', email: 'photo@light.edu', requestedRole: 'JOURNALIST', reason: 'I have a DSLR and want to contribute.' }
    ];
};

export const login = async (email: string, schoolId?: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simple check: If schoolId provided, check both. If only email (legacy/google), check email.
  const user = MOCK_USERS.find(u => {
      if (schoolId) return u.email === email && u.schoolId === schoolId;
      return u.email === email;
  });

  if (user) {
    await logUserActivity('LOGIN', `User ${user.name} logged in.`, user);
    return user;
  }
  
  throw new Error('Invalid credentials. Please check your Email and School ID.');
};

export const loginWithGoogle = async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate a Google Auth return
    // For demo purposes, we'll log them in as a new Guest User if not found, or an existing user
    
    // Just picking a random user for demo simulation or creating a guest
    const user = MOCK_USERS[3]; // Jimmy Pen
    await logUserActivity('LOGIN', `User ${user.name} logged in via Google.`, user);
    return user;
};

export const logout = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('the_light_user');
  return stored ? JSON.parse(stored) : null;
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_USERS.find(u => u.id === id);
};

export const updateProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const index = MOCK_USERS.findIndex(u => u.id === userId);
  if (index === -1) throw new Error("User not found");

  MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    const updatedUser = MOCK_USERS[index];
    localStorage.setItem('the_light_user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  return MOCK_USERS[index];
};

// Admin Functions
export const getAllUsers = async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_USERS];
};

export const createUser = async (newUser: Omit<User, 'id'>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = { ...newUser, id: Date.now().toString() };
    MOCK_USERS.push(user);
    return user;
};

export const removeUser = async (userId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    MOCK_USERS = MOCK_USERS.filter(u => u.id !== userId);
};