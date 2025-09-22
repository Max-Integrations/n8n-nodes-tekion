## n8n-nodes-tekion-apc

Community node for n8n to work with the Tekion APC (2.0) API.

- **Package name**: `n8n-nodes-tekion-apc`
- **License**: MIT
- **Author**: Maxwell Chamberlain

### What this node does

This node communicates with the Tekion Open API and currently supports:

- **Vehicle Inventory**
  - Action: `Get Many` (lists vehicles)
  - Filters:
    - `modifiedStartTime` (ISO date/time; converted to epoch seconds)
    - `status` (passed to API)
    - `stockType` (client-side filtered after the API call)
- **Deals**
  - Action: `Get Many`

You can target either the Sandbox or Production environments via credentials.

Documentation for the platform is available at `https://docs.tekioncloud.com`.

---

## Installation

You can install this community node in two ways.

### Install from the n8n UI (recommended)

1. In n8n, go to Settings → Community Nodes
2. Click "Install"
3. Enter `n8n-nodes-tekion-apc`
4. Confirm and restart n8n if prompted

### Install on a self-hosted n8n instance

From within your n8n installation directory (or using N8N_CUSTOM_EXTENSIONS, depending on your setup):

```bash
npm install n8n-nodes-tekion-apc
```

Restart n8n after installation so it picks up the new node.

---

## Credentials setup

Create credentials of type **Tekion APC API** with:

- **App ID** (required)
- **App Secret** (required)
- **Account Type**: `Production` or `Sandbox`

These map directly to your Tekion app credentials. The node uses these to fetch a bearer token and call the Open API. Ensure the account type matches the environment for the data you’re targeting.

---

## Using the node in a workflow

1. Add the node: search for "Tekion APC" in the node selector
2. Choose credentials: select your saved **Tekion APC API** credentials
3. Set parameters:
   - **Dealer ID**: e.g. `techmotors_4_0`
   - **Resource**: `Vehicle Inventory` or `Deal`
   - **Action**: `Get Many`
4. Optional filters (Vehicle Inventory → Get Many):
   - `modifiedStartTime` (ISO date/time)
   - `status` (passed to API)
   - `stockType` (filtered client-side after retrieval)

The node outputs the API response as JSON. When `stockType` is set, results are filtered locally after the API call.

---

## Development

Prerequisites: Node.js and npm, plus access to an n8n instance for testing.

Install dependencies:

```bash
npm install
```

Useful scripts:

- `npm run dev` — Start a local n8n environment with this node loaded (via `@n8n/node-cli`)
- `npm run build` — Build the node to `dist/`
- `npm run build:watch` — TypeScript watch mode
- `npm run lint` — Lint the project
- `npm run lint:fix` — Auto-fix lint issues

Project layout (key parts):

- `credentials/TekionApcApi.credentials.ts` — n8n credential type definition
- `nodes/TekionApc/TekionApc.node.ts` — node description and execution logic
- `nodes/TekionApc/shared/*` — token service and utilities
- `nodes/TekionApc/resources/*` — per-resource operations (e.g., Vehicle Inventory)
- `icons/tekion.svg` — node icon

Build artifacts are emitted to `dist/`.

---

## Releasing (maintainers)

This project uses `@n8n/node-cli` and `release-it`.

Typical flow:

1. Ensure changes are committed
2. Update version (handled by the release script)
3. Run:

```bash
npm run release
```

This will prepare the build and guide you through tagging and publishing steps as configured. The `prepublishOnly` script runs `n8n-node prerelease` to build before publish.

---

## Troubleshooting

- **401/403 Unauthorized**: Verify App ID/App Secret and that Account Type matches the target environment
- **404/Endpoint issues**: Confirm the selected resource/action exists in the target Tekion environment
- **Empty results with `stockType`**: Remember `stockType` is applied after fetch; remove it to validate raw API data

If issues persist, try re-authenticating credentials and checking your dealer ID.

---

## Changelog

See `CHANGELOG.md` for notable changes.

---

## License

MIT
