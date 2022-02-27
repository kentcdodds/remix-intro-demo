import { PrismaClient } from "@prisma/client";
import bcrypt from "@node-rs/bcrypt";

const prisma = new PrismaClient();

async function seed() {
  const hashedPassword = await bcrypt.hash("mysupergoodpassword", 10);

  const user = await prisma.user.create({
    data: {
      email: "you@example.com",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      userId: user.id,
    },
  });
  await prisma.note.create({
    data: {
      title: "My second note",
      userId: user.id,
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

try {
  seed();
  process.exit(0);
} catch (error: unknown) {
  console.error(error);
  process.exit(1);
}
