import { BadRequestException, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { InfoDto } from "./dto/info.dto";
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fsSync from 'fs';
import {promises as fs} from "fs";


@Injectable()
export class SeriesInfoService{
    constructor(private prisma:PrismaService){}
    private logger:Logger = new Logger(SeriesInfoService.name);
    async getCount(){
        try{
            const commentsCount = await this.prisma.comments.count();
            const seriesCount = await this.prisma.infoSeries.count();
            const usersCount = await this.prisma.user.count();
            return {
                comments:commentsCount,
                series:seriesCount,
                users:usersCount
            }
        }catch(err){
            throw new BadRequestException('Error when tried to count amount of comments!');
        }
    }
    
    async getCategoriesCatalog(){
        try{
            const categories = await this.prisma.$queryRaw<
            { Genre: string; count: number }[]
            >`SELECT unnest("Genre") AS Genre, COUNT(*)::int AS count
            FROM "InfoSeries"
            GROUP BY Genre
            ORDER BY count DESC`;
            console.log(`CATEGORIES: `,categories);
        return categories;
        }catch(err){
            this.logger.error(err);
            throw new BadRequestException;
        }
    }

    async assignInfo(dto:InfoDto){
        console.log('URA2');
        try{
            if (!dto.SeriesName) {
                throw new Error('SeriesName is required');
            }
            const isExist = await this.prisma.infoSeries.findUnique({
                where:{
                    SeriesName:dto?.SeriesName
                }
            })
            if(isExist){
                return false;
            }
            const pathName = path.join(__dirname,`..`,`..`,`..`,`video/${dto.SeriesName}`);
            console.log('pathName: ',pathName);
            const isFolderExist = await this.checkFolderExists(pathName);
            if(!isFolderExist){
                await fs.mkdir(pathName, { recursive: true });
            }
            for(const voice of dto.VoiceActing){
                try{
                    const tempPath = path.join(__dirname,`..`,`..`,`..`,`video/${dto.SeriesName}/${voice}`);
                    await fs.mkdir(tempPath,{recursive:true});
                    console.log(`Folder created: ${tempPath}`);
                }catch(err){
                    console.error(`Error: ${err}`);
                    
                }
            }
            const info = await this.prisma.infoSeries.create({
                data:{
                    SeriesName:dto.SeriesName,
                    SeriesViewName:dto.SeriesViewName,
                    Description:dto.Description,
                    Status:dto.Status,
                    Type:dto.Type,
                    ReleaseYear:dto.ReleaseYear,
                    Genre:dto.Genre,
                    Studio:dto.Studio,
                    AmountOfEpisode:dto.AmountOfEpisode,
                    VoiceActing:dto.VoiceActing,
                },
            })
            return info;
        }catch(err){ 
            console.error(err);
            return false;
        }
    }
    async getInfo(seriesName:string){
        if (!seriesName) {
            throw new Error('SeriesName cannot be undefined or null');
        }
        try{
            const info = await this.prisma.infoSeries.findUnique({
                where:{
                    SeriesName:seriesName
                },
            });
            const views = await this.prisma.views.count({
                where:{
                    SeriesName:seriesName
                }
            })
            console.log(`VIEW: `,views);
            
            return {...info,Views:views};
        }catch(err){
            console.error(err);
            return false;
        }
    }
    async patchSeries(dto:InfoDto,seriesName:string){
        try{
            const pathName = path.join(__dirname,`..`,`..`,`..`,`video/${dto.SeriesName}`);
            const isFolderExist = await this.checkFolderExists(pathName);
            if(!isFolderExist){
                await fs.mkdir(pathName, { recursive: true });
            }
            if(dto.VoiceActing){
                for(const voice of dto.VoiceActing){
                    try{
                        const tempPath = path.join(__dirname,`..`,`..`,`..`,`video/${dto.SeriesName}/${voice}`);
                        await fs.mkdir(tempPath,{recursive:true});
                    }catch(err){
                        console.error(`Error: ${err}`);
                        
                    }
                }
            }
            const patch = await this.prisma.infoSeries.update({
                where:{
                    SeriesName:seriesName
                },
                data:{
                    AlternitiveNames:dto.AlternitiveNames,
                    SeriesName:dto.SeriesName,
                    SeriesViewName:dto.SeriesViewName,
                    Studio:dto.Studio,
                    ReleaseYear:dto.ReleaseYear,
                    Shikimori:dto.Shikimori,
                    AmountOfEpisode:Number(dto.AmountOfEpisode),
                    Description:dto.Description,
                    Genre:dto.Genre,
                    VoiceActing:dto.VoiceActing || [],
                    Status:dto.Status,
                    Type:dto.Type,
                    CurrentEpisode:dto.CurrentEpisode,
                    NextEpisodeTime:dto.NextEpisodeTime
                }
            })
            return patch;
        }catch(err){
            console.error(`Error: ${err}`);
            
            throw new BadRequestException(`Cannot update the series data!Error: ${err}`)
        }
        
    }
    async getPage(skip:number,take?:number,category?:string,status?:string){
        try{
            const firstPage = await this.prisma.infoSeries.findMany({
                where:{ 
                    ...(category && { Genre: { has: category } }),
                    ...(status && { Status: status })
                },
                skip:skip || 0,
                take:take || 16,
                orderBy:{
                    createdAt:'desc'
                }
            });
            const SeriesNames = firstPage.map(series => series.SeriesName);

            // Get the average rating only for the series in firstPage
            const avgRatings = await this.prisma.rate.groupBy({
                by: ["SeriesName"], // Group ratings by series ID
                where: {
                    SeriesName: { in: SeriesNames }, // Only consider series from firstPage
                },
                _avg: {
                    Value: true,
                },
                _count: {
                    Value:true
                }
            });
            /* const results = await this.prisma.$queryRaw`
                SELECT 
                    "SeriesName",
                    AVG("Value") AS "avgValue",
                    COUNT("Value") AS "countValue",
                    MAX(CASE WHEN "UserId" = ${userId} THEN "Value" END) AS "userValue"
                FROM "Rate"
                WHERE "SeriesName" IN (${Prisma.join(seriesNames)})
                GROUP BY "SeriesName";
                `;
 */
            const seriesViews = await this.prisma.views.groupBy({
                by:['SeriesName'],
                where:{
                    SeriesName:{in:SeriesNames}
                },
                _count:true
            })
            // Merge the avg rating with firstPage results
            const firstPageWithRatings = firstPage.map(series => {
                const ratingData = avgRatings.find(rate => rate.SeriesName === series.SeriesName);
                const seriesView = seriesViews.find(view => view.SeriesName === series.SeriesName);
                return { 
                    ...series, 
                    Rate: ratingData?._avg.Value || null,
                    Count: ratingData?._count.Value || 0,
                    Views:seriesView?._count || 0
                };
            });
            return firstPageWithRatings;
        }catch(err){
            console.error(`Error,when trying to getFirstPage: \n ${err}`);
        }
        
    }
    
    async getAmountOfSeries(category?:string,status?:string){
        const result = await this.prisma.$queryRaw<{ count: number }[]>(
            Prisma.sql`
            SELECT COUNT(*)::int AS count
            FROM "InfoSeries"
            WHERE 
                (${category ? Prisma.sql`${category} = ANY("Genre")` : Prisma.sql`TRUE`}) AND
                (${status ? Prisma.sql`"Status" = ${status}` : Prisma.sql`TRUE`});
            `
        );
        return result[0].count;
    }

    async getSeries(skip:number){
        const series = await this.prisma.infoSeries.findMany({
            skip:skip || 0,
            take:15,
            orderBy:{
                createdAt:'desc'
            },
            select:{
                SeriesViewName:true,
                SeriesName:true,
                createdAt:true
            }
        })
        return series;
    }
    async getCarouselItems(){
        try{
            const carouselItems = await this.prisma.carousel.findMany();
            return carouselItems;
        }catch(err){
            throw new BadRequestException(err)
        }
    }
    async putCarouselItems(carouselItems:any){
        try{
            await this.prisma.carousel.deleteMany();
            await this.prisma.carousel.createMany({
                data: carouselItems,
              });
        }catch(err){
            throw new BadRequestException(err);
        }
    }
    async findSeries(seriesName:string,skip:number){
        try{
            const searchTerm = `%${seriesName}%`
            const foundedAlternitiveSeries = await this.prisma.$queryRaw`
            SELECT "SeriesViewName", "SeriesName"
            FROM "InfoSeries"
            WHERE "SeriesViewName" ILIKE ${searchTerm}
            OR EXISTS (
                SELECT 1
                FROM unnest("AlternitiveNames") AS name
                WHERE name ILIKE ${searchTerm}
            )
            LIMIT 15 OFFSET ${skip};
            `;
            
            return foundedAlternitiveSeries;
        }catch(err){
            console.error(err);
            
            throw new BadRequestException(`Couldn't find any series!Error: ${err}`)
        }
    }
    async setRateSeries(seriesName:string,value:number,userId:number){
        try{
            const rateTheSeries = await this.prisma.rate.upsert({
                where: {
                    UserId_SeriesName: {
                        UserId: userId,
                        SeriesName: seriesName,
                    },
                },
                update: {
                    Value: value, // Update the value if the record exists
                },
                create: {
                    UserId: userId,       // Create the record if it doesn't exist
                    SeriesName: seriesName,
                    Value: value,
                },
                select: {
                    Value: true,
                },
            });
            return rateTheSeries;
        }catch(err){
            console.error(err);
            
            throw new BadRequestException(`Couldn't rate the series!Error: ${err}`)
        }
    }
    async getUserRate(seriesName:string,userId:number){
        try{
            const userRate = await this.prisma.rate.findUnique({
                where:{
                    UserId_SeriesName:{
                        UserId:userId,
                        SeriesName:seriesName
                    }
                },
                select:{
                    Value:true
                }
            })
            return userRate;
        }catch(err){
            throw new BadRequestException(`Cannot get user rate for series!Error: ${err}`)
        }
    }
    async getSeriesRate(seriesName:string){
        try{
            const getRate = await this.prisma.rate.aggregate({
                where:{
                    SeriesName:seriesName
                },
                _avg:{
                    Value:true
                },
                _count:{
                    Value:true
                }
            });
            const resultRate = getRate._avg.Value;
            return {avgRate:resultRate,count:getRate._count.Value};
        }catch(err){
            throw new BadRequestException(`Cannot get rate for this series!Error: ${err}`)
        }
    }
    async getUserRates(userId:number,seriesNames:any[]){
        try{
            const userRates = await this.prisma.rate.findMany({
                where:{
                    UserId:userId,
                    SeriesName:{in:seriesNames}
                },
                select:{
                    SeriesName:true,
                    Value:true
                }
            })
            return userRates;
            
        }catch(err){
            console.error(`Error: ${err}`);
            throw new BadRequestException(`Couldn't get user rates.Error: ${err}`)
        }
    }
    async deleteUserRate(userID:number,seriesName:string){
        try{
            const userRate = await this.prisma.rate.delete({
                where:{
                    UserId_SeriesName:{
                        UserId:userID,
                        SeriesName:seriesName
                    }
                },
                select:{
                    Value:true
                }
            })
        }catch(err){
            console.error(`Couldn't delete user rate.Error ${err}`);
            throw new BadRequestException(`Couldn't delete user rate.Error ${err}`)
        }
    }
    async getItemsRate(seriesNames:string[],userId?:number | null){
        try{
            /* const itemsRate = await this.prisma.rate.groupBy({
                by: ['SeriesName'],
                where:{
                    SeriesName:{
                        in:seriesNames
                    }
                },
                _avg:{
                    Value:true
                }
            }); */
            const results = await this.prisma.$queryRaw`
            SELECT 
                "SeriesName",
                AVG("Value") AS "avgValue",
                MAX(CASE WHEN "UserId" = ${userId} THEN "Value" END) AS "userValue"
            FROM "Rate"
            WHERE "SeriesName" IN (${Prisma.join(seriesNames)})
            GROUP BY "SeriesName";
            `;
            return results;
        }catch(err){
            console.error(`Couldn't get rates avg of items!${err}`);
            
        }
    }
    async deleteSeries(seriesName:string){
        try{
            const pathName = path.join(__dirname,`..`,`..`,`..`,`video/${seriesName}`);
            const isFolderExist = await this.checkFolderExists(pathName);
            if(isFolderExist){
                await fs.rm(pathName,{recursive:true})
            }
            const req = await this.prisma.infoSeries.delete({
                where:{
                    SeriesName:seriesName
                }
            })
        }catch(err){
            throw new BadRequestException('Cannot delete the series!')
        }
    }
    async getVoices(seriesName:string){
        try{
            const req = await this.prisma.infoSeries.findMany({
                where:{
                    SeriesName:seriesName
                },
                select:{
                    VoiceActing:true
                }
            });
            const pathName = path.join(__dirname,`..`,`..`,`..`,`video/${seriesName}`);
            const allData = req.flatMap((entry)=>{
                return entry.VoiceActing.map((item,index)=>{
                    try{
                        const voiceFolderPath = path.join(__dirname,`..`,`..`,`..`,`video/${seriesName}/${item}`);
                        console.log();
                        
                        const items = fsSync.readdirSync(voiceFolderPath, { withFileTypes: true });
                        const folderCount = items.filter(item => item.isDirectory()).length;
                        return {voice:item,episodes:folderCount};
    
                    }catch(err){
                        console.error(`Error when counting how any episodes voice has!${err}`);
                        return {voice:item,episodes:0};
                    }
                })
            })
            return allData;
            }catch(err){
                console.error(`Couldn't get the voices!Error: ${err}`);
                
            }
    }
    async checkFolderExists(pathName: string) {
        try {
            await fs.access(pathName);
            console.log("The folder exists!");
            return true;
            // You can proceed with your logic for existing folders here.
        } catch (error) {
            console.log("The folder does not exist or is not accessible.");
            // Handle the folder not existing (e.g., create it).
            return false;
        }
    }
    async getItemsTime(skip:number,take?:number){
        try{
            const itemsTime = await this.prisma.infoSeries.findMany({
                take:take || 15,
                skip:skip || 0,
                where:{
                    Status:'ongoing',
                },
                orderBy:{
                    NextEpisodeTime:'asc'
                },
                select:{
                    SeriesName:true,
                    SeriesViewName:true,
                    NextEpisodeTime:true
                }
            });
            return itemsTime;
        }catch(err){
            throw new BadRequestException(err)
        }
    }
    async getSchedule(){
        try{
            const scheduleForDay = await this.prisma.infoSeries.findMany({
                where: {
                    Status: 'ongoing',
                },
                orderBy:{
                    NextEpisodeTime:'asc'
                },
                select:{
                    SeriesName:true,
                    SeriesViewName:true,
                    NextEpisodeTime:true,

                }
            });
            const seriesViews = await this.prisma.views.groupBy({
                by:['SeriesName'],
                where:{
                    SeriesName:{in:scheduleForDay.map((item:any)=>item.SeriesName)}
                },
                _count:true
            });
            const scheduleForDayWithViews = scheduleForDay.map((series:any)=>{
                const seriesView = seriesViews.find((view:any)=>view.SeriesName === series.SeriesName);
                return {...series,Views:seriesView?._count || 0}
            })
            return scheduleForDayWithViews;
        }catch(err){
            console.error(err);
            throw new BadRequestException(err);
        }
    }

    async postView(seriesName:string,ip:string,userId?:number | null){
        try{
            const view = await this.prisma.views.upsert({
                where:{
                    UserId_SeriesName:{
                        UserId:userId,
                        SeriesName:seriesName
                    }
                },
                create:userId ? {
                    UserId:userId,
                    SeriesName:seriesName,
                } : {IP:ip,SeriesName:seriesName},
                update:userId ? {
                    UserId:userId,
                    SeriesName:seriesName,
                } : {IP:ip,SeriesName:seriesName}
            })
        }catch(err){
            console.error(err);     
            throw new BadRequestException(err);
        }
    }
    async getItemsAnnouncement(){
        try{
            const announcements = await this.prisma.infoSeries.findMany({
                where:{
                    Status:'announcement'
                },
                orderBy:{
                    createdAt:'desc'
                },
            });
            return announcements;
        }catch(err){
            console.error(err);
            throw new BadRequestException(err);
        }
    }
    async getTop(userId?:number){
        try{
            const topCatalog = await this.prisma.$queryRaw`
            SELECT 
                i.*, 
                COUNT(v."Id")::int AS viewsCount, 
                COUNT(r."Id")::int AS rateCount, 
                COALESCE(AVG(r."Value")::float, 0) AS avgRate,
                MAX(ur."Value") AS userRate
            FROM "InfoSeries" i
            LEFT JOIN "Views" v ON i."SeriesName" = v."SeriesName"
            LEFT JOIN "Rate" r ON i."SeriesName" = r."SeriesName"
            LEFT JOIN "Rate" ur ON i."SeriesName" = ur."SeriesName" AND ur."UserId" = CAST(${userId} AS INTEGER)
            GROUP BY i."SeriesName"
            ORDER BY viewsCount DESC, avgRate DESC
            LIMIT 100;
        `;
        return topCatalog;
        }catch(err){
            console.error(err);
            throw new BadRequestException(err)
        }
    }
}


export class VideoFormatterService{
    private rootPath:string = path.resolve(__dirname,`../../..`);
    async videoUpload(seriesName:string,episode:number,voice:string){
        try {
            console.log(`RootPath: `, this.rootPath);
            const inputFile = path.join(__dirname, `..`, `..`, `..`, `video/${seriesName}/${voice}/${episode}/${seriesName}.mp4`);
            console.log(seriesName);
    
            const resolutions = [
                { size: '1920x1080', name: '1080p.mp4' },
                { size: '1280x720', name: '720p.mp4' },
                { size: '854x480', name: '480p.mp4' }
            ];
    
            // Запускаем конвертацию видео в фоне
            const tasks = resolutions.map(({ size, name }) => 
                this.convertVideo(inputFile, size, name, seriesName, episode, voice)
            );
    
            // Ждем, пока все задачи будут запущены, но НЕ дожидаемся завершения
            Promise.allSettled(tasks)
                .then(results => console.log('Video conversion completed:', results))
                .catch(err => console.error('Error in video conversion:', err));
    
            // Мгновенно возвращаем результат, пока видео в фоне обрабатывается
            return { message: "Video processing started", status: "in_progress" };
    
        } catch (err) {
            console.error('VideoFormatterService Error: ', err);
            return { error: "Video processing failed", status: "error" };
        }
    }
    private convertVideo(inputPath:string,resolution:string,outputFileName:string,seriesName:string,episode:number,voice:string):Promise<string>{
        return new Promise(async(resolve,reject)=>{
            try{

                const height = resolution.split('x')[1];
                console.log('HIEGHT: ',height);
                console.log('SeriesName: ',seriesName);
                
                const outputDir = path.join(__dirname, '..', '..',`..` ,`video/${seriesName}/${voice}/${episode}`);

                console.log('OUTPUT DIR SERIES: ',outputDir);
                
                const outputPath = path.join(outputDir, outputFileName);
                const isExists = await fs.access(outputPath).then(() => true).catch(() => false);
                if(isExists){ 
                    console.log(`File already exists: ${outputPath}`);
                    return resolve(outputPath)
                };
                ffmpeg(inputPath)
                .outputOptions([
                    `-vf scale=${resolution}`,        // Устанавливаем разрешение видео
                    '-c:v libx264',                   // Видео кодек H.264
                    '-c:a aac',                       // Аудио кодек AAC
                    '-movflags +faststart',           // Оптимизация MP4 для потокового воспроизведения
                    '-preset veryfast',               // Пресет для быстрого кодирования
                    '-profile:v baseline',            // Использование совместимого профиля H.264
                    '-level 3.0',                     // Уровень для совместимости с браузерами
                    '-pix_fmt yuv420p'
                ])
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log('Spawned Ffmpeg with command: ' + commandLine);
                })
                .on('progress', (progress) => {
                    console.log(`Processing: ${progress.percent}% done`);
                })
                .on('stderr', function(stderrLine) {
                    console.log('Stderr output: ' + stderrLine);
                })
                .on('end', () => {
                    console.log(`Conversion complete for ${outputFileName}`);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error(`Error during conversion for ${outputFileName}: `, err);
                    reject(err);
                })
                .run();
            }catch(err){
                console.error(err);
                
            }
    
        })
    }
    private async createDirectories(temp:string){
        try{
            const dir1080p = `${temp}/1080p`;
            const dir720p = `${temp}/720p`;
            const dir480p = `${temp}/480p`;
            await fs.mkdir(dir1080p, { recursive: true }).catch((err) => {
                console.error(`Error creating directory ${dir1080p}:`, err);
              });
              console.log('Папка 1080p создана');

            await fs.mkdir(dir720p, { recursive: true }).catch((err) => {
                console.error(`Error creating directory ${dir720p}:`, err);
              });
              console.log('Папка 720p создана');
          
              await fs.mkdir(dir480p, { recursive: true }).catch((err) => {
                console.error(`Error creating directory ${dir480p}:`, err);
              });
              console.log('Папка 480p создана');
        }catch (err) {
            console.error('Ошибка при создании директорий:', err);
          }
    }
    async getRoute(seriesName:string,quality:string){
        const dirSeriesName = `C:/Users/arMori/Desktop/RedditClone/reddit_back/src/video/${seriesName}`;
        console.log('ITS QUALOITY: ',quality);
        
        const isExists = await fs.stat(dirSeriesName).then(() => true).catch(() => false);
        console.log('EXISTS FILE!',dirSeriesName);
        try{
            if(isExists){
                const check = path.join(__dirname,'..','..',`src/video/${seriesName}/${quality}/${quality}.mp4`)
                
                const checked = await fs.stat(check).then(() => true).catch(() => false);;
                if(checked){
                    console.log('Return FILE: ',check);
                    return check;
                }
            }

        }catch(err){
            console.log(err);
            
        }
    }
    
}