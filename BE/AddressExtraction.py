from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup

import requests
import re

from BE.keys import KAKAO_REST_API_KEY

# 단축 URL 풀기

def expand_short_url(short_url: str) -> str:
    try:
        res = requests.get(short_url, allow_redirects=True, timeout=5)
        return res.url  # ← 최종 리디렉션된 전체 URL
    except Exception as e:
        print("에러:", e)
        return None

# 장소 id 추출
## 1. 네이버
def extract_naver_place_id(full_url: str) -> str:
    match = re.search(r'/place/(\d+)', full_url)
    if match:
        return match.group(1)
    return None

## 2. 카카오
def extract_kakao_place_id(full_url: str) -> str:
    parsed = urlparse(full_url)
    query_params = parse_qs(parsed.query)
    item_id = query_params.get('itemId')
    return item_id[0] if item_id else None

# 주소 추출
## 1. 네이버
def get_address(url : str):
    full_url = expand_short_url(url)
    place_id = extract_naver_place_id(full_url)
    
    print("Full URL:", full_url)
    print("Place ID:", place_id)
    
    url = f'https://map.naver.com/p/api/place/summary/{place_id}'
    headers = {
        'User-Agent': 'Mozilla/5.0',
        'Referer': f'https://map.naver.com/p/entry/place/{place_id}'
    }

    res = requests.get(url, headers=headers)
    data = res.json()
    road_address = data.get("data", {}).get("nmapSummaryBusiness", {}).get("roadAddress")
    
    if not road_address:
        message = "주소 정보가 없습니다."
        print(message)
    else:
        return road_address

## 2. 카카오에서 주소 파싱

### 1단계 : 
def extract_coords(html):
    x_match = re.search(r'"lng":([0-9.]+)', html)
    y_match = re.search(r'"lat":([0-9.]+)', html)
    if x_match and y_match:
        return x_match.group(1), y_match.group(1)
    return None, None

### 2단계 : 좌표를 주소로 변환
def get_address_from_coord(x, y, api_key):
    url = f'https://dapi.kakao.com/v2/local/geo/coord2address.json?x={x}&y={y}'
    headers = {'Authorization': f'KakaoAK {api_key}'}
    res = requests.get(url, headers=headers)
    return res.json()

def get_kakao_address(url):
    full_url = expand_short_url(url)
    place_id = extract_kakao_place_id(full_url)
    
    print("Full URL:", full_url)
    print("Place ID:", place_id)
    url = f'https://place.map.kakao.com/m/{place_id}'
    headers = {'User-Agent': 'Mozilla/5.0'}

    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')

    text = soup.get_text()
    # 도로명 주소 같은 텍스트가 포함돼 있는지 확인
    return text


# # 네이버 예시
# url = "https://naver.me/GubwElwt"
# road_address = get_address(url)
# print("도로명 : ",road_address)

## 카카오
url = "https://kko.kakao.com/9oC2Kr7EFq"

a = get_kakao_address(url)
print(a)