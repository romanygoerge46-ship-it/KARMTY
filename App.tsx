
import React, { useState, useEffect } from 'react';
import { getDB, subscribe } from './services/db';
import { AppData, Person, Role } from './types';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PeopleManager } from './components/PeopleManager';
import { Attendance } from './components/Attendance';
import { Profile } from './components/Profile';
import { DeveloperDatabase } from './components/DeveloperDatabase';
import { FamiliesManager } from './components/FamiliesManager';
import { FriendsChat } from './components/FriendsChat';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Person | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [data, setData] = useState<AppData>({ people: [], attendance: [], stages: [], families: [], messages: [] });

  // Load data on mount and whenever authentication changes
  const refreshData = () => {
    const db = getDB();
    setData(db);
    // CRITICAL FIX: Update current user object if it changed in DB (e.g. role updated by Admin)
    if (currentUser) {
      const updatedUser = db.people.find(p => p.id === currentUser.id);
      if (updatedUser) {
          // Only update state if something actually changed to avoid loop
          if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
              setCurrentUser(updatedUser);
          }
      }
    }
  };

  useEffect(() => {
    // 1. Initial Load
    refreshData();

    // 2. Subscribe to Firebase Realtime Updates
    const unsubscribe = subscribe(() => {
       refreshData();
    });

    return () => unsubscribe();
  }, [currentUser?.id]); 

  if (!currentUser) {
    return <Login onLogin={(user) => setCurrentUser(user)} />;
  }

  // --- Filtering Logic for Multi-Tenancy ---
  // Developer sees ALL data.
  // Others see only data belonging to their churchId.
  const isDev = currentUser.role === Role.Developer;

  const filteredPeople = isDev 
    ? data.people 
    : data.people.filter(p => p.churchId === currentUser.churchId);

  const filteredAttendance = isDev
    ? data.attendance
    : data.attendance.filter(a => a.churchId === currentUser.churchId || data.people.find(p => p.id === a.personId)?.churchId === currentUser.churchId);

  const filteredFamilies = isDev
    ? data.families
    : data.families.filter(f => f.churchId === currentUser.churchId);


  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard people={filteredPeople} attendance={filteredAttendance} />;
      case 'profile':
        return <Profile user={currentUser} onUpdate={refreshData} />;
      case 'database':
        // Only Developer accesses this, and they see everything (data.people)
        if (currentUser.role === Role.Developer) {
           return <DeveloperDatabase people={data.people} onDataChange={refreshData} currentUser={currentUser} />;
        }
        return <Dashboard people={filteredPeople} attendance={filteredAttendance} />;
      case 'people':
        return <PeopleManager people={filteredPeople} onDataChange={refreshData} currentUser={currentUser} />;
      case 'servants':
        return <PeopleManager people={filteredPeople} onDataChange={refreshData} currentUser={currentUser} showServantsOnly={true} />;
      case 'attendance':
        return <Attendance people={filteredPeople} attendance={filteredAttendance} onDataChange={refreshData} currentUser={currentUser} />;
      case 'families':
         return <FamiliesManager families={filteredFamilies} onDataChange={refreshData} currentUser={currentUser} />;
      case 'friends':
         return <FriendsChat currentUser={currentUser} />;
      default:
        return <Dashboard people={filteredPeople} attendance={filteredAttendance} />;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onChangeView={setCurrentView}
      onLogout={() => setCurrentUser(null)}
      currentUser={currentUser}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
