"""List only game sources and the compiled GitHub Pages directory."""
import base64, hashlib, json, pathlib, sys
root = pathlib.Path(__file__).resolve().parents[1]
if len(sys.argv) > 1:
    file = root / sys.argv[1]
    with file.open('rb') as stream:
        stream.seek(int(sys.argv[2]))
        print(base64.b64encode(stream.read(int(sys.argv[3]))).decode(), end='')
else:
    entries = []
    for name in ['src', 'public', 'tests', 'scripts', 'dist']:
        for file in sorted((root / name).rglob('*')):
            if file.is_file():
                local = file.relative_to(root).as_posix()
                entries.append((file, 'docs/' + local[5:] if local.startswith('dist/') else local))
    for name in ['.gitignore', 'package.json', 'package-lock.json', 'index.html', 'README.md', 'ASSETS_CREDITS.md']:
        entries.append((root / name, name))
    result = []
    for file, target in entries:
        data = file.read_bytes()
        sha = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        result.append(dict(local=file.relative_to(root).as_posix(), path=target, size=len(data), sha=sha))
    print(json.dumps(result))
