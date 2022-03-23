import {
  Form,
  json,
  LinksFunction,
  redirect,
  useLoaderData,
  useLocation,
} from "remix";
import type { Note } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "remix";

import { prisma } from "~/db.server";
import { createNote, deleteNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import stylesUrl from "./notes.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

type LoaderData = {
  notes: Array<Note>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const notes = await prisma.note.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });
  return json<LoaderData>({ notes });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const actionType = formData.get("action");

  switch (actionType) {
    case "delete-note": {
      const noteId = formData.get("noteId");
      if (typeof noteId !== "string") {
        throw new Response("noteId must be a string", { status: 400 });
      }

      await deleteNote(noteId);

      return redirect("/notes");
    }

    case "create-note": {
      const title = formData.get("title");

      if (typeof title !== "string") {
        throw new Response("title must be a string", { status: 400 });
      }

      await createNote(title, userId);

      return redirect("/notes");
    }

    default: {
      throw new Response("Invalid action", { status: 400 });
    }
  }
};

export default function NotesPage() {
  const location = useLocation();
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <Form action="/logout" method="post">
        <button type="submit">Logout</button>
      </Form>
      <h1>Notes</h1>
      <Form method="post" key={location.key} className="flexer">
        <input aria-label="Title" name="title" />
        <button name="action" value="create-note" type="submit">
          Save
        </button>
      </Form>

      <h2>Notes</h2>
      {data.notes.length === 0 ? (
        <p>No notes yet</p>
      ) : (
        <ul>
          {data.notes.map((note) => (
            <li key={note.id} className="flexer">
              <NoteDisplay note={note} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NoteDisplay({ note }: { note: Note }) {
  return (
    <div className="flexer">
      <Form method="post">
        <input type="hidden" name="noteId" value={note.id} />
        <button type="submit" name="action" value="delete-note">
          Delete
        </button>
      </Form>
      <p>{note.title}</p>
    </div>
  );
}
