import { Type } from "class-transformer"
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator"

export class InfoDto{
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  AlternitiveNames?: string[];

  @IsNotEmpty()
  @IsString()
  SeriesName: string;
  
  @IsOptional()
  @IsString()
  Description?: string;

  @IsNotEmpty()
  @IsString()
  SeriesViewName: string;
  
  @IsString()
  @IsOptional()
  Shikimori: string
  @IsNotEmpty()
  @IsString()
  Type: string;

  @IsOptional()
  @IsString()
  ReleaseYear?: string;

  @IsNotEmpty()
  @IsString()
  Status: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  Genre?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  Studio?: string[];

  @IsOptional()
  @IsNumber()
  AmountOfEpisode?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  VoiceActing?: string[];
  
  @IsOptional()
  @IsInt()
  @ValidateIf((o) => o.Status === 'ongoing') // Только если Status = "ongoing"
  CurrentEpisode?: number;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.Status === 'ongoing') // Только если Status = "ongoing"
  NextEpisodeTime?: string;
}