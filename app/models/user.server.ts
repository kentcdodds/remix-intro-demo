import bcrypt from "@node-rs/bcrypt";
import { prisma } from "~/db.server";

async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password);
  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

async function verifyLogin(email: string, passwordString: string) {
  const result = await prisma.user.findUnique({
    where: { email },
    include: { password: true },
  });

  if (!result || !result.password) {
    return null;
  }
  const { password, ...user } = result;

  const isValid = await bcrypt.verify(passwordString, password.hash);

  if (!isValid) {
    return null;
  }

  return user;
}

export { createUser, verifyLogin };
