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


Table verification_codes {
  id int [pk, increment]
  code varchar(20) [unique]
  valid boolean [default: true]
  created_by int [ref: > users.id]
  created_at datetime
}

Table restaurants {
  id int [pk, increment]
  name varchar(100)
  address varchar(200)
  location_link text // 지도 링크
  uploaded_by int [ref: > users.id]
  rating float
  description text
  created_at datetime
}

Table restaurant_tags {
  id int [pk, increment]
  restaurant_id int [ref: > restaurants.id]
  tag_type enum('category', 'mood', 'feature', 'custom')
  tag_value varchar(50)
}

Table recipes {
  id int [pk, increment]
  title varchar(100)
  uploader_id int [ref: > users.id]
  base_serving int // 기준 인분
  instruction text
  created_at datetime
}

Table ingredients {
  id int [pk, increment]
  name varchar(100)
  density float // g/ml, 변환용
  average_weight float // 개당 무게 (채소류 등)
  unit_type enum('liquid', 'powder', 'vegetable', 'etc')
}

Table recipe_ingredients {
  id int [pk, increment]
  recipe_id int [ref: > recipes.id]
  ingredient_id int [ref: > ingredients.id]
  quantity float
  unit varchar(20) // 'g', 'ml', 'T', 't', 'cup', '개' 등
}

Table favorites {
  id int [pk, increment]
  user_id int [ref: > users.id]
  restaurant_id int [ref: > restaurants.id]
  created_at datetime
}

Table comments {
  id int [pk, increment]
  user_id int [ref: > users.id]
  restaurant_id int [ref: > restaurants.id]
  content text
  created_at datetime
}

Table admin_logs {
  id int [pk, increment]
  admin_id int [ref: > users.id]
  action_type varchar(50)
  target_user int [ref: > users.id]
  detail text
  created_at datetime
}
