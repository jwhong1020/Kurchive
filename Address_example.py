import requests

def expand_naver_short_url(short_url: str) -> str:
    try:
        res = requests.get(short_url, allow_redirects=True, timeout=5)
        return res.url  # ← 최종 리디렉션된 전체 URL
    except Exception as e:
        print("에러:", e)
        return None


# 예시
url = "https://naver.me/GubwElwt"
real_url = expand_naver_short_url(url)
print(real_url)

