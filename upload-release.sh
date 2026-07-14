#!/bin/bash
set -e

# Upload release assets to GitHub
# Usage: GITHUB_TOKEN=<token> ./upload-release.sh <tag>
# Example: GITHUB_TOKEN=ghp_xxxx ./upload-release.sh v1.0.0
#
# The GitHub token is read from the GITHUB_TOKEN environment variable so it
# does not leak into the process list / shell history.

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set."
    echo "Usage: GITHUB_TOKEN=<token> ./upload-release.sh <tag>"
    exit 1
fi

TAG=$1
TOKEN="$GITHUB_TOKEN"

if [ -z "$TAG" ]; then
    echo "Usage: GITHUB_TOKEN=<token> ./upload-release.sh <tag>"
    echo "Example: GITHUB_TOKEN=ghp_xxxx ./upload-release.sh v1.0.0"
    exit 1
fi

REPO="amir-baghshahy/nats-horizon"

# Get release ID
echo "Getting release ID for ${TAG}..."
RELEASE_ID=$(curl -s \
    -H "Authorization: token ${TOKEN}" \
    "https://api.github.com/repos/${REPO}/releases/tags/${TAG}" | \
    grep -o '"id": [0-9]*' | head -1 | cut -d' ' -f2)

if [ -z "$RELEASE_ID" ]; then
    echo "Release ${TAG} not found!"
    exit 1
fi

echo "Release ID: ${RELEASE_ID}"

# Upload assets
for file in dist/*.tar.gz dist/*.zip; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "Uploading ${filename}..."
        curl -s \
            -X POST \
            -H "Authorization: token ${TOKEN}" \
            -H "Content-Type: application/octet-stream" \
            "https://uploads.github.com/repos/${REPO}/releases/${RELEASE_ID}/assets?name=${filename}" \
            --data-binary "@${file}"
        echo ""
    fi
done

echo "Upload complete!"
