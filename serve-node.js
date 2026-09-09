
import { INTERNAL_runFetch, unstable_serverEntry } from './server/index.js';

const { serve } = unstable_serverEntry;

const host = process.env.HOST;
const port = process.env.PORT;

serve({
  fetch: (req, ...args) => INTERNAL_runFetch(process.env, req, ...args),
  ...(host ? { hostname: host } : {}),
  ...(port ? { port: parseInt(port, 10) } : {}),
});
