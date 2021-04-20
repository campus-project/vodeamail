# create databases
CREATE DATABASE IF NOT EXISTS `vodeamail-api-gateway` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `vodeamail-account-service` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `vodeamail-audience-service` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `vodeamail-campaign-service` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `vodeamail-mailer-service` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `vodea-cloud` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# grant privileges
GRANT ALL PRIVILEGES ON *.* TO 'homestead'@'%' WITH GRANT OPTION;