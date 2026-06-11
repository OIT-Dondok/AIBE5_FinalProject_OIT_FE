import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";
import axios from "axios";

type AxiosModuleUnderTest = typeof import("./axios");

async function importAxiosWithRefreshPost(
  post: () => Promise<{ data: { access_token: string } }>,
): Promise<AxiosModuleUnderTest> {
  const mutableAxios = axios as unknown as {
    create: (config?: unknown) => unknown;
  };
  const originalCreate = mutableAxios.create;
  let createCount = 0;
  const interceptorStub = {
    request: { use() {} },
    response: { use() {} },
  };

  mutableAxios.create = () => {
    createCount += 1;
    if (createCount === 1) return { interceptors: interceptorStub };
    return { post };
  };

  try {
    const moduleUrl = pathToFileURL(resolve("src/lib/axios.ts")).href;
    return (await import(
      `${moduleUrl}?authRefreshTest=${Date.now()}-${createCount}`
    )) as AxiosModuleUnderTest;
  } finally {
    mutableAxios.create = originalCreate;
  }
}

describe("auth refresh coordination", () => {
  it("keeps refresh coordination module-local to the axios singleton", () => {
    const source = readFileSync("src/lib/axios.ts", "utf8");

    assert.match(source, /let pendingRefresh: Promise<string> \| null = null/);
    assert.match(source, /if \(pendingRefresh\) return pendingRefresh/);
    assert.match(source, /pendingRefresh = refreshApi/);
    assert.match(source, /\.finally\(\(\) => \{\s*pendingRefresh = null;\s*\}\)/);
    assert.match(source, /setAccessToken\(data\.access_token\)/);
    assert.doesNotMatch(source, /createRefreshAccessToken/);
  });

  it("keeps axios auth guards while removing interceptor-local refresh queues", () => {
    const source = readFileSync("src/lib/axios.ts", "utf8");

    assert.match(source, /function isAuthEndpoint/);
    assert.match(source, /function canRefresh/);
    assert.match(source, /await refreshAccessToken\(\)/);
    assert.doesNotMatch(source, /let isRefreshing/);
    assert.doesNotMatch(source, /failedQueue/);
    assert.doesNotMatch(source, /processQueue/);
  });

  it("keeps app boot refresh on the axios singleton coordinator", () => {
    const source = readFileSync("src/components/common/AuthInitializer.tsx", "utf8");

    assert.match(source, /import \{ refreshAccessToken \} from ['"]@\/lib\/axios['"]/);
    assert.doesNotMatch(source, /@\/lib\/authRefresh/);
    assert.doesNotMatch(source, /axios\.post/);
  });

  it("coalesces concurrent refreshAccessToken calls into one request", async () => {
    let resolveRefresh:
      | ((response: { data: { access_token: string } }) => void)
      | undefined;
    let postCalls = 0;
    const refreshPromise = new Promise<{ data: { access_token: string } }>(
      (resolvePromise) => {
        resolveRefresh = resolvePromise;
      },
    );
    const moduleUnderTest = await importAxiosWithRefreshPost(() => {
      postCalls += 1;
      return refreshPromise;
    });

    const first = moduleUnderTest.refreshAccessToken();
    const second = moduleUnderTest.refreshAccessToken();

    assert.equal(postCalls, 1);
    resolveRefresh?.({ data: { access_token: "shared-token" } });
    assert.equal(await first, "shared-token");
    assert.equal(await second, "shared-token");
    assert.equal(moduleUnderTest.getAccessToken(), "shared-token");
  });

  it("clears pending refresh after failure so a later refresh can retry", async () => {
    let postCalls = 0;
    const moduleUnderTest = await importAxiosWithRefreshPost(() => {
      postCalls += 1;
      if (postCalls === 1) return Promise.reject(new Error("refresh failed"));
      return Promise.resolve({ data: { access_token: "retry-token" } });
    });

    await assert.rejects(
      moduleUnderTest.refreshAccessToken(),
      /refresh failed/,
    );
    assert.equal(await moduleUnderTest.refreshAccessToken(), "retry-token");
    assert.equal(postCalls, 2);
    assert.equal(moduleUnderTest.getAccessToken(), "retry-token");
  });
});
