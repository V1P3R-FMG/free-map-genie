export default function minimize(data: object, defaultData: object) {

    function helper(data: any, defaultData?: any) {
        switch (typeof data) {
            case "object":

                if (typeof defaultData !== "object") {
                    return data;
                }

                var o: any = data instanceof Array ? [] : {}, c = 0;
                for (var key in data) {
                    var val = helper(data[key], defaultData[key]);
                    if (val !== undefined) {
                        o[key] = val;
                        c++;
                    }
                }
                return c > 0 ? o : undefined;

            default:
                return data !== defaultData ? data : undefined;
        }        
    }

    return helper(data, defaultData);
}