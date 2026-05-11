import urllib.request, json

def fetch(port):
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{port}/api/tunnels', timeout=2) as r:
            data = json.loads(r.read().decode())
            tunnels = data.get('tunnels', [])
            return [t.get('public_url') for t in tunnels]
    except Exception as e:
        return f'error: {e}'

if __name__ == '__main__':
    for p in (4040, 4041):
        print(p, fetch(p))
