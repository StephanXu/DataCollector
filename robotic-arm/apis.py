from requests import Session
from urllib.parse import urljoin


class PrefixUrlSession(Session):
    def __init__(self, prefix_url=None, *args, **kwargs):
        super(PrefixUrlSession, self).__init__(*args, **kwargs)
        self.prefix_url = prefix_url

    def request(self, method, url, *args, **kwargs):
        url = urljoin(self.prefix_url, url)
        return super(PrefixUrlSession, self).request(method, url, *args, **kwargs)


class NetworkAPI():
    def __init__(self, base_url: str) -> None:
        self.session = PrefixUrlSession(base_url)

    def fetch_new_tasks(self):
        return self.session.get('task?status=unfinished').json()

    def submit_result(self, task_id: int, filename: str, content: str):
        data = {
            'filename': filename,
            'content':  content
        }
        return self.session.post(f'task/{task_id}', json=data).json()
