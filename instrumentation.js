export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDefaultAdminAccount } = await import("./lib/ensureDefaultAdmin.js");
    await ensureDefaultAdminAccount();
  }
}
