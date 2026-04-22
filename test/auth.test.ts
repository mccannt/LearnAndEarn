import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";

import {
  PARENT_AUTH_COOKIE,
  isParentAuthed,
  parentAuthCookieOptions,
} from "@/lib/auth";

describe("auth helpers", () => {
  it("recognizes an authenticated parent cookie", () => {
    const req = new NextRequest("http://localhost/api/parent/login", {
      headers: {
        cookie: `${PARENT_AUTH_COOKIE}=1`,
      },
    });

    assert.equal(isParentAuthed(req), true);
  });

  it("rejects missing or invalid auth cookies", () => {
    const missingCookieReq = new NextRequest("http://localhost/api/parent/login");
    const wrongValueReq = new NextRequest("http://localhost/api/parent/login", {
      headers: {
        cookie: `${PARENT_AUTH_COOKIE}=0`,
      },
    });

    assert.equal(isParentAuthed(missingCookieReq), false);
    assert.equal(isParentAuthed(wrongValueReq), false);
  });

  it("uses httpOnly and sameSite protection on parent cookies", () => {
    const options = parentAuthCookieOptions();

    assert.equal(options.path, "/");
    assert.equal(options.httpOnly, true);
    assert.equal(options.sameSite, "lax");
  });
});
