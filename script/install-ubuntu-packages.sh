#!/usr/bin/env bash
set -euo pipefail

# CI dependencies come from the runner's signed Ubuntu archive. Unrelated
# preinstalled vendor repositories must not govern these build prerequisites.
if (( $# == 0 )); then
  echo "Usage: sudo bash script/install-ubuntu-packages.sh PACKAGE..." >&2
  exit 2
fi
sources=/etc/apt/sources.list.d/ubuntu.sources
if [[ ! -r "$sources" ]]; then
  echo "Required Ubuntu source configuration is unreadable: $sources" >&2
  exit 2
fi

export DEBIAN_FRONTEND=noninteractive
options=(
  -o "Dir::Etc::sourcelist=$sources"
  -o "Dir::Etc::sourceparts=-"
  -o "DPkg::Lock::Timeout=300"
  -o "Acquire::Retries=5"
  -o "Acquire::http::Timeout=20"
  -o "APT::Update::Error-Mode=any"
)
apt-get "${options[@]}" update
apt-get "${options[@]}" install -y -- "$@"
