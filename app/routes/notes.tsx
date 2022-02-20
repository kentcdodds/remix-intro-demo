import * as React from "react";
import {
  Form,
  json,
  LinksFunction,
  redirect,
  useLoaderData,
  useLocation,
  useTransition,
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

interface LoaderData {
  notes: Array<Note>;
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const notes = await prisma.note.findMany({
    where: { userId: userId },
    orderBy: { id: "desc" },
  });
  return json<LoaderData>({ notes });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const actionType = formData.get("_action");

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
      const body = formData.get("body") || "";

      if (typeof title !== "string") {
        throw new Response("title must be a string", { status: 400 });
      }

      if (typeof body !== "string") {
        throw new Response("body must be a string", { status: 400 });
      }

      await createNote(title, body, userId);

      return redirect("/notes");
    }

    default: {
      throw new Response("Invalid action", { status: 400 });
    }
  }
};

export default function Index() {
  const location = useLocation();
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <h1>Notes</h1>
      <Form method="post" key={location.key} className="flexer">
        <input aria-label="Title" name="title" />
        <button name="_action" value="create-note" type="submit">
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
              <Form method="post">
                <input type="hidden" name="noteId" value={note.id} />
                <button type="submit" name="_action" value="delete-note">
                  Delete
                </button>
              </Form>
              <h3>{note.title}</h3>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
