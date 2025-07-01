-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: pet_social
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comment_post` (`post_id`),
  KEY `idx_comment_user` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,2,'好可爱的小白！','2025-06-07 17:06:56'),(2,1,3,'看起来玩得很开心呢','2025-06-07 17:06:56'),(3,2,1,'我家小白也很喜欢这个玩具','2025-06-07 17:06:56'),(4,1,1,'可爱','2025-06-11 15:22:09'),(5,1,1,'小狗','2025-06-11 21:23:12'),(6,1,2,'好','2025-06-18 16:04:33'),(7,1,1,'可爱','2025-06-18 16:07:24'),(8,20,1,'内网穿透终于好了','2025-06-29 15:40:36'),(9,2,20,'ok','2025-06-29 20:20:10'),(10,3,1,'手机评论','2025-06-29 20:21:15'),(11,15,1,'手机','2025-06-29 20:21:49'),(12,11,22,'我是李庭锋','2025-06-30 09:42:53'),(13,2,20,'666','2025-07-01 09:08:00'),(14,11,1,'66','2025-07-01 09:25:03');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`post_id`,`user_id`),
  KEY `idx_like_post` (`post_id`),
  KEY `idx_like_user` (`user_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,1,2,'2025-06-07 17:06:56'),(2,1,3,'2025-06-07 17:06:56'),(3,2,1,'2025-06-07 17:06:56'),(4,2,3,'2025-06-07 17:06:56'),(5,3,1,'2025-06-07 17:06:56');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pets`
--

DROP TABLE IF EXISTS `pets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(50) NOT NULL,
  `species` varchar(50) NOT NULL,
  `gender` tinyint NOT NULL COMMENT '0:女 1:男',
  `age` int NOT NULL,
  `avatar` varchar(512) DEFAULT NULL,
  `description` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pet_user` (`user_id`),
  CONSTRAINT `pets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pets`
--

LOCK TABLES `pets` WRITE;
/*!40000 ALTER TABLE `pets` DISABLE KEYS */;
INSERT INTO `pets` VALUES (1,1,'小白','猫',1,12,'https://tse4-mm.cn.bing.net/th/id/OIP-C.OSSpGGBsWIyubjVlKnpdkwHaHa?w=193&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','一只可爱的英短','2025-06-07 17:06:56','2025-06-15 14:58:43'),(2,1,'旺财','狗',1,24,'https://tse4-mm.cn.bing.net/th/id/OIP-C.qHG0BaG1E3oHXSTZk6jWZAHaE7?w=258&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','金毛寻回犬','2025-06-07 17:06:56','2025-06-15 14:58:43'),(3,2,'咪咪','猫',0,8,'https://tse1-mm.cn.bing.net/th/id/OIP-C.fPykrHlT8GjyxIfnCOpIvgHaFT?w=282&h=202&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','优雅的布偶猫','2025-06-07 17:06:56','2025-06-15 14:58:43');
/*!40000 ALTER TABLE `pets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_tags`
--

DROP TABLE IF EXISTS `post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_tags` (
  `post_id` bigint unsigned NOT NULL,
  `tag_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `fk_post_tags_tag` (`tag_id`),
  CONSTRAINT `fk_post_tags_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_tags`
--

LOCK TABLES `post_tags` WRITE;
/*!40000 ALTER TABLE `post_tags` DISABLE KEYS */;
INSERT INTO `post_tags` VALUES (1,2),(2,2),(4,2),(5,2),(6,2),(1,3),(7,3),(8,3),(9,3),(2,4),(1,5),(2,5),(1,6),(2,7);
/*!40000 ALTER TABLE `post_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `cover_image` varchar(1024) DEFAULT NULL,
  `like_count` int DEFAULT '0',
  `comment_count` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_user` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,1,'和小白的日常','今天和小白一起玩耍，真开心！','https://tse1-mm.cn.bing.net/th/id/OIP-C.vEk5mdeCz3M2Lj9-xMAKpAHaHa?w=217&h=217&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',172,6,'2025-06-07 17:06:56','2025-06-18 16:07:24'),(2,2,'咪咪的新玩具','给咪咪买了新玩具，她超喜欢的！','https://tse3-mm.cn.bing.net/th/id/OIP-C.oWN2tdZpiihXkVycX_lwBQHaHa?w=173&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',126,2,'2025-06-07 17:06:56','2025-07-01 09:08:10'),(3,3,'铲屎官的日常','养宠物真是太有趣了，分享一些日常。','https://tse4-mm.cn.bing.net/th/id/OIP-C.FErJgRkyDd_hEdmNEUhMfgHaHa?w=184&h=184&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',100,1,'2025-06-07 17:06:56','2025-06-29 20:21:15'),(4,1,'萌宠测试1','test1','https://tse2-mm.cn.bing.net/th/id/OIP-C.vKskv3_gZgRQNReMol5D9wHaEK?w=295&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',0,0,'2025-06-12 18:12:01','2025-06-12 18:12:01'),(5,1,'萌宠测试1','test','https://tse2-mm.cn.bing.net/th/id/OIP-C.vKskv3_gZgRQNReMol5D9wHaEK?w=295&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',0,0,'2025-06-12 18:16:13','2025-06-12 18:16:13'),(6,1,'萌宠测试1','test','https://tse2-mm.cn.bing.net/th/id/OIP-C.vKskv3_gZgRQNReMol5D9wHaEK?w=295&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',3,0,'2025-06-12 18:16:18','2025-06-14 10:34:12'),(7,1,'萌宠测试2','test2','https://tse2-mm.cn.bing.net/th/id/OIP-C.vKskv3_gZgRQNReMol5D9wHaEK?w=295&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',5,0,'2025-06-12 18:23:09','2025-06-12 18:23:35'),(8,1,'萌宠测试3','test3','https://tse2-mm.cn.bing.net/th/id/OIP-C.vKskv3_gZgRQNReMol5D9wHaEK?w=295&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',0,0,'2025-06-12 18:26:16','2025-06-12 18:26:16'),(9,1,'萌宠测试4','test4','https://tse2-mm.cn.bing.net/th/id/OIP-C.vKskv3_gZgRQNReMol5D9wHaEK?w=295&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',1,0,'2025-06-12 18:28:08','2025-06-14 10:34:04'),(10,4,'狗狗的生日派对','今天是我家金毛的3岁生日，办了个小型派对，它超开心！','https://tse4-mm.cn.bing.net/th/id/OIP-C.rymr2DSrrxtCzOvR1cS5MwHaHa?w=210&h=210&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',8,3,'2025-06-08 09:15:22','2025-06-15 19:47:44'),(11,5,'猫咪的日常','我家英短每天最喜欢的事情就是晒太阳和睡觉','https://cbu01.alicdn.com/img/ibank/O1CN012x20Dx1o8whtiGPX4_!!2212100595181-0-cib.jpg',15,7,'2025-06-09 14:30:45','2025-07-01 09:25:03'),(12,6,'仓鼠的小窝','给仓鼠布置了个新窝，它很喜欢里面的小滑梯','https://tse1-mm.cn.bing.net/th/id/OIP-C.5vvKthX8SgNMux3ZR-JD7wHaIh?w=151&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',3,1,'2025-06-10 11:20:18','2025-06-15 19:48:24'),(13,2,'宠物美容记','带咪咪去做了美容，现在它是小区里最靓的仔','https://tse4-mm.cn.bing.net/th/id/OIP-C.rymr2DSrrxtCzOvR1cS5MwHaHa?w=210&h=210&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',22,7,'2025-06-11 16:45:33','2025-06-15 19:47:55'),(14,7,'鹦鹉学舌','我家鹦鹉最近学会了说\"你好\"，太可爱了','https://tse3-mm.cn.bing.net/th/id/OIP-C.WS4GGlFtu_UPavw3RPaPSAHaE7?w=254&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',6,2,'2025-06-12 10:05:55','2025-06-15 19:45:31'),(15,8,'乌龟的慢生活','我家乌龟每天慢悠悠的，但是很健康','https://tse4-mm.cn.bing.net/th/id/OIP-C.TzVajT85Qw18THk4447aIgHaE7?w=258&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',9,1,'2025-06-13 15:20:10','2025-06-29 20:22:34'),(16,3,'宠物摄影','尝试给我家狗狗拍了组艺术照，效果还不错','https://tse1-mm.cn.bing.net/th/id/OIP-C.vEk5mdeCz3M2Lj9-xMAKpAHaHa?w=217&h=217&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',19,4,'2025-06-14 13:30:40','2025-06-15 19:50:45'),(17,9,'宠物运动会','参加了宠物运动会，我家兔子得了跳高第二名','https://tse4-mm.cn.bing.net/th/id/OIP-C.FErJgRkyDd_hEdmNEUhMfgHaHa?w=184&h=184&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',11,3,'2025-06-15 09:45:22','2025-06-15 09:45:22'),(18,1,'宠物训练','经过一个月的训练，小白终于学会了坐下和握手','https://tse3-mm.cn.bing.net/th/id/OIP-C.oWN2tdZpiihXkVycX_lwBQHaHa?w=173&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',28,8,'2025-06-15 17:20:35','2025-06-15 19:48:41'),(19,5,'宠物美食','给我家猫咪做了顿营养餐，它吃得干干净净','https://tse3-mm.cn.bing.net/th/id/OIP-C.oWN2tdZpiihXkVycX_lwBQHaHa?w=173&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',12,2,'2025-06-15 18:10:15','2025-06-16 09:21:04'),(20,10,'宠物领养','今天领养了一只流浪猫，希望它以后能幸福','https://tse3-mm.cn.bing.net/th/id/OIP-C.5IlySxqfqxdn3QEWHU_I3AHaH0?w=176&h=185&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',36,1,'2025-06-15 19:50:45','2025-06-29 15:54:23');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `search_records`
--

DROP TABLE IF EXISTS `search_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `search_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `keyword` varchar(100) NOT NULL,
  `search_type` enum('pet','post') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `search_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_records`
--

LOCK TABLES `search_records` WRITE;
/*!40000 ALTER TABLE `search_records` DISABLE KEYS */;
INSERT INTO `search_records` VALUES (1,1,'小白','pet','2025-06-15 16:36:47'),(2,1,'小白','post','2025-06-15 16:36:47'),(3,1,'咪咪','post','2025-06-15 16:36:57'),(4,1,'咪咪','pet','2025-06-15 16:36:57'),(5,1,'猫','pet','2025-06-15 16:39:14'),(6,1,'猫','post','2025-06-15 16:39:14'),(7,1,'养宠知识','post','2025-06-15 19:04:00'),(8,1,'养宠知识','pet','2025-06-15 19:04:00'),(9,1,'宠物日常','pet','2025-06-15 19:06:27'),(10,1,'宠物日常','post','2025-06-15 19:06:27'),(11,1,'柴犬','pet','2025-06-15 19:06:31'),(12,1,'柴犬','post','2025-06-15 19:06:31'),(13,1,'养宠知识','','2025-06-15 19:11:44'),(14,1,'养宠知识','','2025-06-15 19:11:54'),(15,1,'test','','2025-06-15 19:12:35'),(16,1,'养宠知识','','2025-06-17 19:05:53'),(17,1,'猫','','2025-06-17 19:05:59'),(18,1,'养宠知识','','2025-06-18 10:58:04'),(19,1,'宠物日常','','2025-06-18 13:46:50'),(20,2,'猫','pet','2025-06-18 14:15:10'),(21,2,'猫','post','2025-06-18 14:15:10'),(22,2,'小白','pet','2025-06-18 15:55:54'),(23,2,'小白','post','2025-06-18 15:55:54'),(28,1,'猫','','2025-07-01 09:35:09');
/*!40000 ALTER TABLE `search_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `search_count` int unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'狗',5),(2,'猫',47),(3,'柴犬',11),(4,'布偶猫',7),(5,'养宠知识',23),(6,'宠物日常',14),(7,'萌宠日记',8),(8,'萌宠测试',0),(9,'test',17),(37,'萌宠',2),(58,'小白',10),(86,'李庭锋',2);
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL COMMENT '电话号',
  `email` varchar(255) DEFAULT NULL,
  `avatar` varchar(512) DEFAULT ' https://ts4.tc.mm.bing.net/th/id/OIP-C.5VNSXIg1P1MttnuRViKOWwAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'lyles2163','$2b$10$abcdefghijklmnopqrstuv','13631155285','565641212@163.com','https://tse4-mm.cn.bing.net/th/id/OIP-C._L4bc3IzzUIExu1cPQ2HsgAAAA?w=171&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','2025-06-07 17:06:56','2025-07-01 09:01:15'),(2,'test_user2','$2b$10$abcdefghijklmnopqrstuv','13631155286','user2@example.com','https://ts1.tc.mm.bing.net/th/id/OIP-C.uMf5AX3a6yYpIhpEkyDxiQAAAA?w=200&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2','2025-06-07 17:06:56','2025-06-18 14:14:16'),(3,'test_user3','$2b$10$abcdefghijklmnopqrstuv','136311552857','user3@example.com','https://ts1.tc.mm.bing.net/th/id/OIP-C.Kj_fCC5KznoJJB12IVUoHwAAAA?w=199&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2','2025-06-07 17:06:56','2025-06-28 20:22:22'),(4,'test','$2b$10$abcdefghijklmnopqrstuv','136311552858','user4@example.com','https://img2.baidu.com/it/u=199363802,1916398725&fm=253&fmt=auto&app=120&f=JPEG?w=503&h=500','2025-06-07 17:06:56','2025-06-29 20:16:38'),(5,'john_doe','password123','13631155289','john.doe@example.com','https://img1.baidu.com/it/u=1466043940,779429976&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500','2025-06-09 08:56:53','2025-06-29 20:15:25'),(6,'jane_smith','securepass456','13631155299','jane.smith@example.org','https://th.bing.com/th/id/OIP.RRmRd57uE43wlHiawIuR0QAAAA?w=171&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','2025-06-09 08:56:53','2025-06-28 20:22:22'),(7,'mike_jones','mypass789','12631155285','mike.jones@example.net','https://img1.baidu.com/it/u=1810144852,3699584189&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500','2025-06-09 08:56:53','2025-06-29 20:17:44'),(8,'sarah_lee','letmein123','14631155285','sarah.lee@example.co','https://img1.baidu.com/it/u=3985150573,583103601&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500','2025-06-09 08:56:53','2025-06-29 20:23:19'),(9,'alex_wong','passw0rd!','15631155285','alex.wong@example.io','https://img1.baidu.com/it/u=3829272826,4235199634&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500','2025-06-09 08:56:53','2025-06-29 20:17:11'),(10,'joh','password123','17631155285','john.doe@example1.com','https://img2.baidu.com/it/u=144926030,3439595835&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500','2025-06-09 10:10:34','2025-06-29 20:15:25'),(11,'jane','securepass456','18631155285','jane.smith@exampl1e.org','https://th.bing.com/th/id/OIP.54qlbLNAZ64K94c_DCT-qAAAAA?w=154&h=166&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','2025-06-09 10:10:34','2025-06-28 20:22:22'),(12,'mike_j','letmein123','19631155285','sarah.lee@example1.co','https://img1.baidu.com/it/u=1637142835,3949135594&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500','2025-06-09 10:10:34','2025-06-29 20:16:38'),(13,'alex_wg1','passw0rd!','13131155285','alex.wong@example1.io','https://th.bing.com/th/id/OIP.jX1ixj68l-Ot9NMkW_m_9wAAAA?w=174&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','2025-06-09 10:10:34','2025-06-28 20:22:22'),(14,'user_FKS36','','12345698745','','https://th.bing.com/th/id/OIP.jX1ixj68l-Ot9NMkW_m_9wAAAA?w=174&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','2025-06-09 11:02:00','2025-06-18 09:57:04'),(20,'用户9518','','18928109518',NULL,' https://ts4.tc.mm.bing.net/th/id/OIP-C.5VNSXIg1P1MttnuRViKOWwAAAA?rs=1&pid=ImgDetMain&o=7&rm=3','2025-06-29 20:12:04','2025-06-29 20:12:04'),(21,'用户9519','','18928109519',NULL,' https://ts4.tc.mm.bing.net/th/id/OIP-C.5VNSXIg1P1MttnuRViKOWwAAAA?rs=1&pid=ImgDetMain&o=7&rm=3','2025-06-29 20:30:17','2025-06-29 20:30:17'),(22,'用户4394','','13590774394',NULL,' https://ts4.tc.mm.bing.net/th/id/OIP-C.5VNSXIg1P1MttnuRViKOWwAAAA?rs=1&pid=ImgDetMain&o=7&rm=3','2025-06-30 09:40:34','2025-06-30 09:40:34'),(23,'用户8611','','1008611',NULL,' https://ts4.tc.mm.bing.net/th/id/OIP-C.5VNSXIg1P1MttnuRViKOWwAAAA?rs=1&pid=ImgDetMain&o=7&rm=3','2025-06-30 09:46:42','2025-06-30 09:46:42'),(24,'用户9380','','15917539380',NULL,' https://ts4.tc.mm.bing.net/th/id/OIP-C.5VNSXIg1P1MttnuRViKOWwAAAA?rs=1&pid=ImgDetMain&o=7&rm=3','2025-06-30 20:42:05','2025-06-30 20:42:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01  9:53:04
