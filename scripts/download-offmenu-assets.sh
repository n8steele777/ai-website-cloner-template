#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="https://www.offmenu.design"

paths=(
  "/favicon.ico"
  "/favicon-light.svg"
  "/favicon-dark.svg"
  "/manifest.webmanifest"
  "/images/opengraph.jpg"
  "/fonts/Neue Montreal/PPNeueMontreal-Variable.woff2"
  "/fonts/Neue Montreal/woff2/PPNeueMontreal-Regular.woff2"
  "/fonts/Neue Montreal/woff2/PPNeueMontreal-Medium.woff2"
  "/fonts/Neue Montreal/woff2/PPNeueMontreal-Semibold.woff2"
  "/fonts/Neue Montreal/woff2/PPNeueMontreal-Italic.woff2"
  "/fonts/Neue Montreal/woff2/PPNeueMontreal-MediumItalic.woff2"
  "/images/work/resonant/thumbnail-light-xs@2x.webp"
  "/images/work/resonant/thumbnail-dark-xs@2x.webp"
  "/images/work/resonant/thumbnail-light-xl@2x.webp"
  "/images/work/resonant/thumbnail-dark-xl@2x.webp"
  "/images/work/controltower/thumbnail-light-xs@2x.webp"
  "/images/work/controltower/thumbnail-dark-xs@2x.webp"
  "/images/work/controltower/thumbnail-light-xl@2x.webp"
  "/images/work/controltower/thumbnail-dark-xl@2x.webp"
  "/images/work/ditto/thumbnail-light-xs@2x.webp"
  "/images/work/ditto/thumbnail-dark-xs@2x.webp"
  "/images/work/ditto/thumbnail-light-xl@2x.webp"
  "/images/work/ditto/thumbnail-dark-xl@2x.webp"
  "/images/work/hanover-park/thumbnail-light-xs@2x.webp"
  "/images/work/hanover-park/thumbnail-dark-xs@2x.webp"
  "/images/work/hanover-park/thumbnail-light-xl@2x.webp"
  "/images/work/hanover-park/thumbnail-dark-xl@2x.webp"
  "/images/work/super/thumbnail-light-xs@2x.webp"
  "/images/work/super/thumbnail-dark-xs@2x.webp"
  "/images/work/super/thumbnail-light-xl@2x.webp"
  "/images/work/super/thumbnail-dark-xl@2x.webp"
  "/images/work/tenacity/thumbnail-light-xs@2x.webp"
  "/images/work/tenacity/thumbnail-dark-xs@2x.webp"
  "/images/work/tenacity/thumbnail-light-xl@2x.webp"
  "/images/work/tenacity/thumbnail-dark-xl@2x.webp"
  "/images/work/utility/thumbnail-light-xs@2x.webp"
  "/images/work/utility/thumbnail-dark-xs@2x.webp"
  "/images/work/utility/thumbnail-light-xl@2x.webp"
  "/images/work/utility/thumbnail-dark-xl@2x.webp"
  "/images/work/flex/thumbnail-light-xs@2x.webp"
  "/images/work/flex/thumbnail-dark-xs@2x.webp"
  "/images/work/flex/thumbnail-light-xl@2x.webp"
  "/images/work/flex/thumbnail-dark-xl@2x.webp"
)

resolve_dest() {
  local path="$1"
  case "$path" in
    "/manifest.webmanifest") echo "${ROOT_DIR}/public/seo/manifest.webmanifest" ;;
    "/favicon.ico") echo "${ROOT_DIR}/public/seo/favicon.ico" ;;
    "/favicon-light.svg") echo "${ROOT_DIR}/public/seo/favicon-light.svg" ;;
    "/favicon-dark.svg") echo "${ROOT_DIR}/public/seo/favicon-dark.svg" ;;
    "/images/opengraph.jpg") echo "${ROOT_DIR}/public/seo/opengraph.jpg" ;;
    *) echo "${ROOT_DIR}/public${path}" ;;
  esac
}

for path in "${paths[@]}"; do
  dest="$(resolve_dest "$path")"
  mkdir -p "$(dirname "$dest")"
  encoded_path="${path// /%20}"
  curl -L --fail "${BASE_URL}${encoded_path}" -o "$dest"
done

printf "downloaded %s assets\n" "${#paths[@]}"
