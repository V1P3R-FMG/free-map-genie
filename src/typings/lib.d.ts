declare namespace Lib {

    export type Axios = {
        put(url: string): Promise<any>,
        post(url: string, data?: object|undefined): Promise<any>,
        delete(url: string): Promise<any>,
    }

    export type Toastr = {

        info(e, t?, n?): void,
        warning(e, t?, n?): void,
        error(e, t?, n?): void,

        remove(t): void,
        clear(e, t): void,
        
        getContainer(t, n): void,
        subscribe(e): void,
        
        success(e, t, n): void,
        
        options: object,
        version: string,
    }
}