Table users {
  id int [pk, increment] // 시스템 ID
  userid varchar(50) [unique, not null] // 로그인 때 사용하는 ID
  password varchar(100)
  name varchar(20) // 이름
  nickname varchar(20)
  role enum('member', 'staff', 'admin') [default: 'member']
  created_at datetime
}

// 기능 단위 정리 테이블
Table permissions {
  id int [pk, increment]
  name varchar(50) [unique]
  description text // 권한 설명
}

// 각 역할(role) 에게 어떤 권한을 기본적으로 주는지 설정
Table role_permissions {
  id int [pk, increment]
  role enum('member', 'staff', 'admin')
  permission_id int [ref: > permissions.id]
  is_enabled boolean
}

//특정 사용자가 특정 권한을 가졌는지 여부를 명시적으로 기록한 테이블
Table user_permissions {
  id int [pk, increment] // 권한 id
  user_id int [ref: > users.id]
  permission_id int [ref: > permissions.id]
  is_enabled boolean
}

//커손연 코드
Table signup_code {
  id int [pk, increment]
  code varchar(20) [not null]         // 현재 사용 중인 코드
  is_active boolean [default: true]   // 현재 활성화된 코드인지 여부
  changed_by int [ref: > users.id]    // 변경한 관리자
  changed_at datetime                 // 변경 시각
}

// 식당 정보
Table restaurants {
  id int [pk, increment] // 식당에 부여되는 백엔드 자체 ID
  name varchar(50) // 식당 이름
  address varchar(100) // 지도 링크에서 추출한 주소
  location_link text // 지도 링크
  uploaded_by int [ref: > users.id] // 업로더 사용자 ID
  rating float // 추천 정도
  description text // 후기
  created_at datetime
}

// 식당 태그
Table restaurant_tags {
  id int [pk, increment]
  restaurant_id int [ref: > restaurants.id]
  tag_type enum('category', 'mood', 'feature', 'custom')
  tag_value varchar(50)
}

// ------------------------------------------------------------
//레시피

// 재료 테이블
Table ingredients {
  id int [pk, increment]
  name varchar(100)                // 예: 다진 마늘, 쪽파, 대파
  density float                    // g/ml, 변환용
  average_weight float             // 개당 무게 (optional)
  unit_type enum('liquid', 'powder', 'vegetable', 'etc')
}

// 단위 테이블
Table volume_units {
  id int [pk, increment]
  name varchar(20) [unique, not null]   // 'T', 't', 'cup', '개', '단', '대' 등
  ml_per_unit float                     // 변환용, 없는 경우 NULL 가능
  is_general boolean [default: true]    // 일반 vs 특수 단위 구분 (optional)
}

// 재료-단위 연결 테이블 (가능한 단위)
Table ingredient_units {
  id int [pk, increment]
  ingredient_id int [ref: > ingredients.id]
  unit_id int [ref: > volume_units.id]
}

// 레시피 테이블
Table recipes {
  id int [pk, increment]
  title varchar(100) [not null]
  uploader_id int [ref: > users.id]
  base_serving int [not null]             // 기준 인분
  instruction text
  created_at datetime
}

// 레시피 입력 재료 테이블
Table recipe_ingredients {
  id int [pk, increment]
  recipe_id int [ref: > recipes.id]
  ingredient_id int [ref: > ingredients.id]
  quantity float [not null]
  unit_id int [ref: > volume_units.id]    // 단위 (T, g, 개, 등)
}

//--------------------------------------------------------
// 나중에 좋아요 기능 추가시 활용
Table favorites {
  id int [pk, increment]
  user_id int [ref: > users.id]
  restaurant_id int [ref: > restaurants.id]
  created_at datetime
}

// 나중에 코멘트 기능시 활용
Table comments {
  id int [pk, increment]
  user_id int [ref: > users.id]
  restaurant_id int [ref: > restaurants.id]
  content text
  created_at datetime
}

// 관리자 로그
Table admin_logs {
  id int [pk, increment]
  admin_id int [ref: > users.id]
  action_type varchar(50)
  target_user int [ref: > users.id]
  detail text
  created_at datetime
}
