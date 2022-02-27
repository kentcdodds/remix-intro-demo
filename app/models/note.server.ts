import { prisma } from "~/db.server";

function createNote(title: string, userId: string) {
  return prisma.note.create({
    data: {
      title,
      userId,
    },
  });
}

function deleteNote(id: string) {
  return prisma.note.delete({
    where: { id },
  });
}

export { createNote, deleteNote };
