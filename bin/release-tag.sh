#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage:
  ./bin/release-tag.sh <major|minor|patch|x.y.z> [--no-push]

Examples:
  ./bin/release-tag.sh patch
  ./bin/release-tag.sh minor
  ./bin/release-tag.sh 1.2.3
  ./bin/release-tag.sh 1.2.3 --no-push

Behavior:
  - Updates version in package.json and app.config.ts
  - Commits changes with message: chore(release): vX.Y.Z
  - Creates or updates git tag: vX.Y.Z
  - Pushes current branch and tag to origin (unless --no-push)
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" || $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit $([[ $# -lt 1 || $# -gt 2 ]] && echo 1 || echo 0)
fi

VERSION_ARG="$1"
NO_PUSH="false"
if [[ "${2:-}" == "--no-push" ]]; then
  NO_PUSH="true"
elif [[ -n "${2:-}" ]]; then
  echo "Unknown option: $2"
  usage
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git command is required"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Please commit/stash changes first."
  exit 1
fi

current_version="$(python3 - <<'PY'
import re
from pathlib import Path
text = Path('app.config.ts').read_text(encoding='utf-8')
m = re.search(r'\bversion:\s*"(\d+\.\d+\.\d+)"', text)
if not m:
    raise SystemExit('Could not read current version from app.config.ts')
print(m.group(1))
PY
)"

semver_re='^[0-9]+\.[0-9]+\.[0-9]+$'

bump_version() {
  local base="$1"
  local level="$2"

  IFS='.' read -r major minor patch <<<"$base"
  case "$level" in
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    patch)
      patch=$((patch + 1))
      ;;
    *)
      echo "Unsupported bump level: $level"
      exit 1
      ;;
  esac

  echo "$major.$minor.$patch"
}

target_version=""
if [[ "$VERSION_ARG" =~ $semver_re ]]; then
  target_version="$VERSION_ARG"
elif [[ "$VERSION_ARG" == "major" || "$VERSION_ARG" == "minor" || "$VERSION_ARG" == "patch" ]]; then
  target_version="$(bump_version "$current_version" "$VERSION_ARG")"
else
  echo "Invalid version argument: $VERSION_ARG"
  usage
  exit 1
fi

if [[ "$target_version" == "$current_version" ]]; then
  echo "Target version is same as current version: $target_version"
  exit 1
fi

tag="v$target_version"
branch="$(git rev-parse --abbrev-ref HEAD)"

local_tag_exists="false"
if git rev-parse "$tag" >/dev/null 2>&1; then
  local_tag_exists="true"
fi

remote_tag_exists="false"
if git ls-remote --exit-code --tags origin "refs/tags/$tag" >/dev/null 2>&1; then
  remote_tag_exists="true"
fi

echo ""
echo "Release plan"
echo "  Current version : $current_version"
echo "  Target version  : $target_version"
echo "  Branch          : $branch"
echo "  Tag             : $tag"
echo "  Push to origin  : $([[ "$NO_PUSH" == "true" ]] && echo "no" || echo "yes")"
if [[ "$local_tag_exists" == "true" || "$remote_tag_exists" == "true" ]]; then
  echo "  NOTE            : tag $tag already exists and will be moved"
fi

echo ""
read -r -p "Proceed with release operation? [y/N]: " confirmed
if [[ ! "$confirmed" =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

python3 - "$target_version" <<'PY'
import re
import sys
from pathlib import Path

new_version = sys.argv[1]

package_path = Path('package.json')
package_text = package_path.read_text(encoding='utf-8')
package_updated, package_count = re.subn(
    r'("version"\s*:\s*")(\d+\.\d+\.\d+)(")',
    rf'\g<1>{new_version}\g<3>',
    package_text,
    count=1,
)
if package_count != 1:
    raise SystemExit('Failed to update version in package.json')
package_path.write_text(package_updated, encoding='utf-8')

app_config_path = Path('app.config.ts')
app_config_text = app_config_path.read_text(encoding='utf-8')
app_config_updated, app_config_count = re.subn(
    r'(\bversion\s*:\s*")(\d+\.\d+\.\d+)(")',
    rf'\g<1>{new_version}\g<3>',
    app_config_text,
    count=1,
)
if app_config_count != 1:
    raise SystemExit('Failed to update version in app.config.ts')
app_config_path.write_text(app_config_updated, encoding='utf-8')
PY

git add package.json app.config.ts
git commit -m "chore(release): v$target_version"

if [[ "$local_tag_exists" == "true" ]]; then
  git tag -d "$tag" >/dev/null
fi

git tag -a "$tag" -m "Release $tag"

if [[ "$NO_PUSH" == "false" ]]; then
  echo ""
  read -r -p "Push branch and tag to origin now? [y/N]: " push_confirmed
  if [[ "$push_confirmed" =~ ^[Yy]$ ]]; then
    git push origin HEAD
    if [[ "$remote_tag_exists" == "true" ]]; then
      git push --force origin "$tag"
    else
      git push origin "$tag"
    fi
    echo "Release completed: $tag"
  else
    echo "Push skipped."
    echo "Run manually:"
    echo "  git push origin HEAD"
    if [[ "$remote_tag_exists" == "true" ]]; then
      echo "  git push --force origin $tag"
    else
      echo "  git push origin $tag"
    fi
  fi
else
  echo ""
  echo "Local release prepared. Push manually:"
  echo "  git push origin HEAD"
  if [[ "$remote_tag_exists" == "true" ]]; then
    echo "  git push --force origin $tag"
  else
    echo "  git push origin $tag"
  fi
fi
