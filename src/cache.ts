import { CacheableValue, ICache } from "./types"
import { createReadStream } from "node:fs"
import { writeFile, readFile, access, unlink } from "node:fs/promises"
import { join } from "node:path"

//Делаю вид что у меня есть Redis 

class Cache implements ICache {
    dir: string

    constructor(dir: string) {
        this.dir = dir
    }
    
    private async exists(path: string): Promise<boolean> {
        let flag = true
        await access(path).then(() => flag = true).catch(() => flag = false)
        return flag
    }

    private async setIfNotExists(key: string, reserveValue?: CacheableValue): Promise<void> {
        const path = join(this.dir, key)

        if(!await this.exists(path)) await this.set(key, reserveValue ?? "")
    }

    async get(key: string, reserveValue?: CacheableValue): Promise<any> {
        const path = join(this.dir, key)

        await this.setIfNotExists(key, reserveValue)

        const value = String(await readFile(path))
        
        try {
            return JSON.parse(value)
        } 
        catch {
            return value
        }
    }

    async stream(key: string, reserveValue?: CacheableValue): Promise<any> {
        const path = join(this.dir, key)

        await this.setIfNotExists(key, reserveValue)

        return createReadStream(path)
    }

    async set(key: string, value: Object | string) {
        const path = join(this.dir, key)
        writeFile(path, typeof value === "string"? value : JSON.stringify(value))
    }

    async clear(key: string) {
        const path = join(this.dir, key)
        unlink(path)
    }
}

export default Cache