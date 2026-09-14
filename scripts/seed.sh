#!/usr/bin/env sh

set -eu

PRODUCTS_API_URL="${PRODUCTS_API_URL:-http://localhost:3002/api/products}"
USERS_API_URL="${USERS_API_URL:-http://localhost:3003/api/users}"
SHIPPING_API_URL="${SHIPPING_API_URL:-http://localhost:3004/api/shippings}"

command -v curl >/dev/null 2>&1 || {
  echo "curl is required" >&2
  exit 1
}

command -v jq >/dev/null 2>&1 || {
  echo "jq is required" >&2
  exit 1
}

delete_all() {
  resource_url="$1"
  curl -fsS "${resource_url}?page=1&limit=100" \
    | jq -r '.data[].id' \
    | while IFS= read -r id; do
        curl -fsS -X DELETE "${resource_url}/${id}" >/dev/null
      done
}

post_json() {
  resource_url="$1"
  payload="$2"
  curl -fsS -X POST "$resource_url" \
    -H 'Content-Type: application/json' \
    --data "$payload" >/dev/null
}

delete_all "$SHIPPING_API_URL"
delete_all "$PRODUCTS_API_URL"
delete_all "$USERS_API_URL"

post_json "$PRODUCTS_API_URL" '{"name":"Notebook Pro","price":1499,"quantity":18,"description":"High-performance workstation","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Mechanical Keyboard","price":129,"quantity":42,"description":"Hot-swappable mechanical keyboard","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"4K Monitor","price":699,"quantity":24,"description":"27-inch high-resolution display","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Wireless Headphones","price":249,"quantity":35,"description":"Noise-cancelling over-ear headphones","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"USB-C Dock","price":189,"quantity":30,"description":"Twelve-port desktop docking station","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Ergonomic Mouse","price":89,"quantity":56,"description":"Wireless vertical mouse","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Webcam Ultra","price":159,"quantity":28,"description":"4K webcam with autofocus","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Desk Lamp","price":79,"quantity":40,"description":"Adjustable LED task light","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Portable SSD","price":219,"quantity":33,"description":"Two-terabyte USB-C solid-state drive","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Smart Speaker","price":119,"quantity":27,"description":"Compact voice-enabled office speaker","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Standing Desk","price":849,"quantity":12,"description":"Electric height-adjustable desk","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Office Chair","price":579,"quantity":15,"description":"Breathable ergonomic task chair","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Tablet Air","price":799,"quantity":21,"description":"Lightweight tablet for mobile work","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Smartwatch","price":329,"quantity":38,"description":"Fitness and notification smartwatch","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Power Bank","price":69,"quantity":64,"description":"Fast-charging portable battery","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Action Camera","price":399,"quantity":19,"description":"Weather-resistant 4K action camera","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"E-reader","price":179,"quantity":31,"description":"Glare-free digital reading device","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Gaming Controller","price":74,"quantity":45,"description":"Wireless multi-platform controller","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Conference Microphone","price":289,"quantity":17,"description":"USB microphone for meeting rooms","active":true}'
post_json "$PRODUCTS_API_URL" '{"name":"Network Router","price":259,"quantity":23,"description":"Tri-band Wi-Fi 7 office router","active":true}'

post_json "$USERS_API_URL" '{"name":"Alice Johnson","email":"alice@example.com","role":"admin","active":true}'
post_json "$USERS_API_URL" '{"name":"James Wilson","email":"james@example.com","role":"manager","active":true}'
post_json "$USERS_API_URL" '{"name":"Emma Davis","email":"emma@example.com","role":"viewer","active":true}'
post_json "$USERS_API_URL" '{"name":"Michael Brown","email":"michael@example.com","role":"manager","active":true}'
post_json "$USERS_API_URL" '{"name":"Olivia Miller","email":"olivia@example.com","role":"viewer","active":true}'
post_json "$USERS_API_URL" '{"name":"Daniel Moore","email":"daniel@example.com","role":"viewer","active":true}'
post_json "$USERS_API_URL" '{"name":"Sophia Taylor","email":"sophia@example.com","role":"manager","active":true}'
post_json "$USERS_API_URL" '{"name":"William Anderson","email":"william@example.com","role":"viewer","active":true}'
post_json "$USERS_API_URL" '{"name":"Charlotte Thomas","email":"charlotte@example.com","role":"admin","active":true}'
post_json "$USERS_API_URL" '{"name":"Henry Jackson","email":"henry@example.com","role":"manager","active":true}'

echo "Seeded 20 products and 10 users through the HTTP APIs."
