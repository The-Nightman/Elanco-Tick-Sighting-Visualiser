ALTER TABLE Sightings DROP FOREIGN KEY Sightings_CityId_Cities_Id_fk;--> statement-breakpoint
ALTER TABLE Sightings DROP FOREIGN KEY Sightings_SpeciesId_Species_Id_fk;--> statement-breakpoint
ALTER TABLE `Cities` MODIFY COLUMN `Id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `Species` MODIFY COLUMN `Id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `Sightings` ADD CONSTRAINT `Sightings_SpeciesId_Species_Id_fk` FOREIGN KEY (`SpeciesId`) REFERENCES `Species`(`Id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Sightings` ADD CONSTRAINT `Sightings_CityId_Cities_Id_fk` FOREIGN KEY (`CityId`) REFERENCES `Cities`(`Id`) ON DELETE no action ON UPDATE no action;