CREATE TABLE `Cities` (
	`Id` int NOT NULL,
	`CityName` varchar(255) NOT NULL,
	`nation` enum('England','Scotland','Wales','Northern Ireland') NOT NULL,
	CONSTRAINT `Cities_Id` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE TABLE `Sightings` (
	`Id` varchar(20) NOT NULL,
	`sightingDate` datetime NOT NULL,
	`SpeciesId` int NOT NULL,
	`CityId` int NOT NULL,
	CONSTRAINT `Sightings_Id` PRIMARY KEY(`Id`)
);
--> statement-breakpoint
CREATE TABLE `Species` (
	`Id` int NOT NULL,
	`SpeciesName` varchar(255) NOT NULL,
	`LatinName` varchar(255) NOT NULL,
	CONSTRAINT `Species_Id` PRIMARY KEY(`Id`),
	CONSTRAINT `Species_SpeciesName_unique` UNIQUE(`SpeciesName`),
	CONSTRAINT `Species_LatinName_unique` UNIQUE(`LatinName`)
);
--> statement-breakpoint
ALTER TABLE `Sightings` ADD CONSTRAINT `Sightings_SpeciesId_Species_Id_fk` FOREIGN KEY (`SpeciesId`) REFERENCES `Species`(`Id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Sightings` ADD CONSTRAINT `Sightings_CityId_Cities_Id_fk` FOREIGN KEY (`CityId`) REFERENCES `Cities`(`Id`) ON DELETE no action ON UPDATE no action;