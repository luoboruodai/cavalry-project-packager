#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import struct
import tempfile
from urllib.parse import unquote
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "Project Packager.js"
VERSION_PATTERN = re.compile(r"^var SCRIPT_VERSION = '([^']+)'", re.MULTILINE)
LINK_PATTERN = re.compile(r"\[[^\]]*\]\(([^)]+)\)")


def script_version():
    match = VERSION_PATTERN.search(SOURCE.read_text(encoding="utf-8"))
    if not match:
        raise ValueError("SCRIPT_VERSION was not found")
    version = match.group(1)
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        raise ValueError("SCRIPT_VERSION must use semantic versioning")
    return version


def archive_name(version):
    return "Cavalry-Project-Packager-v{}.zip".format(version)


def package_prefix(version):
    return "Cavalry-Project-Packager-v{}".format(version)


def expected_members(version):
    prefix = package_prefix(version)
    return {
        prefix + "/Scripts/Project Packager.js": SOURCE,
        prefix + "/INSTALL.md": ROOT / "docs" / "INSTALL.md",
        prefix + "/INSTALL.zh-CN.md": ROOT / "docs" / "INSTALL.zh-CN.md",
        prefix + "/LICENSE": ROOT / "LICENSE",
    }


def markdown_target(raw_target):
    target = raw_target.strip()
    if target.startswith("<") and ">" in target:
        target = target[1:target.index(">")]
    else:
        target = target.split()[0]
    return target.split("#", 1)[0]


def validate_markdown_links(document, available=None):
    text = document.read_text(encoding="utf-8") if available is None else available[document]
    for raw_target in LINK_PATTERN.findall(text):
        target = markdown_target(raw_target)
        if not target or re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target):
            continue
        target = unquote(target)
        if available is None:
            resolved = (document.parent / target).resolve()
            if not resolved.is_file():
                raise ValueError("Broken Markdown link in {}: {}".format(document.relative_to(ROOT), target))
        else:
            resolved = str(Path(document).parent / target)
            if resolved not in available:
                raise ValueError("Broken offline Markdown link in {}: {}".format(document, target))


def validate_repository(version):
    documents = [ROOT / "README.md", ROOT / "README.zh-CN.md", ROOT / "CHANGELOG.md"]
    documents.extend(sorted((ROOT / "docs").glob("*.md")))
    documents.extend(sorted((ROOT / "packaging").glob("*.md")))
    for document in documents:
        validate_markdown_links(document)

    required_version_documents = [
        ROOT / "README.md",
        ROOT / "README.zh-CN.md",
        ROOT / "docs" / "INSTALL.md",
        ROOT / "docs" / "INSTALL.zh-CN.md",
        ROOT / "packaging" / "RELEASE-NOTES.md",
        ROOT / "packaging" / "ANNOUNCEMENT.md",
    ]
    for document in required_version_documents:
        if "v" + version not in document.read_text(encoding="utf-8"):
            raise ValueError("Version mismatch in {}".format(document.relative_to(ROOT)))

    changelog = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
    if "## {} —".format(version) not in changelog:
        raise ValueError("CHANGELOG.md has no entry for {}".format(version))

    banner = ROOT / "docs" / "assets" / "cavalry-project-packager-banner.svg"
    root = ET.parse(str(banner)).getroot()
    if root.attrib.get("viewBox") != "0 0 1200 300":
        raise ValueError("Unexpected banner viewBox")

    png = ROOT / "docs" / "assets" / "cavalry-project-packager-banner.png"
    data = png.read_bytes()
    if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("Banner export is not a PNG")
    if struct.unpack(">II", data[16:24]) != (1200, 300):
        raise ValueError("Banner PNG must be 1200x300")


def verify_archive(archive, version):
    members = expected_members(version)
    prefix = package_prefix(version)
    with zipfile.ZipFile(str(archive), "r") as bundle:
        names = bundle.namelist()
        if len(names) != len(set(names)) or set(names) != set(members):
            raise ValueError("Archive members do not match the release allowlist")
        damaged = bundle.testzip()
        if damaged:
            raise ValueError("Archive CRC check failed for {}".format(damaged))
        for name, source in members.items():
            if bundle.read(name) != source.read_bytes():
                raise ValueError("Archive content differs from source: {}".format(name))
        script_text = bundle.read(prefix + "/Scripts/Project Packager.js").decode("utf-8")
        match = VERSION_PATTERN.search(script_text)
        if not match or match.group(1) != version:
            raise ValueError("Archive SCRIPT_VERSION mismatch")
        offline = {name: bundle.read(name).decode("utf-8") for name in members if name.endswith(".md")}
        for name in offline:
            if "v" + version not in offline[name]:
                raise ValueError("Offline guide version mismatch: {}".format(name))
            validate_markdown_links(name, offline)
    return sorted(members)


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def verify_directory(directory, version):
    archive = directory / archive_name(version)
    checksums = directory / "SHA256SUMS.txt"
    if not archive.is_file() or not checksums.is_file():
        raise ValueError("Release ZIP or SHA256SUMS.txt is missing")
    digest = sha256(archive)
    expected = "{}  {}\n".format(digest, archive.name)
    if checksums.read_text(encoding="ascii") != expected:
        raise ValueError("SHA256SUMS.txt does not match the archive")
    members = verify_archive(archive, version)
    return {
        "version": version,
        "archive": str(archive),
        "sha256": digest,
        "members": members,
        "verified": True,
    }


def build(version):
    validate_repository(version)
    output = ROOT / "dist" / "release"
    output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".release-candidate-", dir=str(ROOT / "dist")) as temporary:
        candidate_dir = Path(temporary)
        candidate = candidate_dir / archive_name(version)
        with zipfile.ZipFile(str(candidate), "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
            for name, source in sorted(expected_members(version).items()):
                info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                bundle.writestr(info, source.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        digest = sha256(candidate)
        with (candidate_dir / "SHA256SUMS.txt").open("w", encoding="ascii", newline="\n") as handle:
            handle.write("{}  {}\n".format(digest, candidate.name))
        verify_directory(candidate_dir, version)
        os.replace(str(candidate), str(output / candidate.name))
        os.replace(str(candidate_dir / "SHA256SUMS.txt"), str(output / "SHA256SUMS.txt"))
    return verify_directory(output, version)


def main():
    parser = argparse.ArgumentParser(description="Build and verify Cavalry Project Packager release artifacts")
    parser.add_argument("--verify-dir", type=Path, help="Verify an existing release directory without rebuilding")
    args = parser.parse_args()
    version = script_version()
    if args.verify_dir:
        result = verify_directory(args.verify_dir.resolve(), version)
    else:
        result = build(version)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
