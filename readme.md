Services management: 

Mongodb:
start / stop mongodb:
mongod --config /usr/local/etc/mongod.conf
-----------------------------------------------------------------------

Nginx:
start / stop nginx:
sudo nginx

port 8080 already taken issue:
	sudo lsof -i :8080
	kill -9 PID

port was clashing with port for zookeper, so we changed it in config to port 8081:

locate nginx config: 
	nginx -t

edit nginx config:
	sudo vim /usr/local/etc/nginx/nginx.conf
-----------------------------------------------------------------------
Rabbitmq
rabbitmq-plugins enable rabbitmq_management

sudo rabbitmq-server

------------------------------------------------------------------------
Kafka

/usr/local/bin/zookeeper-server-start /usr/local/etc/zookeeper/zoo.cfg
/usr/local/bin/kafka-server-start /usr/local/etc/kafka/server.properties