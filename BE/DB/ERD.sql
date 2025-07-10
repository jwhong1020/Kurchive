Table users {
  id int [pk, increment]
  username varchar(50) [unique, not null] // 로그인 ID
  password varchar(100) [not null]
  name varchar(50) [not null]
  nickname varchar(50)
  role enum('member', 'staff', 'admin') [default: 'member']
  has_recipe_permission boolean [default: false] // 임원진 여부
  created_at datetime [default: current_timestamp]
}

Table verification_codes {
  id int [pk, increment]
  code varchar(20) [unique]
  valid boolean [default: true]
  created_by int [ref: > users.id]
  created_at datetime [default: current_timestamp]
}

Table restaurants {
  id int [pk, increment]
  name varchar(100)
  address varchar(200)
  location_link text // 지도 링크
  uploaded_by int [ref: > users.id]
  rating float
  description text
  created_at datetime [default: current_timestamp]
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
  created_at datetime [default: current_timestamp]
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
  created_at datetime [default: current_timestamp]
}
