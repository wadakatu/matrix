#!/usr/bin/env bash
# npm run test:visual (and :update): the visual tests in the pinned Playwright image, so that the
# OS, the architecture, the browser and the fonts are the same locally and in CI (ported from
# TOMBO's scripts/test_visual.sh on the tombo branch). Baselines are written only with
# --update-snapshots, never by CI and never for a missing image (06).
set -euo pipefail
cd "$(dirname "$0")/.."
version=$(node -p 'require("./package.json").devDependencies["@playwright/test"]')
# The image brings its own Node; use the one mise.toml pins, as everywhere else.
node=$(sed -n 's/^node = "\(.*\)"$/\1/p' mise.toml)
docker run --rm --init --platform linux/amd64 --ipc=host \
  -e MX_VISUAL_CONTAINER=1 -e CI="${CI:-}" -e NODE_VERSION="$node" \
  -v "$PWD:/work" -v /work/node_modules -w /work \
  "mcr.microsoft.com/playwright:v${version}-noble" \
  bash -c 'curl -fsSL "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" | tar -xz -C /opt \
    && export PATH="/opt/node-v$NODE_VERSION-linux-x64/bin:$PATH" && node --version && npm ci --no-audit --no-fund \
    && npm run build && npx astro build && npm run build-storybook \
    && npm run test:visual:run -- "$@"' -- "$@"
