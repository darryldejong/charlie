import React, { useState, useEffect } from 'react';
import './App.css';
import charlieImg from './images/charlie.jpg';
import charlie3Img from './images/charlie3.jpeg';

function App() {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showTitleConfirm, setShowTitleConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(0);
  const [isTurningPage, setIsTurningPage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const MAX_CHARACTERS = 200;
  const MAX_TITLE_LENGTH = 20;

  useEffect(() => {
    const checkForNewDay = () => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now);
        setCurrentEntry('');
        setCurrentTitle('');
      }
    };
    const interval = setInterval(checkForNewDay, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('pawprintsDiary');
    if (savedEntries) {
      setDiaryEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pawprintsDiary', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    if (isBookOpen) {
      const today = new Date().toISOString().split('T')[0];
      const todaysEntry = diaryEntries.find(entry => entry.date === today && entry.id === editingId);
      
      if (todaysEntry) {
        setHasUnsavedChanges(
          todaysEntry.content !== currentEntry || 
          todaysEntry.title !== currentTitle
        );
      } else if (currentEntry || currentTitle) {
        setHasUnsavedChanges(true);
      } else {
        setHasUnsavedChanges(false);
      }
    }
  }, [currentEntry, currentTitle, diaryEntries, editingId, isBookOpen]);

  const handleOpenBook = () => {
    setIsBookOpen(true);
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const todaysEntry = diaryEntries.find(entry => entry.date === today);
      if (todaysEntry) {
        setCurrentEntry(todaysEntry.content);
        setCurrentTitle(todaysEntry.title || '');
        setEditingId(todaysEntry.id);
        const todayIndex = diaryEntries.findIndex(entry => entry.date === today);
        setCurrentPage(todayIndex);
      } else {
        setCurrentEntry('');
        setCurrentTitle('');
        setEditingId(null);
        setCurrentPage(diaryEntries.length > 0 ? diaryEntries.length - 1 : 0);
      }
    }, 1000);
  };

  const handleCloseBook = () => {
    if (hasUnsavedChanges) {
      setShowCloseConfirm(true);
    } else {
      closeBookConfirmed();
    }
  };

  const closeBookConfirmed = () => {
    setIsBookOpen(false);
    setShowCloseConfirm(false);
    setHasUnsavedChanges(false);
  };

  const handleSaveEntry = () => {
    if (!currentTitle.trim()) {
      setShowTitleConfirm(true);
      return;
    }
    if (!currentEntry.trim()) return;

    const today = new Date().toISOString().split('T')[0];

    if (editingId) {
      setDiaryEntries(diaryEntries.map(entry =>
        entry.id === editingId
          ? {
              ...entry,
              content: currentEntry,
              title: currentTitle.slice(0, MAX_TITLE_LENGTH)
            }
          : entry
      ));
    } else {
      const newEntry = {
        id: Date.now(),
        date: today,
        title: currentTitle.slice(0, MAX_TITLE_LENGTH),
        content: currentEntry
      };
      setDiaryEntries([...diaryEntries, newEntry]);
      setEditingId(newEntry.id);
      setCurrentPage(diaryEntries.length);
    }
    
    setHasUnsavedChanges(false);
  };

  const handleNextPage = () => {
    if (currentPage < diaryEntries.length) {
      setIsTurningPage(true);
      setTimeout(() => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        setIsTurningPage(false);
        if (nextPage >= diaryEntries.length) {
          setCurrentEntry('');
          setCurrentTitle('');
          setEditingId(null);
        } else {
          const entry = diaryEntries[nextPage];
          setCurrentEntry(entry.content);
          setCurrentTitle(entry.title);
          setEditingId(entry.id);
        }
      }, 300);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setIsTurningPage(true);
      setTimeout(() => {
        const prevPage = currentPage - 1;
        setCurrentPage(prevPage);
        setIsTurningPage(false);
        const entry = diaryEntries[prevPage];
        setCurrentEntry(entry.content);
        setCurrentTitle(entry.title);
        setEditingId(entry.id);
      }, 300);
    }
  };

  const handleDeleteEntry = (id) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = (id) => {
    const newEntries = diaryEntries.filter(entry => entry.id !== id);
    setDiaryEntries(newEntries);
    setShowDeleteConfirm(null);

    if (editingId === id) {
      setCurrentEntry('');
      setCurrentTitle('');
      setEditingId(null);
    }

    if (currentPage >= newEntries.length && newEntries.length > 0) {
      setCurrentPage(newEntries.length - 1);
    } else if (newEntries.length === 0) {
      setCurrentPage(0);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  const getPageDate = (pageIndex) => {
    if (pageIndex < diaryEntries.length) {
      return diaryEntries[pageIndex].date;
    }
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div
      className={`app ${isBookOpen ? 'book-open' : ''}`}
      style={{ 
        backgroundImage: isBookOpen ? 'none' : `url(${charlie3Img})`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {!isBookOpen ? (
        <div className="book-cover" onClick={handleOpenBook}>
          <div className="book-cover-content">
            <h1 className="book-title">Pawprints</h1>
            <div className="book-author">
              Charlie - 4 May 2025🐾💘🌈
            </div>
          </div>
        </div>
      ) : (
        <div className="book-content">
          <button className="close-book" onClick={handleCloseBook}>✕</button>

          <div className={`book-pages ${isTurningPage ? 'turning' : ''}`}>
            <div className="page-nav left-nav" onClick={handlePrevPage}>
              {currentPage > 0 && <span style={{ fontSize: '2rem' }}>←</span>}
            </div>

            <div className="page-container">
              <div className="page left-page">
                {currentPage === 0 ? (
                  <div className="first-page-content">
                    <h2>Charlie's Dagboek</h2>
                    <div className="charlie-portrait">
                      <img src={charlieImg} alt="Charlie" />
                      <div className="portrait-frame"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2>{diaryEntries[currentPage - 1]?.title || 'Dagboek'}</h2>
                    <div className="page-date">{formatDate(getPageDate(currentPage - 1))}</div>
                    <div className="page-content italic text-gray-500">
                      {diaryEntries[currentPage - 1]?.title || 'Nieuwe pagina'}
                    </div>
                  </>
                )}
              </div>

              <div className="page right-page">
                <div className="page-header">
                  <input
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
                    placeholder="Titel..."
                    className="entry-title"
                  />
                  <div className="page-date">{formatDate(getPageDate(currentPage))}</div>
                </div>
                <textarea
                  value={currentEntry}
                  onChange={(e) => setCurrentEntry(e.target.value)}
                  placeholder="Schrijf hier een herinnering voor Charlie..."
                  maxLength={MAX_CHARACTERS}
                />
                <div className="character-counter">
                  {currentEntry.length}/{MAX_CHARACTERS}
                </div>
                <div className="page-actions">
                  <button onClick={handleSaveEntry} className="save-button">
                    {editingId ? 'Update Pagina' : 'Opslaan'}
                  </button>
                  {editingId && (
                    <button
                      onClick={() => handleDeleteEntry(editingId)}
                      className="delete-button"
                    >
                      Verwijderen
                    </button>
                  )}
                </div>
                <div className="page-number">
                  Pagina {currentPage + 1} van {Math.max(diaryEntries.length, currentPage + 1)}
                </div>
              </div>
            </div>

            <div className="page-nav right-nav" onClick={handleNextPage}>
              <span style={{ fontSize: '2rem' }}>→</span>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h3>Weet je het zeker?</h3>
            <p>Deze pagina zal permanent verwijderd worden.</p>
            <div className="confirm-buttons">
              <button onClick={() => confirmDelete(showDeleteConfirm)} className="confirm-delete">Ja, verwijder</button>
              <button onClick={cancelDelete} className="cancel-delete">Annuleren</button>
            </div>
          </div>
        </div>
      )}

      {showTitleConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h3>Titel ontbreekt</h3>
            <p>Je moet een titel invullen voordat je kan opslaan.</p>
            <div className="confirm-buttons">
              <button onClick={() => setShowTitleConfirm(false)} className="cancel-delete">OK</button>
            </div>
          </div>
        </div>
      )}

      {showCloseConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h3>Weet je het zeker?</h3>
            <p>Je hebt niet opgeslagen wijzigingen. Wil je toch het dagboek sluiten?</p>
            <div className="confirm-buttons">
              <button onClick={closeBookConfirmed} className="confirm-delete">Ja, sluiten</button>
              <button onClick={() => setShowCloseConfirm(false)} className="cancel-delete">Annuleren</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
