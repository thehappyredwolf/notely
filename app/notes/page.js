"use client";
import Editor from "@/components/Editor";
import MDX from "@/components/MDX";
import SideNav from "@/components/SideNav";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotesPage() {
  const [isViewer, setIsViewer] = useState(true);
  const [showNav, setShowNav] = useState(false);
  const [note, setNote] = useState({
    content: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [noteIds, setNoteIds] = useState([]);
  const [savingNote, setSavingNote] = useState(false);

  const { currentUser, isLoadingUser } = useAuth();

  const searchParams = useSearchParams();

  function handleToggleViewer() {
    setIsViewer(!isViewer);
  }

  function handleToggleMenu() {
    setShowNav(!showNav);
  }

  function handleCreateNote() {
    setNote({
      content: "",
    });
    setIsViewer(false);
    window.history.replaceState(null, "", "/notes");
  }

  function handleEditNote(e) {
    setNote({ ...note, content: e.target.value });
  }

  async function handleSaveNote() {
    if (!note?.content) {
      return;
    }
    setSavingNote(true);
    try {
      if (note.id) {
        const noteRef = doc(db, "users", currentUser.uid, "notes", note.id);
        await setDoc(
          noteRef,
          {
            ...note,
          },
          { merge: true },
        );
      } else {
        const newId =
          note.content.replaceAll("#", "").slice(0, 15) + "__" + Date.now();
        const notesRef = doc(db, "users", currentUser.uid, "notes", newId);
        const newDocInfo = await setDoc(notesRef, {
          content: note.content,
          createdAt: serverTimestamp(),
        });
        setNoteIds((curr) => [...curr, newId]);
        setNote({ ...note, id: newId });
        window.history.pushState(null, "", `?id=${newId}`);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setSavingNote(false);
    }
  }

  useEffect(() => {
    const value = searchParams.get("id");

    if (!value || !currentUser) {
      return;
    }

    async function fetchNote() {
      if (isLoading) {
        return;
      }
      try {
        setIsLoading(true);
        console.log("FETCHING DATA");
        const noteRef = doc(db, "users", currentUser.uid, "notes", value);
        const snapshot = await getDoc(noteRef);
        const docData = snapshot.exists()
          ? { id: snapshot.id, ...snapshot.data() }
          : null;
        if (docData) {
          setNote({ ...docData });
        }
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNote();
  }, [currentUser, searchParams]);

  if (isLoadingUser) {
    return <h6 className="text-gradient">Loading...</h6>;
  }

  if (!currentUser) {
    window.location.href = "/";
  }

  return (
    <main id="notes">
      <SideNav
        setIsViewer={setIsViewer}
        handleCreateNote={handleCreateNote}
        noteIds={noteIds}
        setNoteIds={setNoteIds}
        showNav={showNav}
        setShowNav={setShowNav}
      />
      {!isViewer && (
        <Editor
          savingNote={savingNote}
          handleSaveNote={handleSaveNote}
          handleToggleMenu={handleToggleMenu}
          setText={handleEditNote}
          text={note.content}
          hello="world"
          isViewer={isViewer}
          handleToggleViewer={handleToggleViewer}
        />
      )}
      {isViewer && (
        <MDX
          savingNote={savingNote}
          handleSaveNote={handleSaveNote}
          handleToggleMenu={handleToggleMenu}
          text={note.content}
          isViewer={isViewer}
          handleToggleViewer={handleToggleViewer}
        />
      )}
    </main>
  );
}
