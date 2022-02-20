import { LoaderFunction, redirect } from "remix";

export const loader: LoaderFunction = async () => redirect("/notes");
