import { AbstractCommandModule, Message } from "botyo-api";
import * as url from "url";
import { Readable } from "stream";
import DuplexThrough from "./DuplexThrough";
import * as request from "request";
import * as GoogleImages from "google-images";
import * as mime from "mime-types";
import * as path from "path";

export default class ShowMeCommand extends AbstractCommandModule
{
    private readonly imagesClient: any;

    private readonly defaultImageCount: number;
    private readonly maxImageCount: number;

    constructor()
    {
        super();

        const config = this.getRuntime().getConfiguration();
        this.defaultImageCount = config.getOrElse("defaultImageCount", 1);
        this.maxImageCount = config.getOrElse("maxImageCount", 9);

        this.imagesClient = new GoogleImages(
            config.getProperty("cseId"),
            config.getProperty("cseApiKey")
        );
    }

    getCommand(): string
    {
        return "showme";
    }

    getDescription(): string
    {
        return "Returns the first few images found in Google Images matching the query";
    }

    getUsage(): string
    {
        return "[numberOfImages] <query>";
    }

    validate(msg: Message, args: string): boolean
    {
        if (!args) return false;

        const opts = this.parseArgs(args);
        if (!opts) return false;
        if (!opts.query) return false;

        return true;
    }

    async execute(msg: Message, args: string): Promise<any>
    {
        const opts = this.parseArgs(args);
        if (opts === undefined) return;

        const urls = await this.getImageUrls(opts.query, opts.imageCount);

        const streams = urls.map(ShowMeCommand.createStreamForUrl);

        return this.getRuntime().getChatApi().sendMessage(msg.threadID, { attachment: streams });
    }

    private async getImageUrls(query: string, imageCount: number): Promise<string[]>
    {
        const images = await this.imagesClient.search(query);

        return images.slice(0, imageCount).map((i: any) => i.url);
    }

    private parseArgs(args: string)
    {
        const m = args.match(/(\d+)\b(.*)|(.+)/);
        if (m === null) return undefined;

        const query = (m[2] || m[3] || m[1]).trim();
        const parsedImageCount = parseInt((m[2] ? m[1] : this.defaultImageCount) as any);
        const normalizedImageCount = Math.max(1, Math.min(this.maxImageCount, parsedImageCount));

        return {
            query: query,
            imageCount: normalizedImageCount
        };
    }

    private static createStreamForUrl(theUrl: string): Readable
    {
        const dt = new DuplexThrough({ highWaterMark: 64 * 1024 });


        const pathname = url.parse(theUrl).pathname;
        const mimeType = mime.lookup(pathname as string);
        let extension = path.extname(pathname as string);
        // fallback to jpg if the extension is missing or not one for an image
        if (!mimeType || mimeType.split("/")[0] != "image") {
            extension = ".jpg";
        }

        // Hack alert! Trick request into thinking this is a stream created by fs.createReadStream
        // so that it guesses the mime-type by the pathname.
        (dt as any).path = pathname + extension;
        (dt as any).mode = 1; // doesn't really matter

        request.get(theUrl).pipe(dt);

        return dt;
    }
}