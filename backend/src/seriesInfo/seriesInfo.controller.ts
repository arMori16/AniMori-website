import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { SeriesInfoService, VideoFormatterService } from "./seriesInfo.service";
import { InfoDto } from "./dto/info.dto";
import { Public } from "src/common/decorators/public.decorator";
import { SeriesName } from "src/auth/types/seriesName.type";
import * as fsSync from 'fs';
import {promises as fs} from "fs";
import * as path from "path";
import { Request } from "express";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { AtGuard } from "src/common/guards";
import { AdminGuard } from "src/common/guards/admin.guard";
import { GetCurrentUserId } from "src/common/decorators";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";

@Controller('/catalog')
export class SeriesInfoController{
    constructor(private service:SeriesInfoService,private videoService:VideoFormatterService,private jwtService:JwtService){}
    @Public()
    @Post('/view')
    async postView(@Body('seriesName') seriesName:string,@Req() req:Request){
        const ip = await axios.get('http://ip-api.com/json/');
        let userId:number | null;
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1]; // Extract token
                const decoded: any = this.jwtService.decode(token); // Decode JWT
                userId = Number(decoded?.sub) || null;
            } catch (err) {
                console.error('Invalid token:', err);
            }
        }
        console.log(`IP address: ${ip.data.query}`);
        
        return await this.service.postView(seriesName,ip.data.query,userId);
    }
    @Public()
    @Get('/schedule/date')
    async getSchedule(){
        return await this.service.getSchedule();
    }
    @Public()
    @Get('/categories')
    async getCategories(){
        return await this.service.getCategoriesCatalog();
    }

    @UseGuards(AdminGuard)
    @Put('admin/series')
    async patchSeries(@Body() dto:InfoDto){
        return await this.service.patchSeries(dto);
    }
    @Public()
    @Get('items/time')
    async getItemsTime(@Query('skip') skip:number,@Query('take') take?:number){
        return await this.service.getItemsTime(skip,take);
    }
    @Public()
    @Get('item/voices')
    async getVoices(@Query('seriesName') seriesName:string){
        return await this.service.getVoices(seriesName);
    }
    @Public()
    @Get('items/announcement')
    async getItemsAnnouncement(){
        return await this.service.getItemsAnnouncement();
    }
    @Public()
    @Get('/carousel/items')
    async getCarouselItems(){
        return await this.service.getCarouselItems();
    }
    @UseGuards(AdminGuard)
    @Put('/carousel/items')
    async putCarouselItems(@Body('carousel') carouselData:any){
        return await this.service.putCarouselItems(carouselData);
    }
    @UseGuards(AdminGuard)
    @Delete('/item/episode/delete')
    async deleteEpisode(@Query('seriesName') seriesName:string,@Query('voice') voice:string,@Query('episode') episode?:number){
        let pathName: string;
        if(episode){
            pathName = path.join(__dirname,`..`,`..`,`..`,`video/${seriesName}/${voice}/${episode}`);

        }else{
            pathName = path.join(__dirname,`..`,`..`,`..`,`video/${seriesName}/${voice}`);
        }
        console.log('PathName for delete episode: ',pathName);
        
        return await fs.rm(pathName,{recursive:true}).catch((err)=>{
            throw new BadRequestException(`There is no such file!${err}`)
        });
    }
    @Public()
    @Get('admin/series')
    async getAdminInfo(@Query('skip') skip:number){
        return await this.service.getSeries(Number(skip));
    }
    @Public()
    @Get('/getCounts')
    async getAllCounts(){
        return await this.service.getCount();
    }
    @Public()
    @Get('/getAmountOfSeries')
    async getAmountOfSeries(@Query('category') category?:string | null,@Query('status') status?:string | null){
        return this.service.getAmountOfSeries(category,status);
    }
    @Public()
    @Get('/getCatalog')
    async getCatalog(@Res() res:Response,@Query('skip') skip:number,@Query('take') take:number,@Query('status') status:string | null,@Query('category') category:string | null){
        const firstPage = await this.service.getPage(skip > 0 ? skip : 0,Number(take),category || null,status);
        res.status(200).json(firstPage);
    }
    @UseGuards(AtGuard)
    @Delete('/user/rate/delete')
    async deleteUserRate(@Query('seriesName') seriesName:string,@GetCurrentUserId() userId:number){
        return await this.service.deleteUserRate(userId,seriesName)
    }
    @UseGuards(AtGuard)
    @Get('/user/rates')
    async getUserRates(@GetCurrentUserId() userId:number,@Query('seriesNames') seriesNames:any[]){
        return await this.service.getUserRates(userId,seriesNames);
    }
    @Public()
    @Get('/item')
    async getInfo(@Query('seriesName') query:string){
        return await this.service.getInfo(query)
    }
    @UseGuards(AdminGuard)
    @Post('/item')
    async assignInfo(@Body() dto:InfoDto){
        try{
            return await this.service.assignInfo(dto)
        }
        catch(err){
            throw new BadRequestException(`Cannot assign info series! ${err}`)
        }
    }

    @UseGuards(AdminGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Post('/upload/video')
    async postVideo(@UploadedFile() file: Express.Multer.File,@Body('episode') episode:number,@Body('seriesName') seriesName:string,@Body('voice') voice:string){
        try{
            const pathName = path.join(__dirname,"..",`..`,`..`,`video/${seriesName}/${voice}/${Number(episode)}`);
            const isExist = await this.service.checkFolderExists(pathName);
            if(!isExist){
                await fs.mkdir(pathName,{recursive:true}).catch((err)=>{
                    console.error(err);
                    
                });
            }
            const writePathName = path.join(pathName,`${seriesName}.mp4`)
            await fs.writeFile(writePathName,file.buffer).catch((err)=>{
                throw new BadRequestException(`Can't save file to path!\n${err}`);
            })
            return await this.videoService.videoUpload(seriesName,Number(episode),voice)
        }catch(err){
            console.error(`EROR: ${err}`);
            
            throw new BadRequestException(`Couldn't upload the video!Error: ${err}`)
        }
    }
    @UseGuards(AtGuard)
    @Put('/item/rate')
    async setRateSeries(@Body('seriesName') seriesName:string,@Body('value') value:number,@GetCurrentUserId() userId:number){
        return await this.service.setRateSeries(seriesName,Number(value),Number(userId));
    }
    @Public()
    @Get('/item/rate')
    async getSeriesRate(@Query('seriesName') seriesName:string){
        return await this.service.getSeriesRate(seriesName);
    }
    @UseGuards(AtGuard)
    @Get('/user/rate')
    async getUserRate(@Query('seriesName') seriesName:string,@GetCurrentUserId() userId:number){
        return await this.service.getUserRate(seriesName,Number(userId));
    }
    @Public()
    @Get('/items/rate')
    async getItemsRate(@Query('seriesNames') seriesNames:string[],@Req() req:Request){
        let userId:number | null;
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1]; // Extract token
                const decoded: any = this.jwtService.decode(token); // Decode JWT
                userId = Number(decoded?.sub) || null;
            } catch (err) {
                console.error('Invalid token:', err);
            }
        }
        return await this.service.getItemsRate(seriesNames,userId);
    }
    @Public()
    @Get('/search')
    async itemSearch(@Query('param') seriesName:string,@Query('skip') skip:number){
        return await this.service.findSeries(seriesName,Number(skip));
    }
    @UseGuards(AdminGuard)
    @Delete('/item')
    async deleteSeries(@Query('seriesName') seriesName:string){
        return await this.service.deleteSeries(seriesName);
    }
    /* @Public()
    @Post('/delete')
    async getName(){
        return await this.service.deleteIs();
    } */
    /* @Public()
    @Patch('/patch')
    async refreshInfo(@Body() seriesName:any){
        return this.service.refreshInfo(seriesName)
    } */
    @Public()
    @Get(':seriesName/:voice/:episode/:quality')
    async getVideo(@Param('seriesName') seriesName:string,
                @Param('voice') voice:string,
                @Param('quality') quality:string,
                @Param('episode') episode:number,
                @Res() res:Response){
        console.log('Raw voice parameter:', voice);
        console.log('Decoded voice parameter:', decodeURIComponent(voice));
        const file = path.join(__dirname,'..','..','..',`video/${seriesName}/${decodeURIComponent(voice)}/${episode}/${quality}.mp4`);
    
        
        if (fsSync.existsSync(file)) {
            return res.sendFile(file);
          } else {
            return res.status(404).send('File not found');
          }
    }
    @Public()
    @Get('/top')
    async getTop(@Req() req:Request){
        let userAuthId:number | null;
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1]; // Extract token
                const decoded: any = this.jwtService.decode(token); // Decode JWT
                userAuthId = Number(decoded?.sub) || null;
            } catch (err) {
                console.error('Invalid token:', err);
            }
        }
        return await this.service.getTop(userAuthId);
    }
}


@Controller('/videoFormat')
export class VideoFormatter{
    constructor(private service:VideoFormatterService){}
    @Public()
    @Post()
    /* async uploadVideo(@Body('videoUrl') videoUrl:string,
                      @Body('numOfEpisode') numOfEpisode:number,
                      @Body('seriesName') seriesName:string,
                      @Res() res:Response){
    try {
        const result = await this.service.videoUpload(videoUrl,seriesName,numOfEpisode);
         // Передаем URL на обработку
        return res.json(result);
        } catch (err) {
            console.error('Ошибка при обработке видео:', err);
            return res.status(500).json({ message: 'Ошибка при обработке видео' });
        }
    } */
    @Public()
    @Get('/getRoute')
    async getRoute(@Query('seriesName') seriesName:string,
                    @Query('quality') quality:string,
                    @Req() req:Request,
                    @Res() res:Response){
                        try {
                            const filePath = await this.service.getRoute(seriesName, quality);
                            if (filePath) {
                                console.log('Sending file path:', filePath);
    
                                return res.status(200).json({filePath}); // Отправляем путь в ответе
                            } else {
                                return res.status(404).json({ message: 'Файл не найден' });
                            } 
                        } catch (err) {
                            console.error('Ошибка при обработке видео:', err);
                            return res.status(500).json({ message: 'Ошибка при обработке видео' });
                        }
    }
    @Public()
    @Get('/getVideo')
    async getVideo(@Query('path') videoPath:string,@Req() req:Request,@Res() res:Response){
        
        try {

            const range = req.headers['range'];
            if (!range) {
                res.status(404).send('Requires range')
            }
            const CHUNK_SIZE = 10 ** 6;
            const fullPath = path.join(__dirname,`..`,`..`,`..`,`${videoPath}`);
            console.log('IS FULLPATH!!!!!!!!!!!!!!!!!!!!!!!: ',fullPath);
            
            const videoSize = fsSync.statSync(fullPath).size;
            const start = Number(range.replace(/\D/g, ''));
            const end = Math.min(start + CHUNK_SIZE,videoSize - 1); // 1 MB block

            const contentLength = end - start + 1;
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${videoSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength,
                'Content-Type': 'video/mp4',
            };
            const videoStream = fsSync.createReadStream(fullPath, { start, end });
            res.writeHead(206, headers);
            videoStream.pipe(res);
        } catch (error) {
            console.error('Error sending video:', error);
            res.status(500).send(`Error sending video: ${error}`);
        }
    }
    @Public()
    @Get(':seriesName-:episode/:resolution/:segmentName')
    getSegment(
      @Res() res: Response,
      @Param('seriesName') seriesName: string,
      @Param('episode') episode: number,
      @Param('resolution') resolution: string,
      @Param('segmentName') segmentName: string,
    ) {
        const filePath = path.join(__dirname, 'src', 'video', seriesName, resolution, segmentName);
        console.log('FILEPATH',filePath);
        
        res.sendFile(filePath, { root: '.' }, (err) => {
          if (err) {
            console.error(err);
            res.status(404).send('File not found');
          }
        });
    }
}
