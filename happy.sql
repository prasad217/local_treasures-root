-- MySQL dump 10.13  Distrib 8.3.0, for macos14 (arm64)
--
-- Host: localhost    Database: happy
-- ------------------------------------------------------
-- Server version	8.3.0

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
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expiry` timestamp NULL DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES (1,'hari','3427637264','2024-04-02','neelikiran93@gmail.com','SHANTHI NAGAR,GUDIVADA','AP37 CQ0266','932280','2024-04-08 11:43:02',1,NULL),(2,'CHOKAMELA KALI PRASADA MANI M','09866515999','2024-04-10','prasad@gmail.com','SHANTHI NAGAR,GUDIVADA','AP37 CQ0266','668772','2024-04-08 11:53:39',1,NULL),(3,'neeli','654632564','2024-04-03','neeliharikiran@gmail.com','SHANTHI NAGAR,GUDIVADA','0266','576000','2024-04-08 12:00:48',1,'$2b$10$0JDHZ.JnaGCXGKAlWwWhCOxS1jpTlZDk7Cv7xyuXaFNZHhm9x9sLm'),(5,'shiley kiran','3242342343','2003-02-04','nk0339@srmist.edu.in','shiley gundalooo','bh80885','468000','2024-04-27 08:48:15',1,'$2b$10$hjVdDWCf1/6q4sNvIF71xuPLN1Cn7SZ2VvPhheFI5BPCfGCpGTCwG');
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (2,3,3,85000.00,'https://imgeng.jagran.com/images/2024/jan/samsung-s24-ultra-price1705584905756.jpg','samsung s24 ultra',1),(3,3,5,230000.00,'https://deepwatermgmt.com/wp-content/uploads/2023/10/Apple-WWCD23-Vision-Pro-with-battery-230605.jpg','vision pro',1),(6,3,1,2000.00,'https://dlcdnwebimgs.asus.com/files/media/135B75ED-C0F7-4BB9-928F-2B1A1E9CB34F/v1/img/design/color/strix-g-2022-green.png','assus rogsrix g17',1),(10,3,8,12000.00,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW-jjnk2hGEV_t3KhnJnrHU7ZqTpLzSvHXeA&usqp=CAU','gaming chair',1),(11,3,9,400.00,'https://m.media-amazon.com/images/I/71e-HtTY61L._AC_UL800_.jpg','toy gun',1),(12,3,16,19000.00,'https://aws-obg-image-lb-2.tcl.com/content/dam/brandsite/region/in/blog/pc/detail/blog-october/the-history-of-the-washing-machine-banner.jpg','washing machine',1);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DEALERS`
--

DROP TABLE IF EXISTS `DEALERS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DEALERS` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `age` int NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shop_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `shopGST` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DEALERS`
--

LOCK TABLES `DEALERS` WRITE;
/*!40000 ALTER TABLE `DEALERS` DISABLE KEYS */;
INSERT INTO `DEALERS` VALUES (1,'CHOKAMELA KALI PRASADA MANI M','9866515999','admin@gmail.com',19,'SHANTHI NAGAR,GUDIVADA','admin','https://www.google.com/maps?q=12.8234466,80.0424317','skp','107907','2024-07-12 14:40:07',NULL,0),(2,'prasad','933487823974','dealer@gmail.com',23,'SHANTHI NAGAR,GUDIVADA','delaer','https://www.google.com/maps?q=12.823441,80.0424285','ram ','945503','2024-06-23 13:42:27',NULL,0),(3,'prasad','986651','deva@gmail.com',12,'chennai','$2b$10$a4z9tTPGPhjB6JzyumX1B.sSGPaUyB6DY3HfFVGa9mApCGy57wlrK','https://www.google.com/maps?q=12.8232357,80.0423961','skp','535160','2024-04-21 08:26:55',NULL,1),(6,'PRASAD MEKALA','9866515998','prasadmekala127@gmail.com',24,'8/332 SHANTHI NAGAR','$2b$10$dYZPah5qg/lRpQWRM/2P.uhn/EdyxhterCU/JpH1pm3RlhuVaLIjG','https://www.google.com/maps?q=12.8234973,80.0424277','skp',NULL,NULL,NULL,0),(8,'prasad','9804359999','cr6473@srmist.edu.in',20,'srm','$2b$10$MO1YcOEFykDeWkSqMUKYeO/4POcDKJ/ZH6w/nRV5vJfXlv1ygLAbO','https://www.google.com/maps?q=12.8234213,80.0423869','skp','943352','2024-04-21 08:55:43',NULL,1),(9,'hari kiran','6300603705','nk0339@srmist.edu.in',21,'shanthi nagar','$2b$10$nPvjmSne370c/QEk5UZn1u5p7ZvIOmV/6J8Kc5zHOPrXgsZeZjv2O','https://www.google.com/maps?q=12.8234511,80.0424032','shiley',NULL,NULL,NULL,0),(18,'CHOKAMELA KALI PRASADA MANI M','09866515998','mekalaramu999@gmail.com',45,'SHANTHI NAGAR,GUDIVADA','$2b$12$rEHiyLHn.j/iAzoRisXgqu4SMSratgskD9tLpfCH6s1St8ZQM9MCm','https://www.google.com/maps?q=17.6920691,83.2425711','BABU','622709','2024-04-20 18:32:41','GSTIN122335',0),(20,'mekala ramu','9804359998','mekalaramu99@gmail.com',40,'SHANTHI NAGAR,GUDIVADA','$2b$12$avxwks9R8X8lXR.ZE3u0TeCfnRo/KZwmlmqCBxdFaThuTregjqH2C','https://www.google.com/maps?q=16.4440601,80.99744','SKP ','609791','2024-04-20 18:38:23','GSTIN122333',1),(21,'arun','831725835','prasad99@gmail.com',23,'8/332 SHANTHI NAGAR','$2b$12$iwXdMHJeI6nW3PBm..BObuNR6xbFeevbZjdPyUtFeYn7ffdvZtNiO','https://www.google.com/maps?q=17.6920691,83.2425711','HAPPY','840573','2024-04-20 18:49:24','GSTIN122335',1),(22,'prasad','09866515997','happy@gmail.com',20,'shanthi nagar','$2b$12$YRNe0I/ru9whk9mxVWK/LeLntyU10HZWB0zIa021CZAUbYV0Rmr9u','https://www.google.com/maps?q=17.6920691,83.2425711','ram','389667','2024-04-21 09:25:40','37AISPM6373L1ZC',0);
/*!40000 ALTER TABLE `DEALERS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_agents`
--

DROP TABLE IF EXISTS `delivery_agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_agents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `licence_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_code` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_agents`
--

LOCK TABLES `delivery_agents` WRITE;
/*!40000 ALTER TABLE `delivery_agents` DISABLE KEYS */;
INSERT INTO `delivery_agents` VALUES (1,'neelikiran93@gmail.com','$2b$10$Qifd..3q/uh6l7QAGDz9Te0AC4/lXD/3OFz5kzqoP2Q5OhHxPLxYe',NULL,NULL,NULL,NULL,'333385',0,'2024-04-07 13:02:26','2024-04-07 13:02:26'),(2,'cr6473@srmist.edu.in','$2b$10$L82XwZxiA7Ft4xMLjt28Fef5i.wZeh.J2XDq8JQ6J0mJ3Q6pu7knG',NULL,NULL,NULL,NULL,'348409',0,'2024-04-07 13:06:34','2024-04-07 13:06:34'),(3,'mani@gmail.com','$2b$10$2EGr21NW5P03fKKXAfSXMeL12Ys7jOLHSkmio3KOoOIB5lSrc4wLS',NULL,NULL,NULL,NULL,'643880',0,'2024-04-07 14:09:05','2024-04-07 14:09:05'),(4,'neeliharikiran@gmail.com','$2b$10$yvZiBnNgY7KizQVC2IGeHOQBFWwLXbCo.THLAIL87GUG9sRlq4XJ6',NULL,NULL,NULL,NULL,'602543',0,'2024-04-08 10:29:55','2024-04-08 10:29:55'),(5,'dealer@gmail.com','$2b$10$Yav2r12COFelKqSA2el36u26MpQlpa2ySAK8ZxwGUfFZDCZzohr2C',NULL,NULL,NULL,NULL,'689144',0,'2024-04-08 10:37:42','2024-04-08 10:37:42'),(6,'admin@gmail.com','$2b$10$u4fwGCtlZTtkrV95L2h9SeNmJaZecxU/Td2zOGa8g53LSNtXKTIhC',NULL,NULL,NULL,NULL,'983694',0,'2024-04-08 10:39:12','2024-04-08 10:39:12');
/*!40000 ALTER TABLE `delivery_agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'Alice',50000.00),(2,'Bob',60000.00),(3,'Charlie',70000.00),(4,'David',55000.00),(5,'Eve',65000.00);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nearby_addresses`
--

DROP TABLE IF EXISTS `nearby_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nearby_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `door_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_lane` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `landmark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pincode` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phonenumber` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `nearby_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nearby_addresses`
--

LOCK TABLES `nearby_addresses` WRITE;
/*!40000 ALTER TABLE `nearby_addresses` DISABLE KEYS */;
INSERT INTO `nearby_addresses` VALUES (1,5,'prasad','11/23','shanthi nagar','montessori','521301','gudivada','andhra pradesh','09866515999','2024-04-14 09:51:00'),(2,5,'prasad','11/23','shanthi nagar','','521301','gudivada','andhra pradesh','09866515999','2024-04-14 09:52:37'),(3,5,'prasad','11/23','shanthi nagar','','521301','gudivada','andhra pradesh','09866515999','2024-04-14 10:00:29'),(4,5,'prasad','223','shanthi nagar','','521301','gudivada','andhra pradesh','09866515999','2024-04-14 10:05:13'),(5,5,'prasad','223','shanthi nagar','','521301','gudivada','andhra pradesh','09866515999','2024-04-14 10:06:28'),(6,5,'prasad','22','shanthi nagar','','521301','gudivada','andhra pradesh','09866515999','2024-04-14 10:24:55');
/*!40000 ALTER TABLE `nearby_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nearby_cart_items`
--

DROP TABLE IF EXISTS `nearby_cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nearby_cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `dealer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `nearby_cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `nearby_cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nearby_cart_items`
--

LOCK TABLES `nearby_cart_items` WRITE;
/*!40000 ALTER TABLE `nearby_cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `nearby_cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nearby_order_items`
--

DROP TABLE IF EXISTS `nearby_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nearby_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `nearby_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `nearby_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `nearby_order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nearby_order_items`
--

LOCK TABLES `nearby_order_items` WRITE;
/*!40000 ALTER TABLE `nearby_order_items` DISABLE KEYS */;
INSERT INTO `nearby_order_items` VALUES (1,2,2,1,5000.00),(2,3,2,1,5000.00),(3,6,20,1,100.00),(4,7,19,1,11000.00),(5,8,19,1,11000.00),(7,10,19,1,11000.00),(8,11,19,1,11000.00),(9,12,20,1,100.00),(10,13,19,1,11000.00),(11,14,2,1,5000.00),(12,15,19,1,11000.00),(13,16,19,1,11000.00),(14,17,16,4,19000.00),(15,18,18,1,89.00),(16,18,21,1,200.00),(17,19,1,1,2000.00);
/*!40000 ALTER TABLE `nearby_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nearby_orders`
--

DROP TABLE IF EXISTS `nearby_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nearby_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `address_id` int DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `formatted_order_id` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estimated_delivery` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `address_id` (`address_id`),
  CONSTRAINT `nearby_orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `nearby_orders_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `nearby_addresses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nearby_orders`
--

LOCK TABLES `nearby_orders` WRITE;
/*!40000 ALTER TABLE `nearby_orders` DISABLE KEYS */;
INSERT INTO `nearby_orders` VALUES (2,5,1,5000.00,'2024-04-15 16:52:57','000001','2024-04-15 16:52:57'),(3,5,6,5000.00,'2024-04-15 16:53:12','000002','2024-04-15 16:53:13'),(6,5,6,100.00,'2024-04-15 17:01:35','000003','2024-04-15 17:01:35'),(7,5,2,11000.00,'2024-04-15 17:03:05','000004','2024-04-15 17:03:06'),(8,5,4,11000.00,'2024-04-15 17:53:48','000005','2024-04-15 17:53:48'),(10,5,1,11000.00,'2024-04-15 18:00:26','000006','2024-04-15 18:00:27'),(11,5,1,11000.00,'2024-04-15 18:02:34','000007','2024-04-15 18:02:35'),(12,5,1,100.00,'2024-04-15 18:32:03','000008','2024-04-15 18:32:03'),(13,5,1,11000.00,'2024-04-15 18:32:40','000009','2024-04-15 18:32:40'),(14,5,1,5000.00,'2024-04-15 18:47:19','000010','2024-04-15 18:47:20'),(15,5,2,11000.00,'2024-04-15 18:48:35','000011','2024-04-15 18:48:35'),(16,5,6,11000.00,'2024-04-15 20:26:15','000012','2024-04-15 20:26:15'),(17,5,NULL,76000.00,'2024-05-04 12:51:45','000013','2024-05-04 12:51:46'),(18,5,1,289.00,'2024-06-23 13:19:41','000014','2024-06-23 13:19:41'),(19,5,NULL,2000.00,'2024-07-12 14:29:29','000015','2024-07-12 14:29:30');
/*!40000 ALTER TABLE `nearby_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (4,6,19,4,NULL),(5,7,19,4,NULL),(6,8,19,4,NULL),(7,9,19,4,NULL),(8,10,19,4,NULL),(9,11,19,4,NULL),(10,12,19,4,NULL),(11,14,19,4,NULL),(12,15,19,4,NULL),(13,16,19,4,NULL),(14,17,19,4,NULL),(15,18,19,4,NULL),(16,19,19,4,NULL),(17,20,19,4,NULL),(18,21,19,4,NULL),(19,22,19,4,NULL),(20,23,19,4,NULL),(21,24,19,4,NULL),(22,25,19,4,NULL),(23,26,19,4,NULL),(24,27,19,4,NULL),(25,28,3,1,NULL),(26,28,4,1,NULL),(27,28,16,1,NULL),(28,28,18,1,NULL),(29,28,19,1,NULL),(30,29,3,1,NULL),(31,29,5,1,NULL),(32,29,17,1,NULL),(33,29,19,1,NULL),(34,30,3,1,NULL),(35,30,5,1,NULL),(36,30,17,1,NULL),(37,30,19,1,NULL),(38,31,3,1,NULL),(39,31,5,1,NULL),(40,31,17,1,NULL),(41,31,19,1,NULL),(42,32,3,1,NULL),(43,32,5,1,NULL),(44,32,17,1,NULL),(45,32,19,1,NULL),(46,33,3,1,NULL),(47,33,5,1,NULL),(48,33,17,1,NULL),(49,33,19,1,NULL),(50,34,19,1,NULL),(51,34,20,6,NULL),(52,35,19,1,NULL),(53,35,20,1,NULL),(54,36,19,1,NULL),(55,37,8,1,NULL),(56,37,9,1,NULL),(57,38,8,1,NULL),(58,38,9,1,NULL),(59,39,1,1,NULL),(60,40,8,1,NULL),(61,40,19,1,NULL),(62,40,20,1,NULL),(63,41,2,1,NULL),(64,41,3,1,NULL),(65,41,8,1,NULL),(66,41,9,1,NULL),(67,42,16,1,NULL),(68,42,17,1,NULL),(69,42,18,1,NULL),(70,42,19,1,NULL),(71,43,3,1,NULL),(72,44,2,1,NULL),(73,44,3,1,NULL),(74,44,5,1,NULL),(75,44,18,1,NULL),(76,45,8,1,NULL),(77,45,9,1,NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `address_id` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dealer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `address_id` (`address_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `user_addresses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,5,2,44000.00,'2024-04-05 10:31:39','2024-04-05 10:31:39',NULL),(2,5,2,44000.00,'2024-04-05 10:45:56','2024-04-05 10:45:56',NULL),(3,5,2,44000.00,'2024-04-05 10:48:20','2024-04-05 10:48:20',NULL),(4,5,2,44000.00,'2024-04-05 10:54:20','2024-04-05 10:54:20',NULL),(5,5,2,44000.00,'2024-04-05 10:54:21','2024-04-05 10:54:21',NULL),(6,5,1,44000.00,'2024-04-05 11:08:28','2024-04-05 11:08:28',NULL),(7,5,2,44000.00,'2024-04-05 12:00:25','2024-04-05 12:00:25',NULL),(8,5,1,44000.00,'2024-04-05 12:06:11','2024-04-05 12:06:11',NULL),(9,5,2,44000.00,'2024-04-05 13:06:17','2024-04-05 13:06:17',NULL),(10,5,2,44000.00,'2024-04-05 13:07:10','2024-04-05 13:07:10',NULL),(11,5,1,44000.00,'2024-04-05 13:09:10','2024-04-05 13:09:10',NULL),(12,5,1,44000.00,'2024-04-05 13:11:40','2024-04-05 13:11:40',NULL),(13,5,1,44000.00,'2024-04-05 13:14:38','2024-04-05 13:14:38',NULL),(14,5,2,44000.00,'2024-04-05 13:16:16','2024-04-05 13:16:16',NULL),(15,5,2,44000.00,'2024-04-05 13:16:18','2024-04-05 13:16:18',NULL),(16,5,2,44000.00,'2024-04-05 13:16:18','2024-04-05 13:16:18',NULL),(17,5,1,44000.00,'2024-04-05 13:25:51','2024-04-05 13:25:51',NULL),(18,5,2,44000.00,'2024-04-05 13:29:35','2024-04-05 13:29:35',NULL),(19,5,2,44000.00,'2024-04-05 13:30:24','2024-04-05 13:30:24',NULL),(20,5,1,44000.00,'2024-04-05 14:10:26','2024-04-05 14:10:26',NULL),(21,5,2,44000.00,'2024-04-05 14:15:19','2024-04-05 14:15:19',NULL),(22,5,2,44000.00,'2024-04-05 14:18:19','2024-04-05 14:18:19',NULL),(23,5,1,44000.00,'2024-04-05 14:22:41','2024-04-05 14:22:41',NULL),(24,5,1,44000.00,'2024-04-05 14:24:33','2024-04-05 14:24:33',NULL),(25,5,1,44000.00,'2024-04-05 14:44:50','2024-04-05 14:44:50',NULL),(26,5,2,44000.00,'2024-04-05 14:50:35','2024-04-05 14:50:35',NULL),(27,5,2,44000.00,'2024-04-05 14:59:40','2024-04-05 14:59:40',NULL),(28,5,2,180089.00,'2024-04-05 15:05:15','2024-04-05 15:05:15',NULL),(29,5,2,426000.00,'2024-04-05 15:11:43','2024-04-05 15:11:43',NULL),(30,5,2,426000.00,'2024-04-05 15:11:49','2024-04-05 15:11:49',NULL),(31,5,2,426000.00,'2024-04-05 15:11:50','2024-04-05 15:11:50',NULL),(32,5,2,426000.00,'2024-04-05 15:11:50','2024-04-05 15:11:50',NULL),(33,5,2,426000.00,'2024-04-05 15:11:51','2024-04-05 15:11:51',NULL),(34,5,1,11600.00,'2024-04-06 11:55:53','2024-04-06 11:55:53',NULL),(35,5,1,11100.00,'2024-04-06 11:58:54','2024-04-06 11:58:54',NULL),(36,5,2,11000.00,'2024-04-06 12:05:30','2024-04-06 12:05:30',NULL),(37,5,1,12400.00,'2024-04-06 13:26:41','2024-04-06 13:26:41',NULL),(38,5,1,12400.00,'2024-04-06 13:26:42','2024-04-06 13:26:42',NULL),(39,5,2,2000.00,'2024-04-06 13:59:32','2024-04-06 13:59:32',NULL),(40,5,1,23100.00,'2024-04-08 12:30:58','2024-04-08 12:30:58',NULL),(41,5,1,102400.00,'2024-04-15 12:49:03','2024-04-15 12:49:03',NULL),(42,5,2,130089.00,'2024-04-15 12:49:51','2024-04-15 12:49:51',NULL),(43,5,1,85000.00,'2024-07-08 05:19:17','2024-07-08 05:19:17',NULL),(44,5,1,320089.00,'2024-07-12 08:58:19','2024-07-12 08:58:19',NULL),(45,5,2,12400.00,'2024-08-13 14:18:40','2024-08-13 14:18:40',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Posts`
--

DROP TABLE IF EXISTS `Posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `picturePath` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userPicturePath` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `likes` json DEFAULT NULL,
  `comments` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Posts`
--

LOCK TABLES `Posts` WRITE;
/*!40000 ALTER TABLE `Posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `Posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dealer_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `actual_cost` decimal(10,2) NOT NULL,
  `discount_price` decimal(10,2) NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instockqty` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dealer_id` (`dealer_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'assus rogsrix g17','https://dlcdnwebimgs.asus.com/files/media/135B75ED-C0F7-4BB9-928F-2B1A1E9CB34F/v1/img/design/color/strix-g-2022-green.png',NULL,82000.00,2000.00,'laptops',98),(2,1,'iphone 15 maxpro','https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-max-family-select?wid=4000&hei=3794&fmt=jpeg&qlt=90&.v=1692893974945',NULL,120000.00,5000.00,'mobiles',95),(3,1,'samsung s24 ultra','https://imgeng.jagran.com/images/2024/jan/samsung-s24-ultra-price1705584905756.jpg',NULL,100000.00,85000.00,'mobiles',95),(4,1,'ultra android smart tv','https://www.bajajmall.in/emistore/media/catalog/product/3/6/365790_base.jpeg',NULL,70000.00,65000.00,'home-appliances',99),(5,2,'vision pro','https://deepwatermgmt.com/wp-content/uploads/2023/10/Apple-WWCD23-Vision-Pro-with-battery-230605.jpg',NULL,250000.00,230000.00,'electronics',98),(6,2,'canon','https://toppng.com/uploads/preview/camera-png-11552940835xz4sxo5wa6.png',NULL,50000.00,48000.00,'electronics',100),(7,2,'twills t shirt for mens','https://assets.ajio.com/medias/sys_master/root/20210601/QTgm/60b55dd6f997ddb312af9937/-473Wx593H-462465704-white-MODEL.jpg',NULL,2500.00,2000.00,'fashion',100),(8,2,'gaming chair','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW-jjnk2hGEV_t3KhnJnrHU7ZqTpLzSvHXeA&usqp=CAU',NULL,15000.00,12000.00,'home-appliances',96),(9,2,'toy gun','https://m.media-amazon.com/images/I/71e-HtTY61L._AC_UL800_.jpg',NULL,500.00,400.00,'toystore',97),(13,2,'Dining Table','https://www.hokybo.com/CompanyData/Product/13MD091/1.jpg','its a big dinnig set can be used indoor and out door',12334.00,11344.00,'home-appliances',200),(16,3,'washing machine','https://aws-obg-image-lb-2.tcl.com/content/dam/brandsite/region/in/blog/pc/detail/blog-october/the-history-of-the-washing-machine-banner.jpg','',23000.00,19000.00,'home-appliances',94),(17,3,'fridge','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHHweVJonZUe8r2afg8P0ox44ZAz_mzhaw-D4gcJO_5Njrreo_iQAVKBLTIHUv3d0lFLs&usqp=CAU','',200000.00,100000.00,'home-appliances',98),(18,3,'Wheat Atta','https://globalsupermarket.eu/wp-content/uploads/2023/12/aashirvaad-whole-wheat-atta-flour-5-kg-656db795c0366.webp','',90.00,89.00,'grocery',96),(19,8,'Macbook Pro','https://i.ytimg.com/vi/6Ij9PiehENA/maxresdefault.jpg','',120000.00,11000.00,'laptops',86),(20,9,'Bihar lorry toy','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzP2JCzjwM_hkmII7od6DdL5NThAatw_gqtYFsBlPwOg&s','',200.00,100.00,'toystore',0),(21,3,'hey','/Users/prasad/Desktop/main project/local_treasures-root/server/uploads/1713766351253-lk logo.png','',200.00,200.00,'toystore',99),(22,20,'aditya','https://rb.gy/c3d16j','toppper of srm',2000.00,12000.00,'fashion',100);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sales_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,1000.00),(2,2000.00),(3,3000.00),(4,4000.00),(5,5000.00);
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_addresses`
--

DROP TABLE IF EXISTS `user_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `door_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_lane` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `landmark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pincode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phonenumber` char(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_phone_digits` CHECK (((char_length(`phonenumber`) = 10) and regexp_like(`phonenumber`,_utf8mb4'^[0-9]{10}$')))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_addresses`
--

LOCK TABLES `user_addresses` WRITE;
/*!40000 ALTER TABLE `user_addresses` DISABLE KEYS */;
INSERT INTO `user_addresses` VALUES (1,5,'prasad','11/23','shanthi nagar','montessori','521301','gudivada','andhra pradesh','9866515999'),(2,5,'prasad mani','223','rajendra nagar','','521301','gudivada','andhra pradesh','9804359999');
/*!40000 ALTER TABLE `user_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'user','user@gmail.com','user'),(2,'prasad','prasad@gmail.com','1234'),(3,'user1','user1@gmail.com','$2b$10$p8pTknKfYL1i50a0A2qBjOSVG4W5eUZl/TU2l3eL3qx0jLamOR/OK'),(4,'mani','mani@gmail.com','$2b$10$q.2AuZW2uHd127qZYEEy/eO70PuFjOORzPR8v5L2ZTm7uvAVJBpf2'),(5,'deva','deva@gmail.com','$2b$10$v02MULYSPRNdkqfsIKycXOF4m7yrIfUJ6BPD68JcitNwlE6wlhrZi'),(6,'prasad','saimahesh44367@gmail.com','$2a$12$DU0P96MBEIq5hUZdqCLcWeAAD5deLO8ORpFtIf8VM.n1RGH9VG46O');
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

-- Dump completed on 2024-10-08 23:25:02
