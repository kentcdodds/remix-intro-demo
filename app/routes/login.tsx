import { Form, Link, redirect, useSearchParams } from "remix";
import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";

import { createUserSession, getUserId } from "~/session.server";

import { verifyLogin } from "~/models/user.server";
import invariant from "tiny-invariant";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  invariant(typeof email === "string", "email must be a string");
  invariant(typeof password === "string", "password must be a string");

  const user = await verifyLogin(email, password);

  if (!user) {
    return redirect("/login");
  }

  return createUserSession(request, user.id, "/");
};

export const meta: MetaFunction = () => ({
  title: "Login",
});

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;

  return (
    <div>
      <div>
        <h2>Sign in to your account</h2>
      </div>

      <Form method="post">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label>
          <span>Email address</span>
          <input name="email" type="email" autoComplete="email" />
        </label>

        <label>
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </label>

        <button type="submit">Sign in</button>
      </Form>

      <p>
        <Link
          to={{
            pathname: "/join",
            search: redirectTo ? `?redirectTo=${redirectTo}` : undefined,
          }}
        >
          Don't have an account?
        </Link>
      </p>
    </div>
  );
}
