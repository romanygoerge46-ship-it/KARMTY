
import React, { useState, useEffect } from 'react';
import { getDB } from './services/db';
import { AppData, Person, Role } from './types';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PeopleManager } from './components/PeopleManager';
import { Attendance } from './components/Attendance';
import { Profile } from './components/Profile';
import { DeveloperDatabase } from './components/DeveloperDatabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Person | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [data, setData] = useState<AppData>({ people: [], attendance: [] });

  // Load data on mount and whenever authentication changes
  const refreshData = () => {
    const db = getDB();
    setData(db);
    // Also update current user object if it changed in DB
    if (currentUser) {
      const updatedUser = db.people.find(p => p.id === currentUser.id);
      if (updatedUser) setCurrentUser(updatedUser);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser?.id]); // Only refresh on login

  if (!currentUser) {
    return <Login onLogin={(user) => setCurrentUser(user)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard people={data.people} attendance={data.attendance} />;
      case 'profile':
        return <Profile user={currentUser} onUpdate={refreshData} />;
      case 'database':
        if (currentUser.role === Role.Developer) {
           return <DeveloperDatabase people={data.people} />;
        }
        return <Dashboard people={data.people} attendance={data.attendance} />;
      case 'people':
        return <PeopleManager people={data.people} onDataChange={refreshData} currentUser={currentUser} />;
      case 'servants':
        return <PeopleManager people={data.people} onDataChange={refreshData} currentUser={currentUser} showServantsOnly={true} />;
      case 'attendance':
        return <Attendance people={data.people} attendance={data.attendance} onDataChange={refreshData} currentUser={currentUser} />;
      default:
        return <Dashboard people={data.people} attendance={data.attendance} />;
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
