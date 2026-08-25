#!/usr/bin/env bash
# Publish (or update) the nats-horizon-bin AUR package after a release.
#
# Called by CI with these env vars:
#   AUR_SSH_PRIVATE_KEY  — ed25519 private key whose public half is registered
#                          on the AUR account (https://aur.archlinux.org/account/ssh)
#   VERSION              — bare version, e.g. 0.1.0 (no leading 'v')
#   TARBALL              — path to the built release tarball (for b2sum)
set -euo pipefail

: "${AUR_SSH_PRIVATE_KEY:?AUR_SSH_PRIVATE_KEY env var is required}"
: "${VERSION:?VERSION env var is required}"
: "${TARBALL:?TARBALL env var is required}"

AUR_REPO="nats-horizon-bin"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

KEYFILE="${WORK}/aur_key"
printenv AUR_SSH_PRIVATE_KEY > "$KEYFILE"
chmod 600 "$KEYFILE"
KNOWN_HOSTS="${WORK}/known_hosts"
echo "aur.archlinux.org ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEuBKrPzbawxA/k2g6NcyV5jmqwJ2s+zpgZGZ7tpLIcN" \
  > "$KNOWN_HOSTS"
export GIT_SSH_COMMAND="ssh -i ${KEYFILE} -o IdentitiesOnly=yes -o UserKnownHostsFile=${KNOWN_HOSTS} -o StrictHostKeyChecking=yes"
export SSH_CMD="$GIT_SSH_COMMAND"

git config --global user.name  "nats-horizon release bot"
git config --global user.email "noreply@github.com"

git clone "ssh://aur@aur.archlinux.org/${AUR_REPO}.git" "${WORK}/${AUR_REPO}"

PKGBUILD="${WORK}/${AUR_REPO}/PKGBUILD"
cp packaging/arch/PKGBUILD "$PKGBUILD"

SUM="$(b2sum "$TARBALL" | awk '{print $1}')"

sed -i "s/^pkgver=.*/pkgver=${VERSION}/" "$PKGBUILD"
sed -i "s/^pkgrel=.*/pkgrel=1/" "$PKGBUILD"
sed -i "s/^b2sums_x86_64=('PLACEHOLDER')/b2sums_x86_64=('${SUM}')/" "$PKGBUILD"

cd "${WORK}/${AUR_REPO}"
if [ "$(id -u)" -eq 0 ]; then
  id builder &>/dev/null || useradd -m builder
  chown -R builder:builder "$WORK"
  su builder -s /bin/bash -c "cd '${WORK}/${AUR_REPO}' && makepkg --printsrcinfo" > .SRCINFO
else
  makepkg --printsrcinfo > .SRCINFO
fi

grep -q PLACEHOLDER "$PKGBUILD" && {
  echo "::error::PKGBUILD still contains PLACEHOLDER" >&2
  exit 1
}

if git diff --quiet PKGBUILD .SRCINFO; then
  echo "No AUR changes — skipping push."
  exit 0
fi

cd "${WORK}/${AUR_REPO}"
if [ "$(id -u)" -eq 0 ]; then
  su builder -s /bin/bash -c "cd '${WORK}/${AUR_REPO}' && git add PKGBUILD .SRCINFO && git commit -m 'upgpkg: ${pkgname:-nats-horizon-bin} ${VERSION}' && git push"
else
  git add PKGBUILD .SRCINFO
  git commit -m "upgpkg: nats-horizon-bin ${VERSION}"
  git push
fi
