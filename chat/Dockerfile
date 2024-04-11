FROM nginx:alpine
RUN apk add git
WORKDIR /var/www/html/
COPY . /var/www/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000

